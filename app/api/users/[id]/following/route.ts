import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// GET
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();

        const user = await User.findById(params.id).populate('following', 'username email');
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        return NextResponse.json(user.following, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: 'Failed to fetch following.', error: (err as Error).message }, { status: 500 });
    }
}