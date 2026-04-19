/* post card style for loading into feed and for veiwing posts*/
/* created by Alen */

'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Tag } from '@/lib/tags';

type Post = {
    _id: string;
    userId:        { _id: string; username: string };
    destinationId: { _id: string; name: string };
    tags:    Tag[];
    caption: string;
    images:  string[];
};

type Props = {
    post: Post;
    currentUserId?: string;
};

const Card = styled.div`
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem 1.25rem 0.75rem;
`;

const CityName = styled.p`
  font-family: 'Unbounded', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 3px;
`;

const Username = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
`;

const OwnerActions = styled.div`
  display: flex;
  gap: 8px;
`;

const EditLink = styled(Link)`
  font-size: 11px;
  color: #2563eb;
`;

const DeleteButton = styled.button`
  font-size: 11px;
  color: #ef4444;
  background: none;
  border: none;
  padding: 0;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 1.25rem 0.75rem;
`;

const TagPill = styled.span<{ $variant: 'blue' | 'orange' }>`
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 99px;
  background: #fff7ed;
  color: #c2410c;
  border: 0.5px solid dodgerblue;
`;

const Caption = styled.p`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  padding: 0 1.25rem 0.75rem;
  margin: 0;
`;

const PostImage = styled.img`
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  display: block;
`;

export default function PostCard({ post, currentUserId }: Props) {
    const router = useRouter();
    const isOwner = currentUserId === post.userId._id;

    const tagVariant = (i: number): 'blue' | 'orange' => i % 2 === 0 ? 'blue' : 'orange';

    const handleDelete = async () => {
        const res = await fetch(`/api/posts/${post._id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId }),
        });

        if (res.ok) {
            router.refresh();
        }
    };

    return (
        <Card>
            <Header>
                <div>
                    <CityName>{post.destinationId.name}</CityName>
                    <Username>@{post.userId.username}</Username>
                </div>

                {isOwner && (
                    <OwnerActions>
                        <EditLink href={`/posts/${post._id}/edit`}>Edit</EditLink>
                        <DeleteButton onClick={handleDelete}>Delete</DeleteButton>
                    </OwnerActions>
                )}
            </Header>

            {post.tags?.length > 0 && (
                <TagList>
                    {post.tags.map((tag, i) => (
                        <TagPill key={tag} $variant={tagVariant(i)}>{tag}</TagPill>
                    ))}
                </TagList>
            )}

            {post.caption && <Caption>{post.caption}</Caption>}

            {post.images?.length > 0 && (
                <PostImage
                    src={post.images[0]}
                    alt={`${post.destinationId.name} photo`}
                />
            )}
        </Card>
    );
}