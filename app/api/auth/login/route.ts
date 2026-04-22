import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// POST
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { identifier, password } = await req.json();

        if (!identifier || !password) {
            return NextResponse.json({ message: 'Please fill in all fields.' }, { status: 400 });
        }

        // find user by email or username depending on what was entered
        const isEmail = identifier.includes('@');
        const user = await User.findOne(
            isEmail ? { email: identifier } : { username: identifier }
        );

        if (!user) {
            // deliberately vague so we don't reveal whether an account exists
            return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
        }

        // check if account has been verified
        if (!user.verified) {
            return NextResponse.json(
                { message: 'Please verify your email before logging in.' },
                { status: 403 }
            );
        }

        // compare entered password against the hashed password in the DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
        }

        // return safe user data (never return the password)
        const { password: _, verificationToken: __, ...safeUser } = user.toObject();
        return NextResponse.json({ user: safeUser }, { status: 200 });

    } catch (err) {
        return NextResponse.json({ message: 'Login failed.', error: (err as Error).message }, { status: 500 });
    }
}