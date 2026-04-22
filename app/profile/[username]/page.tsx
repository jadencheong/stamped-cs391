'use client';

/**
 * app/profile/[username]/page.tsx
 *
 * Public profile page for any user.
 * Accessed via /profile/[username] from search results.
 * Displays username, followers/following counts, and posts.
 * Shows a follow/unfollow button if the viewer is logged in
 * and is not viewing their own profile.
 *
 * Created by: Ellen
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import PostCard from '@/components/PostCard';

const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled.div`
    min-height: 100vh;
    background-color: #EEEEEE;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const ProfileCard = styled.div`
    background: #ffffff;
    border-radius: 1.5rem;
    padding: 2.5rem 2rem;
    width: 100%;
    max-width: 560px;
    box-shadow: 0 8px 40px rgba(50, 98, 115, 0.10);
    animation: ${fadeUp} 0.4s ease-out both;
`;

const AvatarRow = styled.div`
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-bottom: 1.75rem;
`;

const Avatar = styled.div`
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #326273;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Bebas Neue', 'Arial Narrow', sans-serif;
    font-size: 1.75rem;
    letter-spacing: 0.05em;
    color: #EEEEEE;
    flex-shrink: 0;
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
`;

const Username = styled.h1`
    font-family: 'Helvetica', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: #326273;
    margin: 0;
`;

const StatsRow = styled.div`
    display: flex;
    gap: 1.5rem;
    padding: 1.25rem 0;
    border-top: 1px solid #eef3f5;
    border-bottom: 1px solid #eef3f5;
    margin-bottom: 1.75rem;
`;

const StatBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const StatNumber = styled.span`
    font-family: 'Helvetica', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: #326273;
`;

const StatLabel = styled.span`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #5C9EAD;
`;

const FollowButton = styled.button<{ $following: boolean }>`
    padding: 0.45rem 1.1rem;
    background: ${props => props.$following ? 'none' : '#326273'};
    color: ${props => props.$following ? '#326273' : '#EEEEEE'};
    font-family: 'Helvetica', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1.5px solid #326273;
    border-radius: 0.6rem;
    cursor: pointer;
    transition: all 0.2s ease;
    align-self: flex-start;

    &:hover:not(:disabled) {
        filter: brightness(1.1);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const SectionTitle = styled.h2`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #326273;
    margin: 0 0 1rem;
`;

const PostList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const EmptyState = styled.p`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.88rem;
    color: #5C9EAD;
    text-align: center;
    padding: 2rem 0;
    margin: 0;
`;

const LoadingText = styled.p`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.88rem;
    color: #5C9EAD;
    text-align: center;
    padding: 4rem 0;
    margin: 0;
`;

export default function PublicProfilePage() {
    const { username } = useParams<{ username: string }>();

    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    // current logged in user
    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // use Jaden's existing search route to find user by username
                const searchRes = await fetch(`/api/users/search?q=${encodeURIComponent(username)}`);
                const searchData = await searchRes.json();

                // find exact username match from results
                const found = searchData.users.find(
                    (u: any) => u.username.toLowerCase() === username.toLowerCase()
                );

                if (!found) {
                    setIsLoading(false);
                    return;
                }

                // fetch full profile and posts using the _id from search results
                const [userRes, postsRes] = await Promise.all([
                    fetch(`/api/users/${found._id}`),
                    fetch(`/api/posts?userId=${found._id}`),
                ]);

                const userData = await userRes.json();
                const postsData = await postsRes.json();

                setUser(userData);
                setPosts(postsData.posts ?? []);

                // check if current user is already following
                if (currentUserId && userData.followers) {
                    const alreadyFollowing = userData.followers.some(
                        (f: any) => f._id === currentUserId || f === currentUserId
                    );
                    setIsFollowing(alreadyFollowing);
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    const handleFollow = async () => {
        if (!currentUserId || !user) return;
        setFollowLoading(true);

        try {
            const res = await fetch(`/api/users/${user._id}/follow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentUserId, action: isFollowing ? 'unfollow' : 'follow' }),
            });

            if (res.ok) {
                setIsFollowing(!isFollowing);
                // update follower count locally
                setUser((prev: any) => ({
                    ...prev,
                    followers: isFollowing
                        ? prev.followers.filter((f: any) => f._id !== currentUserId)
                        : [...prev.followers, { _id: currentUserId }],
                }));
            }
        } catch (err) {
            console.error('Follow failed:', err);
        } finally {
            setFollowLoading(false);
        }
    };

    const getInitials = (username: string | undefined) => {
        if (!username) return '??';
        return username.slice(0, 2).toUpperCase();
    };

    const isOwnProfile = currentUserId && user && user._id === currentUserId;

    if (isLoading) return <PageWrapper><LoadingText>Loading profile...</LoadingText></PageWrapper>;
    if (!user) return <PageWrapper><LoadingText>User not found.</LoadingText></PageWrapper>;

    return (
        <PageWrapper>
            <ProfileCard>
                <AvatarRow>
                    <Avatar>{getInitials(user.username)}</Avatar>
                    <UserInfo>
                        <Username>@{user.username}</Username>
                        {/* only show follow button if logged in and not own profile */}
                        {currentUserId && !isOwnProfile && (
                            <FollowButton
                                $following={isFollowing}
                                onClick={handleFollow}
                                disabled={followLoading}
                            >
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </FollowButton>
                        )}
                    </UserInfo>
                </AvatarRow>

                <StatsRow>
                    <StatBlock>
                        <StatNumber>{posts.length}</StatNumber>
                        <StatLabel>Posts</StatLabel>
                    </StatBlock>
                    <StatBlock>
                        <StatNumber>{user.followers?.length ?? 0}</StatNumber>
                        <StatLabel>Followers</StatLabel>
                    </StatBlock>
                    <StatBlock>
                        <StatNumber>{user.following?.length ?? 0}</StatNumber>
                        <StatLabel>Following</StatLabel>
                    </StatBlock>
                </StatsRow>

                <SectionTitle>Posts</SectionTitle>
                <PostList>
                    {posts.length === 0 ? (
                        <EmptyState>No posts yet.</EmptyState>
                    ) : (
                        posts.map((post: any) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                currentUserId={currentUserId ?? undefined}
                            />
                        ))
                    )}
                </PostList>
            </ProfileCard>
        </PageWrapper>
    );
}