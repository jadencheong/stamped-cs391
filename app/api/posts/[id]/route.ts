import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import Destination from '@/lib/models/Destination';

/* EDIT POST */
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    await dbConnect();
    try {
        const { userId, tags, caption, images } = await req.json();

        const post = await Post.findById(params.id);
        if (!post) {
            return NextResponse.json({ error: 'Post was not found' }, { status: 404 });
        }

        // TODO: i think once auth is implement this probably needs to be changed to session based but lmk
        if (post.userId.toString() !== userId) {
            return NextResponse.json({ error: 'You Are Unauthorized' }, { status: 403 });
        }

        // the city should be locked after creation so destinationId can be ignored if someone sends it
        const tagsChanged = tags && JSON.stringify(tags) !== JSON.stringify(post.tags);

        if (tags)    post.tags    = tags;
        if (caption !== undefined) post.caption = caption;
        if (images)  post.images  = images;

        await post.save();

        // based on the roadmap a change in tags causes some typee of re duel to be triggered
        return NextResponse.json({ success: true, post, triggerReDuel: tagsChanged });

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
        const { userId } = await req.json();

        const post = await Post.findById(params.id);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // TODO: i think once auth is implement this probably needs to be changed to session based but lmk
        if (post.userId.toString() !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await Post.findByIdAndDelete(params.id);

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