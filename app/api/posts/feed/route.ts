import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';

/* created by Alen */

export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page') ?? '1');
        const limit = 20;

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        //return either an empty array if you are not following anyone or
        //return an array of the ids of people you are following
        const followingIds = user.following ?? [];

        // if you are not following anyone, then your feed should be empty
        if (followingIds.length === 0) {
            return NextResponse.json({ posts: [], page, hasMore: false });
        }

        const posts = await Post.find({ userId: { $in: followingIds } })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'username')
            .populate('destinationId', 'name placeName country photoUrl');

        return NextResponse.json({ posts, page, hasMore: posts.length === limit });

    } catch (error) {
        console.error('Feed error:', error);
        return NextResponse.json({ error: 'Failed to load feed' }, { status: 500 });
    }
}