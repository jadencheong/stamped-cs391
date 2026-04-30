import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// created by Anna

/**
 * api/duel/count/route.ts
 * FILE OVERVIEW:
 * 
 * This GET route calculates the number of "undueled" destinations 
 * for a specific user. It is primarily used by the DuelIcon component to 
 * display a real-time notification badge. By identifying items with zero 
 * recorded duels, it helps prompt the user to start a new 'Challenger' 
 * gauntlet and helps keep track of duels within the undueled queue.
 * 
 */


// GET handler for notification count logic 
export async function GET(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    try {
        const user = await User.findById(userId).lean(); // .lean() makes it a plain JS object
        if (!user) return NextResponse.json({ count: 0 });

        // use a filter that catches missing fields AND zeros
        const undueled = user.myRankings.filter((r: any) => 
            r.timesDuelled === undefined || 
            r.timesDuelled === null || 
            r.timesDuelled === 0
        );

        return NextResponse.json({ count: undueled.length });
    } catch (error) {
        // fail with a count of 0 to avoid breaking the UI
        return NextResponse.json({ count: 0 });
    }
}