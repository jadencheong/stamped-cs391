import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    try {
        const user = await User.findById(userId).lean(); // .lean() makes it a plain JS object
        if (!user) return NextResponse.json({ count: 0 });

        // Use a filter that catches missing fields AND zeros
        const undueled = user.myRankings.filter((r: any) => 
            r.timesDuelled === undefined || 
            r.timesDuelled === null || 
            r.timesDuelled === 0
        );

        return NextResponse.json({ count: undueled.length });
    } catch (error) {
        return NextResponse.json({ count: 0 });
    }
}