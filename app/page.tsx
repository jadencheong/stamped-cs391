'use client';
import { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { useUserId } from "@/lib/hooks/useUserId";

/* created by Alen */

/**
 *
 * home feed page shows the posts from users the current user follows
 * sorted most recent first, paginated in groups of 20
 *
 * if not following anyone, show an empty state with a
 * "Find People" button to find people to follow
 *
 */

type Post = {
  _id: string;
  userId: { _id: string; username: string };
  destinationId: { _id: string; name: string };
  tags: string[];
  caption: string;
  images: string[];
};

const Page = styled.div`
  max-width: 55vw;
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

// always visible at the top of feed and encourages users to find
// and follow people so their feed is not empty
const FindPeopleButton = styled(Link)`
  display: block;
  width: fit-content;
  margin: 0 auto 1.5rem;
  padding: 10px 20px;
  background: #326273;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  border-radius: 99px;
  text-decoration: none;
`;

// END OF STYLED COMPONENTS

export default function FeedPage() {
  // useUserId reads from local storage and ready will be true once it is checked
  // without ready, the feed would try to fetch with userId being null on the first render
  // this would show a flase "Failed to load" before localstorage is read
  const { userId, ready } = useUserId();

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchPosts = useCallback(async (pageNum: number) => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
          `/api/posts/feed?userId=${userId}&page=${pageNum}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError('Failed to load feed.');
        return;
      }

      // empty on page 1 means no one being followed, show the empty state
      if (pageNum === 1 && data.posts.length === 0) {
        setIsEmpty(true);
        return;
      }

      // page 1 replaces the list, subsequent pages append to it
      setPosts(prev => pageNum === 1 ? data.posts : [...prev, ...data.posts]);
      //hasMore is true if the api returned a full page of results
      //false means the end has been reached and the load more button should not display
      setHasMore(data.hasMore);

    } catch {
      setError('Network error, please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // only get userId once it is available from local storage
  useEffect(() => {
    if (ready && userId) fetchPosts(1);
    if (ready && !userId) setIsEmpty(true); //not logged in
  }, [ready, userId, fetchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  return (
      <Page>
        {/* find people button should always be visible
            sits on top of the feed so that users can always search
            for other users
        */}
        <FindPeopleButton href="/search">
          Find people →
        </FindPeopleButton>

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
                        // cast to any since feed returns tags as string[]
                        // but PostCard expects Tag[]
                        post={post as any}
                        currentUserId={userId ?? undefined}
                    />
                ))}
              </FeedList>

              {/* only show load more if there are more posts to fetch */}
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