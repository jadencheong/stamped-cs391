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
import Image from 'next/image';

// defines shape of city entry we're working with
// TS can't look at Destination Scheme object and see what each data field is and derive the types
// so we use interface to tell it
interface DestinationEntry {
    _id: string;
    name: string;
    // city might not have country if MapBox didn't return one
    country: string | null;
    // city might not have a photo if Unsplash call failed
    photoUrl: string | null;
    globalAverageScore: number;
    timesDuelled: number;
    // array of objects — matches what's stored in Destination document
    // count = how many users have tagged a city with that label
    tags: { label: string; count: number }[];
}

export default async function LeaderboardPage() {

    let cities: DestinationEntry[] = [];

    try {
        await dbConnect();

        // fetch all cities sorted by globalAverageScore sorted from highest > lowest
        // highest score = rank #1 globally
        // only keep the fields needed for it
        const results = await Destination.find()
            .sort({ globalAverageScore: -1 })
            .select('name country photoUrl globalAverageScore timesDuelled tags')
            // Mongoose wraps results in Mongoose Document object (JS object with extra methods)
            // lean() strips away methods since we just need reading/displaying datas
            .lean();

        cities = results as unknown as DestinationEntry[];

    } catch (err) {
        console.error('[/leaderboard] Failed to fetch destinations:', err);
    }

    return (
        <div style={{ padding: '2rem' }}>

            {/* page header */}
            <h1>Leaderboard</h1>
            <p>The world&apos;s cities, ranked by everyone&apos;s duels.</p>

            {/* empty state */}
            {cities.length === 0 && (
                <p>No cities have been stamped yet — be the first.</p>
            )}

            {/* leaderboard list */}
            {cities.length > 0 && (
                <ol style={{ listStyle: 'none', padding: 0, marginTop: '1.5rem' }}>
                    {cities.map((city, index) => (
                        <li
                            key={city._id.toString()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem 0',
                                borderBottom: '1px solid #eee',
                            }}
                        >
                            {/* rank number */}
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', minWidth: '2rem' }}>
                                #{index + 1}
                            </span>

                            {/* city photo */}
                            {city.photoUrl && (
                                <Image
                                    src={city.photoUrl}
                                    alt={city.name}
                                    width={60}
                                    height={60}
                                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                                />
                            )}

                            {/* city info */}
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>
                                    {/* conditional rendering
                                        if country exists — append w/ comma
                                        if not — don't append anything
                                    */}
                                    {city.name}{city.country ? `, ${city.country}` : ''}
                                </p>

                                {/* top tags */}
                                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                                    {(city.tags ?? [])
                                        .sort((a, b) => b.count - a.count)
                                        .slice(0, 3)
                                        .map(tag => (
                                            <span
                                                key={tag.label}
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '2px 8px',
                                                    borderRadius: '999px',
                                                    border: '1px solid #ccc',
                                                }}
                                            >
                                                {tag.label}
                                            </span>
                                        ))}
                                </div>
                            </div>

                            {/* score display on leaderboard
                                show score, duel count, and globalElo
                            */}
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>{city.globalAverageScore} pts</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>
                                    {/* show "duel" if it's 1 duel, "duels" if it's any other # */}
                                    {city.timesDuelled} {city.timesDuelled === 1 ? 'duel' : 'duels'}
                                </p>
                            </div>

                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}