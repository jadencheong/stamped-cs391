'use client';

/**
 * app/profile/page.tsx
 *
 * User profile page.
 * Displays username, followers/following counts, and personal rankings list.
 * Allows the user to edit their username inline.
 *
 * Created by: Ellen
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import PostCard from '@/components/PostCard';

// colors
// blue slate: #326273
// pacific blue: #5C9EAD
// sky blue: #7DC4D4
// cinnamon wood: #BF7245
// sandy brown: #F19C4C
// platinum: #EEEEEE

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
    gap: 4px;
    flex: 1;
`;

const UsernameRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Username = styled.h1`
    font-family: 'Helvetica', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: #326273;
    margin: 0;
`;

const EditButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Helvetica', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #5C9EAD;
    padding: 0;
    transition: color 0.2s ease;

    &:hover {
        color: #326273;
    }
`;

const EmailText = styled.p`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.85rem;
    color: #5C9EAD;
    margin: 0;
`;

const EditRow = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.25rem;
`;

const EditInput = styled.input`
    padding: 0.5rem 0.75rem;
    border: 1.5px solid #5C9EAD;
    border-radius: 0.5rem;
    font-family: 'Helvetica', sans-serif;
    font-size: 0.95rem;
    color: #326273;
    background: #f8fbfc;
    outline: none;
    flex: 1;

    &:focus {
        box-shadow: 0 0 0 3px rgba(92, 158, 173, 0.15);
    }
`;

const SaveButton = styled.button`
    padding: 0.5rem 1rem;
    background: #326273;
    color: #EEEEEE;
    font-family: 'Helvetica', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        filter: brightness(1.1);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const CancelButton = styled.button`
    padding: 0.5rem 0.75rem;
    background: none;
    color: #5C9EAD;
    font-family: 'Helvetica', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border: 1.5px solid #d5e4e8;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #5C9EAD;
    }
`;

const EditError = styled.p`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.75rem;
    color: #BF7245;
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

const SectionTitle = styled.h2`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #326273;
    margin: 0 0 1rem;
`;

const EmptyState = styled.p`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.88rem;
    color: #5C9EAD;
    text-align: center;
    padding: 2rem 0;
    margin: 0;
`;

const PostList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const LoadingText = styled.p`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.88rem;
    color: #5C9EAD;
    text-align: center;
    padding: 4rem 0;
    margin: 0;
`;

const LoggedOutCard = styled.div`
    background: #ffffff;
    border-radius: 1.5rem;
    padding: 3rem 2.5rem;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 8px 40px rgba(50, 98, 115, 0.12);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
    animation: ${fadeUp} 0.4s ease-out both;
`;

const LoggedOutTitle = styled.h2`
    font-family: 'Helvetica', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #326273;
    margin: 0;
`;

const LoggedOutSubtitle = styled.p`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.88rem;
    color: #5C9EAD;
    margin: 0;
    line-height: 1.5;
`;

const AuthButtonRow = styled.div`
    display: flex;
    gap: 0.75rem;
    width: 100%;
    margin-top: 0.5rem;
`;

const PrimaryAuthButton = styled.a`
    flex: 1;
    padding: 0.8rem;
    background: #326273;
    color: #EEEEEE;
    font-family: 'Helvetica', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: none;
    border-radius: 0.75rem;
    text-decoration: none;
    text-align: center;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(50, 98, 115, 0.3);
    transition: all 0.2s ease;

    &:hover {
        filter: brightness(1.1);
        transform: translateY(-2px);
    }
`;

const SecondaryAuthButton = styled.a`
    flex: 1;
    padding: 0.8rem;
    background: none;
    color: #326273;
    font-family: 'Helvetica', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1.5px solid #d5e4e8;
    border-radius: 0.75rem;
    text-decoration: none;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #5C9EAD;
        transform: translateY(-2px);
    }
`;

const SignOutButton = styled.button`
    background: none;
    border: 1.5px solid #d5e4e8;
    border-radius: 0.6rem;
    padding: 0.4rem 0.85rem;
    font-family: 'Helvetica', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #BF7245;
    cursor: pointer;
    transition: all 0.2s ease;
    align-self: flex-start;

    &:hover {
        border-color: #BF7245;
        background: #FAECE7;
    }
`;

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [editError, setEditError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const id = localStorage.getItem('userId');
        setUserId(id);

        if (!id) {
            setIsLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const [userRes, postsRes] = await Promise.all([
                    fetch(`/api/users/${id}`),
                    fetch(`/api/posts?userId=${id}`),
                ]);

                const userData = await userRes.json();
                const postsData = await postsRes.json();

                setUser(userData);
                console.log('user data:', userData);
                setNewUsername(userData.username);
                setPosts(postsData.posts ?? []);
            } catch (err) {
                console.error('Failed to fetch user:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleEditSave = async () => {
        setEditError('');

        if (!newUsername.trim()) {
            setEditError('Username cannot be empty.');
            return;
        }

        if (newUsername === user.username) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: newUsername }),
            });

            const data = await res.json();

            if (!res.ok) {
                setEditError(data.message || 'Failed to update username.');
                return;
            }

            setUser(data);
            setIsEditing(false);
        } catch (err) {
            setEditError('Something went wrong. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setNewUsername(user.username);
        setEditError('');
        setIsEditing(false);
    };

    const handleSignOut = () => {
        localStorage.removeItem('userId');
        router.push('/login');
    };

    // get initials for avatar — safe fallback if username not yet loaded
    const getInitials = (username: string | undefined) => {
        if (!username) return '??';
        return username.slice(0, 2).toUpperCase();
    };

    if (isLoading) return <PageWrapper><LoadingText>Loading profile...</LoadingText></PageWrapper>;
    if (!userId) return (
        <PageWrapper>
            <LoggedOutCard>
                <LoggedOutTitle>You&apos;re not logged in</LoggedOutTitle>
                <LoggedOutSubtitle>
                    Log in or create an account to view your profile, rankings, and more.
                </LoggedOutSubtitle>
                <AuthButtonRow>
                    <PrimaryAuthButton href="/login">Log in</PrimaryAuthButton>
                    <SecondaryAuthButton href="/signup">Sign up</SecondaryAuthButton>
                </AuthButtonRow>
            </LoggedOutCard>
        </PageWrapper>
    );
    if (!user) return <PageWrapper><LoadingText>User not found.</LoadingText></PageWrapper>;

    // sort rankings by personalElo descending
    const sortedRankings = [...(user.myRankings ?? [])].sort(
        (a: any, b: any) => b.personalElo - a.personalElo
    );

    return (
        <PageWrapper>
            <ProfileCard>
                <AvatarRow>
                    <Avatar>{getInitials(user.username)}</Avatar>
                    <UserInfo>
                        {isEditing ? (
                            <>
                                <EditRow>
                                    <EditInput
                                        value={newUsername}
                                        onChange={e => setNewUsername(e.target.value)}
                                        autoFocus
                                    />
                                    <SaveButton onClick={handleEditSave} disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </SaveButton>
                                    <CancelButton onClick={handleCancelEdit}>
                                        Cancel
                                    </CancelButton>
                                </EditRow>
                                {editError && <EditError>{editError}</EditError>}
                            </>
                        ) : (
                            <UsernameRow>
                                <Username>@{user.username}</Username>
                                <EditButton onClick={() => setIsEditing(true)}>
                                    Edit
                                </EditButton>
                            </UsernameRow>
                        )}
                        <EmailText>{user.email}</EmailText>
                        <SignOutButton onClick={handleSignOut}>Sign out</SignOutButton>
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
                        <EmptyState>No posts yet — visit a city and share your experience!</EmptyState>
                    ) : (
                        posts.map((post: any) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                currentUserId={userId ?? undefined}
                            />
                        ))
                    )}
                </PostList>
            </ProfileCard>
        </PageWrapper>
    );
}