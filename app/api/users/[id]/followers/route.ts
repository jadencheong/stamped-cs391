import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// get function for retrieving user's followers
// GET
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();

        const user = await User.findById(params.id).populate('followers', 'username email');
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        return NextResponse.json(user.followers, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: 'Failed to fetch followers.', error: (err as Error).message }, { status: 500 });
    }
}