import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

const resend = new Resend(process.env.RESEND_API_KEY); // Add to .env file!!
console.log('API KEY:', process.env.RESEND_API_KEY);

// POST
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { username, email, password } = await req.json();

        console.log('1. received signup request for:', email);

        if (!password || password.length < 8) {
            return NextResponse.json({ message: 'Password must be at least 8 characters.' }, { status: 400 });
        }

        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return NextResponse.json({ message: 'Username or email already in use.' }, { status: 409 });
        }

        console.log('2. user does not exist yet, creating...');

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        await User.create({
            username,
            email,
            password: hashedPassword,
            verificationToken,
            verified: true
        });

        console.log('3. user created, sending email...');

        const emailResult = await resend.emails.send({
            from: 'Stamped <onboarding@resend.dev>',
            to: email,
            subject: 'Verify your Stamped account',
            html: `<p>Hey ${username}!</p>
                   <p>Click below to verify your account:</p>
                   <a href="${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${verificationToken}">
                     Verify my account
                   </a>`
        });

        console.log('4. email result:', emailResult);

        return NextResponse.json({ message: 'Account created! Check your email.' }, { status: 201 });
    } catch (err) {
        console.error('SIGNUP ERROR:', err);
        return NextResponse.json({ message: 'Failed to create user.', error: (err as Error).message }, { status: 500 });
    }
}