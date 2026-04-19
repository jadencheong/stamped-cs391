import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// POST
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { username, email } = await req.json();

        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return NextResponse.json({ message: 'Username or email already in use.' }, { status: 409 });
        }

        const user = await User.create({ username, email });
        return NextResponse.json(user, { status: 201 });
    } catch (err) {
        return NextResponse.json({ message: 'Failed to create user.', error: (err as Error).message }, { status: 500 });
    }
}
