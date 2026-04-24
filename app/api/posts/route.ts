import {NextRequest, NextResponse} from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
// jaden — for updating tags on Destination details page
import Destination from '@/lib/models/Destination';

/* crated by: Alen */
/* CREATE POST */
/* Ellen edit: added userId as part of GET route */

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { userId, destinationId, tags, caption, images } = await req.json();

        // both a user and a destination are needed to make a post
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

        // Jaden's part
        // increment tag counts on Destination document
        // for each tag on the post, find matching tag in city.tags array and incrementing count
        // if tag doesn't exist yet — add it with count 1
        for (const tag of tags) {
            // try to increment existing tag
            const updated = await Destination.findOneAndUpdate(
                { _id: destinationId, 'tags.label': tag },
                { $inc: { 'tags.$.count': 1 } }
            );

            // if tag didn't exist on this city yet, add it
            if (!updated) {
                await Destination.findByIdAndUpdate(destinationId, {
                    $push: { tags: { label: tag, count: 1 } }
                });
            }
        }
        // end of jaden's part

        // add destination to user's personal rankings so that the duel system can find it
        // should only insert if not already there
        await User.findOneAndUpdate(
            { _id: userId, 'myRankings.destinationId': { $ne: destinationId } },
            { $push: { myRankings: { destinationId, personalElo: 1000 } } },
            { new: true }
        );

        // count posts in db
        const actualPostCount = await Post.countDocuments({ userId });

        return NextResponse.json({ 
            success: true, 
            post, 
            totalPosts: actualPostCount // send the post count
        }, { status: 201 });

        } catch (error) {
            console.error('Create post error:', error);
            return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
        }
    }

/* GET ALL POSTS */
export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        const userId = req.nextUrl.searchParams.get('userId');

        // build query — filter by userId if provided, otherwise return all
        const query = userId ? { userId } : {};

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .populate('userId', 'username')        // show author username and not just id
            .populate('destinationId', 'name');    // show city name and not just id

        return NextResponse.json({ posts });
    } catch (error) {
        console.error('Fetch posts error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}