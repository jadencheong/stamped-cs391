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
import styled, { keyframes } from 'styled-components';

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

const RankingList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
`;

const RankingItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: #f8fbfc;
    border-radius: 0.75rem;
    border: 1px solid #eef3f5;
    animation: ${fadeUp} 0.3s ease-out both;
`;

const RankNumber = styled.span`
    font-family: 'Bebas Neue', 'Arial Narrow', sans-serif;
    font-size: 1.2rem;
    color: #7DC4D4;
    min-width: 28px;
    letter-spacing: 0.05em;
`;

const RankName = styled.span`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: #326273;
    flex: 1;
`;

const RankElo = styled.span`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.78rem;
    color: #5C9EAD;
    font-weight: 500;
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

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);
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
                const res = await fetch(`/api/users/${id}`);
                const data = await res.json();
                setUser(data);
                setNewUsername(data.username);
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

    // get initials for avatar — safe fallback if username not yet loaded
    const getInitials = (username: string | undefined) => {
        if (!username) return '??';
        return username.slice(0, 2).toUpperCase();
    };

    if (isLoading) return <PageWrapper><LoadingText>Loading profile...</LoadingText></PageWrapper>;
    if (!userId) return <PageWrapper><LoadingText>Please log in to view your profile.</LoadingText></PageWrapper>;
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
                    </UserInfo>
                </AvatarRow>

                <StatsRow>
                    <StatBlock>
                        <StatNumber>{user.myRankings?.length ?? 0}</StatNumber>
                        <StatLabel>Ranked</StatLabel>
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

                <SectionTitle>Rankings</SectionTitle>
                <RankingList>
                    {sortedRankings.length === 0 ? (
                        <EmptyState>No rankings yet — start dueling to build your list!</EmptyState>
                    ) : (
                        sortedRankings.map((ranking: any, index: number) => (
                            <RankingItem key={ranking._id} style={{ animationDelay: `${index * 0.05}s` }}>
                                <RankNumber>#{index + 1}</RankNumber>
                                <RankName>
                                    {ranking.destinationId?.name ?? 'Unknown destination'}
                                </RankName>
                                <RankElo>{ranking.personalElo} pts</RankElo>
                            </RankingItem>
                        ))
                    )}
                </RankingList>
            </ProfileCard>
        </PageWrapper>
    );
}