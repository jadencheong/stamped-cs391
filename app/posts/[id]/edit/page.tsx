// app/posts/[id]/edit/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import PostForm from '@/components/PostForm';
import { Tag } from '@/lib/tags';
import { useUserId } from "@/lib/hooks/useUserId";

/* created by Alen */


/**
 *
 * edit post page fetches a single post by ID and renders PostForm in edit mode
 * pre-populates the form with the post's existing tags, caption, and images
 *
 * ownership is verified client-side before rendering the form
 * PATCH route verifies ownership server-side
 */
type Post = {
    _id: string;
    userId: { _id: string; username: string };
    destinationId: { _id: string; name: string };
    tags: Tag[];
    caption: string;
    images: string[]; //Cloudinary urls
};

const Wrapper = styled.div`
  max-width: 80vw;
  margin: 0 auto;
  padding: 1.5rem 1rem;
`;

const Heading = styled.p`
  font-family: 'Unbounded', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.5rem;
`;

const StatusText = styled.p`
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
  padding: 4rem 0;
`;

const ErrorText = styled.p`
  font-size: 13px;
  color: #ef4444;
  text-align: center;
  padding: 4rem 0;
`;

const BackButton = styled.button`
  font-size: 12px;
  color: #326273;
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 1.5rem;
  cursor: pointer;
  &:hover { color: #BF7245; }
`;

export default function EditPostPage() {
    // id comes from the url
    const { id } = useParams();
    const router = useRouter();
    //reads from local storage and is true once checked
    const { userId, ready } = useUserId();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // wait until userId is available from localStorage before fetching
        if (!userId) return;

        const fetchPost = async () => {
            try {
                //fetch single post with populated userId and destinationId
                const res  = await fetch(`/api/posts/${id}`);
                const data = await res.json();

                if (!res.ok) {
                    setError('Post not found.');
                    return;
                }

                //client side ownership check prevents other users from
                // accessing edit page even if they know the post ID
                // the PATCH route checks ownership server side
                if (data.post.userId._id !== userId) {
                    setError('You are not authorized to edit this post.');
                    return;
                }

                setPost(data.post);
            } catch {
                setError('Failed to load post.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, userId]); //re-run if id or userId changes

    //we return different texts based on the status
    // show loading until both localstorage and the post fetch are done
    if (!ready || loading) return <Wrapper><StatusText>Loading...</StatusText></Wrapper>;
    if (error) return <Wrapper><ErrorText>{error}</ErrorText></Wrapper>;
    if (!post) return null;

    return (
        <Wrapper>
            {/* router.back() returns to whatever page the user came from */}
            <BackButton onClick={() => router.back()}>← Back</BackButton>
            <Heading>Edit post</Heading>
            {/* PostForm in edit mode, pre-populated with existing post data
            city is locked but cannot be changed inside PostForm when in edit mode*/}
            <PostForm
                mode="edit"
                userId={userId!} // this is safe as we checked !ready above
                destinationId={post.destinationId._id}
                destinationName={post.destinationId.name}
                existingPost={{
                    _id: post._id,
                    tags: post.tags,
                    caption: post.caption,
                    images: post.images, //pre-populates image previews in the form
                }}
            />
        </Wrapper>
    );
}