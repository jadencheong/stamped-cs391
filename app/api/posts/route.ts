import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';

/* crated by: Alen */
/* CREATE POST */

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { userId, destinationId, tags, caption, images } = await req.json();

        if (!userId || !destinationId) {
            return NextResponse.json(
                { error: 'A userId and a destinationId are required' },
                { status: 400 }
            );
        }

        // tags are now added to the schema, min 1, max 3 per the roadmap
        if (!tags || tags.length < 1 || tags.length > 3) {
            return NextResponse.json(
                { error: 'Between 1 and 3 tags are required' },
                { status: 400 }
            );
        }

        // should only be one post per city
        const existing = await Post.findOne({ userId, destinationId });
        if (existing) {
            // I returned 409 so the frontend should route to Edit and the post can get fixed
            return NextResponse.json(
                { error: 'ALREADY_POSTED', postId: existing._id },
                { status: 409 }
            );
        }

        const post = await Post.create({ userId, destinationId, tags, caption, images });

        // add destination to user's personal rankings so that the duel system can find it
        // should only insert if not already there
        await User.updateOne(
            { _id: userId, 'myRankings.destinationId': { $ne: destinationId } },
            { $push: { myRankings: { destinationId, personalElo: 1000 } } }
        );

        return NextResponse.json({ success: true, post }, { status: 201 });

    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}

/* GET ALL POSTS */
export async function GET() {
    await dbConnect();
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'username')        // show author username and not just id
            .populate('destinationId', 'name');    // show city name and not just id

        return NextResponse.json({ posts });
    } catch (error) {
        console.error('Fetch posts error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}