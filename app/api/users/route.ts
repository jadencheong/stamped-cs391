import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

const resend = new Resend(process.env.RESEND_API_KEY);

// POST
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { username, email, password } = await req.json();

        // requires user to input a password that is at least 8 characters
        if (!password || password.length < 8) {
            return NextResponse.json({ message: 'Password must be at least 8 characters.' }, { status: 400 });
        }

        // does not allow duplicate emails or usernames
        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return NextResponse.json({ message: 'Username or email already in use.' }, { status: 409 });
        }

        // bcrypt is used to hash the password for further security
        const hashedPassword = await bcrypt.hash(password, 10);

        // crypto is used to generate a unique, random string that is used for the verification
        const verificationToken = crypto.randomBytes(32).toString('hex');

        await User.create({
            username,
            email,
            password: hashedPassword,
            verificationToken,
            verified: true
        });

        // Resend API is used to send an outgoing email to the user
        // verification is successful if the link clicked matches the verificationToken
        //
        // This is intentionally best-effort: `verified` is already set true
        // above at account creation, and login does not depend on this email
        // ever being sent or clicked. A Resend failure (e.g. its sandbox
        // sender only allows sending to the account owner's own email until
        // a custom domain is verified) should never fail account creation,
        // which had already succeeded by this point.
        try {
            await resend.emails.send({
                from: 'Stamped <onboarding@resend.dev>',
                to: email,
                subject: 'Verify your Stamped account',
                html: `<p>Hey ${username}!</p>
                       <p>Click below to verify your account:</p>
                       <a href="${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${verificationToken}">
                         Verify my account
                       </a>`
            });
        } catch (emailErr) {
            console.error('Signup verification email failed to send (non-blocking):', emailErr);
        }

        return NextResponse.json({ message: 'Account created! Check your email.' }, { status: 201 });
    } catch (err) {
        console.error('SIGNUP ERROR:', err);
        return NextResponse.json({ message: 'Failed to create user.', error: (err as Error).message }, { status: 500 });
    }
}