/**
 * app/list/page.tsx
 *
 * Your List page: shows the logged-in user's personal ranked list of cities.
 * each entry shows:
 * - rank number
 * - city name
 * - tags
 * - personal Elo score.
 *
 * data source: user.myRankings from MongoDB, populated with destination details.
 * rank order: sorted by personalElo descending (highest score = rank #1)
 *
 *
 * created by: Jaden
 */

'use client';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { useState, useEffect } from "react";
import { useUserId } from "@/lib/hooks/useUserId";

// STYLED COMPONENTS

const PageWrapper = styled.div`
    max-width: 680px;
    margin: 0 auto;
    padding: 2rem 1.25rem;
    background: #EEEEEE;
    min-height: 100vh;
`;

// page heading
const PageTitle = styled.h1`
    font-family: 'Unbounded', sans-serif;
    font-size: calc( 2px + 3vw);
    font-weight: 600;
    color: #111827;
    margin: 0 0 4px;
`;

const PageSubtitle = styled.p`
    font-size: calc( 8px + 1vw);
    color: #9ca3af;
    margin: 0 0 2rem;
`;

// empty state message
const EmptyState = styled.p`
    font-size: calc( 2px + 2vw);
    color: #9ca3af;
    text-align: center;
    padding: 4rem 0;
`;

// list container — no default ol styling
const RankingList = styled.ol`
    list-style: none;
    padding: 0;
    margin: 0;
`;

// individual ranking row
const RankingRow = styled.li`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: #ffffff;
    border-radius: 16px;
    margin-bottom: 10px;
    height: 80px;
    overflow: hidden;
`;

// rank number — e.g. #1
const RankNumber = styled.span`
    font-family: 'Unbounded', sans-serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: #326273;
    min-width: 2.5rem;
`;

// city thumbnail
const CityThumb = styled(Image)`
    border-radius: 8px;
    object-fit: cover;
`;

// city info column
const CityInfo = styled.div`
    flex: 1;
`;

// city name link
const CityName = styled(Link)`
    font-size: calc( 10px + 1vw);
    font-weight: 600;
    color: #111827;
    text-decoration: none;
    display: block;
    margin-bottom: 4px;

    &:hover {
        color: #326273;
    }
`;


// elo score on right side
const EloScore = styled.span`
    font-size: calc( 6px + 1vw);
    font-weight: 500;
    color: #326273;
    white-space: nowrap;
`;

// END OF STYLED COMPONENTS

// defines shape of each ranking entry coming back from API
interface Ranking {
    _id: string;
    destinationId: {
        _id: string;
        name: string;
        imageUrl?: string;
        tags?: { label: string; count: number }[];
    } | null;
    personalElo: number;
}

// fetches data directly from MongoDB without API route
// server component — can directly connect to db, so no need for API route (which is for
// when browser needs to fetch data after page loads
export default function YourListPage() {
    // 2 state pieces — ranking data and loading state
    // also use userId
    const { userId, ready } = useUserId();
    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // on page load — check if user is logged in, then fetch rankings
    useEffect(() => {
        if (!ready) return;

        if (!userId) {
            setIsLoading(false);
            return;
        }

        const fetchRankings = async () => {
            try {
                // use Ellen's /api/users/[id] route which returns myRankings populated
                const res = await fetch(`/api/users/${userId}`);
                const data = await res.json();

                if (!data.myRankings) {
                    setIsLoading(false);
                    return;
                }

                // sort by personalElo descending — highest score = rank #1
                const sorted = [...data.myRankings].sort(
                    (a: Ranking, b: Ranking) => b.personalElo - a.personalElo
                );
                setRankings(sorted);
            } catch (err) {
                console.error('[/list] Failed to fetch rankings:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRankings();
    }, [userId, ready]);

    return (
        <PageWrapper>
            <PageTitle>Your List</PageTitle>
            <PageSubtitle>Your personal city rankings, ordered by your duels.</PageSubtitle>

            {/* three possible states
                1. loading
                2. empty
                3. has data
            */}
            {isLoading && <EmptyState>Loading...</EmptyState>}

            {!isLoading && rankings.length === 0 && (
                <EmptyState>You haven&apos;t stamped any cities yet.</EmptyState>
            )}

            {!isLoading && rankings.length > 0 && (
                <RankingList>
                    {rankings.map((entry, index) => {
                        const city = entry.destinationId;
                        return (
                            <RankingRow key={entry._id}>

                                {/* rank number */}
                                <RankNumber>#{index + 1}</RankNumber>

                                {/* city photo — only render if imageUrl exists */}
                                {city?.imageUrl && (
                                    <CityThumb
                                        src={city.imageUrl}
                                        alt={city.name ?? 'city'}
                                        width={60}
                                        height={60}
                                    />
                                )}

                                {/* city name + tags */}
                                <CityInfo>
                                    <CityName href={`/cities/${city?.name?.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {city?.name ?? 'Unknown city'}
                                    </CityName>
                                </CityInfo>

                                {/* personal elo score */}
                                <EloScore>{entry.personalElo} pts</EloScore>

                            </RankingRow>
                        );
                    })}
                </RankingList>
            )}
        </PageWrapper>
    );
}