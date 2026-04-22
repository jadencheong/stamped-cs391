'use client';
import { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import PostCard from '@/components/PostCard';

/* created by Alen */

// TODO: replace this once we are done with real auth
const HARDCODED_USER_ID = '000000000000000000000001';

type Post = {
  _id: string;
  userId: { _id: string; username: string };
  destinationId: { _id: string; name: string };
  tags: string[];
  caption: string;
  images: string[];
};

const Page = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
`;

const FeedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 1rem;
`;

const EmptyTitle = styled.p`
  font-family: 'Unbounded', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px;
`;

const EmptySubtitle = styled.p`
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
`;

const LoadMoreButton = styled.button`
  width: 100%;
  margin-top: 12px;
  padding: 12px;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  color: #6b7280;
`;

const ErrorText = styled.p`
  text-align: center;
  font-size: 13px;
  color: #ef4444;
  padding: 2rem 0;
`;

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchPosts = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
          `/api/posts/feed?userId=${HARDCODED_USER_ID}&page=${pageNum}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError('Failed to load feed.');
        return;
      }

      if (pageNum === 1 && data.posts.length === 0) {
        setIsEmpty(true);
        return;
      }

      setPosts(prev => pageNum === 1 ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.hasMore);

    } catch {
      setError('Network error, please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // load first page on mount
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  return (
      <Page>
        {error && <ErrorText>{error}</ErrorText>}

        {isEmpty ? (
            <EmptyState>
              <EmptyTitle>Nothing here yet</EmptyTitle>
              <EmptySubtitle>
                Try following some people and see their posts here.
              </EmptySubtitle>
            </EmptyState>
        ) : (
            <>
              <FeedList>
                {posts.map(post => (
                    <PostCard
                        key={post._id}
                        post={post as any}
                        currentUserId={HARDCODED_USER_ID}
                    />
                ))}
              </FeedList>

              {hasMore && (
                  <LoadMoreButton onClick={loadMore} disabled={loading}>
                    {loading ? 'Loading...' : 'Load more'}
                  </LoadMoreButton>
              )}
            </>
        )}
      </Page>
  );
}