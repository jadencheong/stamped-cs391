import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// Retrieve user profile
// GET
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await User.findById(id)
            .populate('following', 'username')
            .populate('followers', 'username');

        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 }); // 404: Not found
        }

        return NextResponse.json(user, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: 'Failed to fetch user.', error: (err as Error).message }, { status: 500 });
    }
}

// Edit username of profile
// PUT
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        const body = await req.json();

        const allowedUpdates = ['username'];
        const updates = Object.fromEntries(
            Object.entries(body).filter(([key]) => allowedUpdates.includes(key))
        );

        // Update username
        if (updates.username) {
            const existingUsername = await User.findOne({
                username: updates.username,
                _id: { $ne: id },
            });
            if (existingUsername) {
                return NextResponse.json({ message: 'Username already in use.' }, { status: 409 });
            }
        }

        const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: 'Failed to update user.', error: (err as Error).message }, { status: 500 });
    }
}

// DELETE
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully.' }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: 'Failed to delete user.', error: (err as Error).message }, { status: 500 });
    }
}
