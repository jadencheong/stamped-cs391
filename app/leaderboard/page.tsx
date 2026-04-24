/**
 * app/leaderboard/page.tsx
 *
 * leaderboard page: shows all cities ranked by global average Elo score
 * higher globalAverageScore = higher rank globally across all users
 *
 * data source: destination collection, sorted by globalAverageScore descending
 * different from Your List which is personal
 * - this is all user's combined dueling data aggregated into a single global ranking
 *
 * created by: Jaden
 */

import dbConnect from '@/lib/db';
import Destination from '@/lib/models/Destination';
import User from '@/lib/models/User';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components'

// defines shape of city entry we're working with
// TS can't look at Destination Scheme object and see what each data field is and derive the types
// so we use interface to tell it
interface DestinationEntry {
    _id: string;
    name: string;
    // city might not have country if MapBox didn't return one
    country: string | null;
    // city might not have a photo if Unsplash call failed
    imageUrl: string | null;
    globalAverageScore: number;
    timesDuelled: number;
    // array of objects — matches what's stored in Destination document
    // count = how many users have tagged a city with that label
    tags: { label: string; count: number }[];
}

// STYLED COMPONENTS
const PageWrapper = styled.div`
    max-width: 680px;
    margin: 0 auto;
    padding: 2rem 1.25rem;
    background: #EEEEEE;
    min-height: 100vh;
`;

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

const EmptyState = styled.p`
    font-size: 13px;
    color: #9ca3af;
    text-align: center;
    padding: 4rem 0;
`;

const RankingList = styled.ol`
    list-style: none;
    padding: 0;
    margin: 0;
`;

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

const RankNumber = styled.span`
    font-family: 'Unbounded', sans-serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: #326273;
    min-width: 2.5rem;
`;

const CityThumb = styled(Image)`
    border-radius: 8px;
    object-fit: cover;
`;

const CityInfo = styled.div`
    flex: 1;
`;

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

const TagRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
`;

const TagPill = styled.span`
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 99px;
    background: #fff7ed;
    color: #BF7245;
    border: 0.5px solid #F19C4C;
`;

// score + duel count on right side
const ScoreBlock = styled.div`
    text-align: right;
`;

const ScoreText = styled.p`
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #326273;
`;

const DuelCount = styled.p`
    margin: 0;
    font-size: 11px;
    color: #9ca3af;
`;

// END OF STYLED COMPONENTS

export default async function LeaderboardPage() {

    let cities: DestinationEntry[] = [];

    try {
        await dbConnect();

        // grab all the destinations, lean so they dont hydrate the document and clog stuff up
        const allDestinations = await Destination.find().lean();

        // grab the users
        const users = await User.find({}, 'myRankings.destinationId').lean();

        // find how many users have ranked each destination
        const countMap: Record<string, number> = {};
            users.forEach(user => {
                user.myRankings.forEach((ranking: any) => {
                    const id = ranking.destinationId.toString();
                    countMap[id] = (countMap[id] || 0) + 1;
                });
            });

        // from Anna, math changes 
        cities = allDestinations.map((city: any) => {
            // data normalization to prevent divide by 0 errors
            const id = city._id.toString();
            const userCount = Math.max(countMap[id] || 0, 1);

            const duels = city.timesDuelled || 0;
            const totalPoints = city.globalTotalScore || 0;

        
            // weight score by user count 
            const averageScore = duels > 0 
                ? (totalPoints / userCount) 
                : 1000;

            // send out results
            return {
                ...city,
                _id: id,
                globalAverageScore: Math.round(averageScore), // get rid of decimals 
                userCount 
            };
        }).sort((a, b) => b.globalAverageScore - a.globalAverageScore);

    // no more Anna
       
    } catch (err) {
        console.error('[/leaderboard] Failed to fetch destinations:', err);
    }

    return (
        <PageWrapper>
            <PageTitle>Leaderboard</PageTitle>
            <PageSubtitle>The world&apos;s cities, ranked by everyone&apos;s duels.</PageSubtitle>

            {cities.length === 0 && (
                <EmptyState>No cities have been stamped yet — be the first.</EmptyState>
            )}

            {cities.length > 0 && (
                <RankingList>
                    {cities.map((city, index) => (
                        <RankingRow key={city._id.toString()}>

                            {/* rank number */}
                            <RankNumber>#{index + 1}</RankNumber>

                            {/* city photo */}
                            {city.imageUrl && (
                                <CityThumb
                                    src={city.imageUrl}
                                    alt={city.name}
                                    width={60}
                                    height={60}
                                />
                            )}

                            {/* city name + tags */}
                            <CityInfo>
                                <CityName href={`/cities/${city.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {city.name}{city.country ? `, ${city.country}` : ''}
                                </CityName>
                            </CityInfo>

                            {/* global score + duel count */}
                            <ScoreBlock>
                                <ScoreText>{city.globalAverageScore} pts</ScoreText>
                                <DuelCount>
                                    {city.timesDuelled} {city.timesDuelled === 1 ? 'duel' : 'duels'}
                                </DuelCount>
                            </ScoreBlock>

                        </RankingRow>
                    ))}
                </RankingList>
            )}
        </PageWrapper>
    );
}