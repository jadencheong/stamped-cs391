/**
 * app/api/users/search/route.ts
 *
 * user search route — searches users by username
 * called by the user search UI on keystroke
 *
 * returns a list of matching users with their stats
 *
 * created by: Jaden
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get('q');

    // return empty if no query
    if (!q || q.trim() === '') {
        return NextResponse.json({ users: [] });
    }

    try {
        await dbConnect();

        // find users whose username contains search term
        // case-insensitive
        const users = await User.find({
            // $regex — pattern matching, query string can appear
            // anywhere in username (partial match)
            username: { $regex: q.trim(), $options: 'i' }
        })
            .limit(10)
            .select('username myRankings following followers')
            .lean();

        // strip user down to only what UI needs to display
        // exclude pw, email, verificationToken, verified from User document
        const results = users.map(user => ({
            _id: user._id,
            username: user.username,
            cityCount: user.myRankings?.length ?? 0,
            followerCount: user.followers?.length ?? 0,
            followingCount: user.following?.length ?? 0,
        }));

        return NextResponse.json({ users: results });

    } catch (err) {
        console.error('[/api/users/search]', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}