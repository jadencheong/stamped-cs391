// app/posts/[id]/edit/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import PostForm from '@/components/PostForm';
import { Tag } from '@/lib/tags';
import { useUserId } from "@/lib/hooks/useUserId";

/* created by Alen */

type Post = {
    _id: string;
    userId: { _id: string; username: string };
    destinationId: { _id: string; name: string };
    tags: Tag[];
    caption: string;
    images: string[];
};

const Wrapper = styled.div`
  max-width: 480px;
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
  color: #9ca3af;
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 1.5rem;
  cursor: pointer;
  &:hover { color: #6b7280; }
`;

export default function EditPostPage() {
    const { id } = useParams();
    const router = useRouter();
    const { userId, ready } = useUserId();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) return;

        const fetchPost = async () => {
            try {
                const res  = await fetch(`/api/posts/${id}`);
                const data = await res.json();

                if (!res.ok) {
                    setError('Post not found.');
                    return;
                }

                // only the owner should be able to access this page
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
    }, [id, userId]);

    //we return different texts based on the status
    if (!ready || loading) return <Wrapper><StatusText>Loading...</StatusText></Wrapper>;
    if (error) return <Wrapper><ErrorText>{error}</ErrorText></Wrapper>;
    if (!post) return null;

    return (
        <Wrapper>
            <BackButton onClick={() => router.back()}>← Back</BackButton>
            <Heading>Edit post</Heading>
            <PostForm
                mode="edit"
                userId={userId!}
                destinationId={post.destinationId._id}
                destinationName={post.destinationId.name}
                existingPost={{
                    _id: post._id,
                    tags: post.tags,
                    caption: post.caption,
                    images: post.images,
                }}
            />
        </Wrapper>
    );
}