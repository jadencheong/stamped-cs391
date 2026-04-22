/**
 * app/api/users/[id]/follow/route.ts
 *
 * Handles follow and unfollow actions between users.
 * Accepts { currentUserId, action: 'follow' | 'unfollow' } in the request body.
 * Updates both the target user's followers array and the current user's following array.
 *
 * Created by: Ellen
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// POST /api/users/[id]/follow
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const { currentUserId, action } = await req.json();

        if (!currentUserId) {
            return NextResponse.json({ message: 'Not logged in.' }, { status: 401 });
        }

        if (currentUserId === id) {
            return NextResponse.json({ message: 'You cannot follow yourself.' }, { status: 400 });
        }

        if (action !== 'follow' && action !== 'unfollow') {
            return NextResponse.json({ message: 'Invalid action.' }, { status: 400 });
        }

        const [targetUser, currentUser] = await Promise.all([
            User.findById(id),
            User.findById(currentUserId),
        ]);

        if (!targetUser || !currentUser) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        if (action === 'follow') {
            // add to target's followers if not already there
            await User.findByIdAndUpdate(id, {
                $addToSet: { followers: currentUserId }
            });
            // add to current user's following if not already there
            await User.findByIdAndUpdate(currentUserId, {
                $addToSet: { following: id }
            });
        } else {
            // remove from target's followers
            await User.findByIdAndUpdate(id, {
                $pull: { followers: currentUserId }
            });
            // remove from current user's following
            await User.findByIdAndUpdate(currentUserId, {
                $pull: { following: id }
            });
        }

        return NextResponse.json({ message: `Successfully ${action}ed.` }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: 'Failed to update follow status.', error: (err as Error).message }, { status: 500 });
    }
}