import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

const resend = new Resend(process.env.RESEND_API_KEY); // Add to .env file!!

// POST
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const {username, email, password} = await req.json();

        if (!password || password.length < 8) {
            return NextResponse.json({ message: 'Password must be at least 8 characters.' }, { status: 400 });
        }

        const existing = await User.findOne({$or: [{email}, {username}]});
        if (existing) {
            return NextResponse.json({message: 'Username or email already in use.'}, {status: 409}); // 409: Conflict
        }

        // bcrypt is used to hash the passwords
        // salt rounds are the random characters added into the pw so two users with the same password will have different hashes
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a random token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Stores information in user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            verificationToken,
            verified: false
        });

        // Send the email
        await resend.emails.send({
            // Using Resend's built-in testing address since we don't have a real domain
            from: 'Stamped <onboarding@resend.dev>',
            to: email,
            subject: 'Verify your Stamped account',
            html: `<p>Hey ${username}!</p>
             <p>Click below to verify your account:</p>
             <a href="${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${verificationToken}"> <!-- Verification link -->
               Verify my account
             </a>`
        });

        return NextResponse.json({message: 'Account created! Check your email.'}, {status: 201});
    } catch (err) {
        return NextResponse.json({message: 'Failed to create user.', error: (err as Error).message}, {status: 500});
    }
}