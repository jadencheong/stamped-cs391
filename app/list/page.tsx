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
 * todo: replace hardcoded userId with real session user once NextAuth is set up.
 *
 * created by: Jaden
 */

import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Destination from '@/lib/models/Destination';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';

// todo: replace with real session userId once NextAuth is integrated (Ellen's auth)
// for now using a hardcoded placeholder so the page can be built and tested
const TEMP_USER_ID = '000000000000000000000001';

// STYLED COMPONENTS

const PageWrapper = styled.div`
    max-width: 480px;
    margin: 0 auto;
    padding: 2rem 1.25rem;
    background: #EEEEEE;
    min-height: 100vh;
`;

// page heading
const PageTitle = styled.h1`
    font-family: 'Unbounded', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 4px;
`;

const PageSubtitle = styled.p`
    font-size: 13px;
    color: #9ca3af;
    margin: 0 0 2rem;
`;

// empty state message
const EmptyState = styled.p`
    font-size: 13px;
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
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    text-decoration: none;
    display: block;
    margin-bottom: 4px;

    &:hover {
        color: #326273;
    }
`;

// tag row
const TagRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
`;

// individual tag pill
const TagPill = styled.span`
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 99px;
    background: #fff7ed;
    color: #BF7245;
    border: 0.5px solid #F19C4C;
`;

// elo score on right side
const EloScore = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: #326273;
    white-space: nowrap;
`;

// END OF STYLED COMPONENTS

// fetches data directly from MongoDB without API route
// server component — can directly connect to db, so no need for API route (which is for
// when browser needs to fetch data after page loads
export default async function YourListPage() {

    // initialize an empty array so accessible in JSX regardless of successful or failed query
    let rankings: {
        _id?: string;
        destinationId: {
            name: string;
            tags: { label: string; count: number }[];
            imageUrl?: string;
        } | null;
        personalElo: number;
    }[] = [];

    try {
        await dbConnect();

        // fetch the user's rankings, populating each destinationId with city's name and tags from the
        // Destination collection.
        // same as Ellen's route
        // .populate() --> tells Mongoose to fetch Destination document for each
        // ObjectIds that are stored in myRankings array and put it in my place of the ID
        

        const user = await User.findById(TEMP_USER_ID).populate({
            path: 'myRankings.destinationId',
            model: Destination,
            select: 'name tags imageUrl',
        });

        if (user && user.myRankings.length > 0) {
            // sort by personalElo descending from highest score = rank 1
            // [...user.myRankings] --> spread operator; creates a new array before sorting
            // .sort((a, b) => b.personalElo - a.personalElo); --> JS sort comparator
            // when result is pos — b comes first
            // when result is neg — a comes first
            rankings = [...user.myRankings].sort(
                (a: { personalElo: number }, b: { personalElo: number }) => b.personalElo - a.personalElo
            );
        }
    } catch (err) {
        console.error('[/list] Failed to fetch rankings:', err);
    }

    return (
        <PageWrapper>
            <PageTitle>Your List</PageTitle>
            <PageSubtitle>Your personal city rankings, ordered by your duels.</PageSubtitle>

            {rankings.length === 0 && (
                <EmptyState>You haven&apos;t stamped any cities yet — start by searching for a city.</EmptyState>
            )}

            {rankings.length > 0 && (
                <RankingList>
                    {rankings.map((entry, index) => {
                        const city = entry.destinationId;
                        return (
                            <RankingRow key={entry._id?.toString()}>

                                {/* rank number */}
                                <RankNumber>#{index + 1}</RankNumber>

                                {/* city photo — only render if imageUrl exists */}
                                {city?.imageUrl && (
                                    <CityThumb
                                        src={city.imageUrl}
                                        alt={city.name}
                                        width={60}
                                        height={60}
                                    />
                                )}

                                {/* city name + tags */}
                                <CityInfo>
                                    <CityName href={`/cities/${city?.name?.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {city?.name ?? 'Unknown city'}
                                    </CityName>
                                    <TagRow>
                                        {city?.tags?.slice(0, 3).map((tag: { label: string }) => (
                                            <TagPill key={tag.label}>{tag.label}</TagPill>
                                        ))}
                                    </TagRow>
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