import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// get function to verify user
// route never actually used because users are default verified
// GET
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const token = req.nextUrl.searchParams.get('token');

        if (!token) {
            return NextResponse.json({ message: 'Missing token.' }, { status: 400 });
        }

        const user = await User.findOneAndUpdate(
            { verificationToken: token },
            { verified: true, verificationToken: null }, // Making sure token is cleared once used
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 400 });
        }

        // Redirect to log-in or home page
        return NextResponse.redirect(new URL('/login', req.url));
    } catch (err) {
        return NextResponse.json({ message: 'Verification failed.', error: (err as Error).message }, { status: 500 });
    }
}