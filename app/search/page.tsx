/**
 * app/search/page.tsx
 *
 * User search page — search for other users by username.
 * Displays matching profiles with stats and a link to their profile.
 *
 * Calls /api/users/search?q= on keystroke (debounced 300ms).
 * No external dependencies — uses the same debounce pattern as SearchBar.
 *
 * Owner: Jaden
 */

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

interface UserResult {
    _id: string;
    username: string;
    cityCount: number;
    followerCount: number;
    followingCount: number;
}

// STYLED COMPONENTS

const PageWrapper = styled.div`
    max-width: 480px;
    margin: 0 auto;
    padding: 1.5rem 1rem;
    background: #EEEEEE;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const PageTitle = styled.h1`
    font-family: 'Unbounded', sans-serif;
    font-size: calc( 2px + 3vw);
    font-weight: 600;
    color: #111827;
    margin: 0 0 1rem;
    text-align: center;
    width: 100%;
`;

const SearchInput = styled.input`
    width: 100%;
    font-size: calc( 2px + 1.5vw);
    padding: 10px 14px;
    border: 0.5px solid #e5e7eb;
    border-radius: 12px;
    outline: none;
    box-sizing: border-box;
    font-family: inherit;
    margin-bottom: 1.5rem;
    background: #ffffff;

    &:focus {
        border-color: #5C9EAD;
    }
`;

// each search result becomes a card — navigates to user's profile
const UserCard = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1rem;
    background: #ffffff;
    border: 0.5px solid #e5e7eb;
    border-radius: 16px;
    margin-bottom: 10px;
    text-decoration: none;
    width: 100%;
    min-height: 64px;
    box-sizing: border-box;
`;

const Username = styled.p`
    font-family: 'Unbounded', sans-serif;
    font-size: calc( 2px + 1.5vw);
    font-weight: 600;
    color: #111827;
    margin: 0 0 4px;
`;

const Stats = styled.p`
    font-size: calc( 2px + 1vw);
    color: #9ca3af;
    margin: 0;
`;

const ChevronIcon = styled.span`
    font-size: calc( 2px + 2vw);
    color: #d1d5db;
`;

const EmptyState = styled.p`
    font-size: calc( 2px + 1.5vw);
    color: #9ca3af;
    text-align: center;
    padding: 2rem 0;
`;

// PAGE COMPONENTS

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // debounce timer ref — same pattern as SearchBar
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const fetchUsers = async (value: string) => {
        if (!value.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);

        try {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(value)}`);
            const data = await res.json();
            setResults(data.users ?? []);
        } catch (err) {
            console.error('User search failed:', err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // cancel previous debounce timer if user is still typing
        if (debounceRef.current) clearTimeout(debounceRef.current);

        // fire search after 300ms pause
        debounceRef.current = setTimeout(() => {
            fetchUsers(value);
        }, 300);
    };

    return (
        <PageWrapper>
            <PageTitle>Find people</PageTitle>

            <SearchInput
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search by username..."
            />

            {/* loading state */}
            {isLoading && (
                <EmptyState>Searching...</EmptyState>
            )}

            {/* results */}
            {!isLoading && results.map(user => (
                <UserCard key={user._id} href={`/profile/${user.username}`}>
                    <div>
                        <Username>@{user.username}</Username>
                        {/* have ternaries for wording based off of # for pluralization */}
                        <Stats>
                            {user.cityCount} {user.cityCount === 1 ? 'city' : 'cities'} · {user.followerCount} {user.followerCount === 1 ? 'follower' : 'followers'}
                        </Stats>
                    </div>
                    <ChevronIcon>›</ChevronIcon>
                </UserCard>
            ))}

            {/* empty state — only show after a search has been made */}
            {!isLoading && hasSearched && results.length === 0 && (
                <EmptyState>No users found for &quot;{query}&quot;</EmptyState>
            )}

        </PageWrapper>
    );
}