import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';

/**
 *
 * GET returns a paginated feed of posts from users
 * that the current user follows and sorts from most recent first
 *
 * pagination works by skipping (page - 1) * limit posts and returning the next limit posts
 * hasMore tells the frontend if there are more posts to load which can be loaded
 * using the load more button on the feed page
 *
 */

/* created by Alen */

export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        // default to page 1 if not provided
        const page = parseInt(searchParams.get('page') ?? '1');

        // number of posts per page, 20 is just standard
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
        // if undefined then default to empty array
        const followingIds = user.following ?? [];

        // if you are not following anyone, then your feed should be empty
        // this avoids an unnecessary database query
        if (followingIds.length === 0) {
            return NextResponse.json({ posts: [], page, hasMore: false });
        }

        // $in matches any post whose userId is in the following Ids array
        const posts = await Post.find({ userId: { $in: followingIds } })
            .sort({ createdAt: -1 }) // most recent first
            .skip((page - 1) * limit) // skip posts from previous pages
            .limit(limit) // return one page worth of posts
            // populate swamps raw ObjectIds for actual document data
            .populate('userId', 'username')
            .populate('destinationId', 'name placeName country imageUrl'); // city details for postcard


        //hasMore tells the frontend if it should show the "load more" button
        // if exaclty 'limit' posts, then likely more to load, else we've reached the end
        return NextResponse.json({ posts, page, hasMore: posts.length === limit });

    } catch (error) {
        console.error('Feed error:', error);
        return NextResponse.json({ error: 'Failed to load feed' }, { status: 500 });
    }
}