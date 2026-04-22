import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import Destination from '@/lib/models/Destination';

/* created by: Alen */
/* EDIT POST */
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    await dbConnect();
    try {
        const { id } = await params;
        const { userId, tags, caption, images } = await req.json();

        // if tags are being updated then validate them
        if (tags !== undefined && (tags.length < 1 || tags.length > 3 )) {
            return NextResponse.json(
                { error: 'Between 1 and 3 tags are required' },
                { status: 400 }
            );
        }

        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({ error: 'Post was not found' }, { status: 404 });
        }

        // auth is now handled via localstorage userId
        if (post.userId.toString() !== userId) {
            return NextResponse.json({ error: 'You Are Unauthorized' }, { status: 403 });
        }

        // the city should be locked after creation so destinationId can be ignored if someone sends it
        if (tags) post.tags = tags;
        if (caption !== undefined) post.caption = caption;
        if (images) post.images = images;

        await post.save();

        return NextResponse.json({ success: true, post });

    } catch (error) {
        console.error('Error editing post:', error);
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}

/* DELETE POST */
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    await dbConnect();
    try {
        const { id } = await params;
        const { userId } = await req.json();

        //look for the post we are deleting based on its id
        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // auth is now handled via localstorage userId
        //if the userId does not match the userId of the post then they are not authorized to delete it
        if (post.userId.toString() !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await Post.findByIdAndDelete(id);

        // user personal rankings clean up
        await User.updateOne(
            { _id: userId },
            { $pull: { myRankings: { destinationId: post.destinationId } } }
        );

        // update global city stats so the city detail page can stay accurate
        await Destination.findByIdAndUpdate(post.destinationId, {
            $inc: { postCount: -1 }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete post error:', error);
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}

/* GET POST */
// the difference between this GET and my GET already in posts/route.ts is that this GET will retrieve a single post
// this is so that edit post can fetch a single post
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    await dbConnect();
    try {
        const { id } = await params;

        const post = await Post.findById(id)
            .populate('userId', 'username')
            .populate('destinationId', 'name');

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json({ post });
    } catch (error) {
        console.error('Fetch post error:', error);
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}