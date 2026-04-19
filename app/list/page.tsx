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

// todo: replace with real session userId once NextAuth is integrated (Ellen's auth)
// for now using a hardcoded placeholder so the page can be built and tested
const TEMP_USER_ID = '000000000000000000000001';

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
            photoUrl?: string;
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
            select: 'name tags photoUrl',
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
        <div style={{ padding: '2rem '}}>

            {/* page header */}
            <h1>Your List</h1>
            <p>Your personal city rankings, ordered by your duels.</p>

            {/* empty state
                only show when there are no rankings
            */}
            {rankings.length === 0 && (
                <p>You have not stamped any cities yet — start by searching for a city.</p>
            )}

            {/* rankings list
                entry.destinationId --> after .populate operator, this becomes full Destination doc.
                index + 1 --> adjust so ranks start at 1 instead of index (starting at 0)
            */}
            {rankings.length > 0 && (
                <ol style={{ listStyle: 'none', padding: 0, marginTop: '1.5rem' }}>
                    {rankings.map((entry, index) => {
                        const city = entry.destinationId;
                        return (
                            <li
                                key={entry._id?.toString()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem 0',
                                    borderBottom: '1px solid #eee',
                                }}
                            >
                                {/* rank number
                                    minWidth --> ensure alignment between single and double digit ranks
                                */}
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', minWidth: '2rem' }}>
                                    #{index + 1}
                                </span>

                                {/* city photo
                                    only render image if photoURL exists
                                */}
                                {city?.photoUrl && (
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
                                    <Link
                                        href={`/cities/${city?.name?.toLowerCase().replace(/\s+/g, '-')}`}
                                        style={{ margin: 0, fontWeight: 'bold', textDecoration: 'none', color: 'black' }}
                                    >
                                        {city?.name ?? 'Unknown city'}
                                    </Link>

                                    {/* tags */}
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                                        {city?.tags?.slice(0, 3).map((tag: { label: string }) => (
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

                                {/* personal elo score */}
                                <span style={{ fontSize: '0.9rem', color: '#888' }}>
                                    {entry.personalElo} pts
                                </span>

                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
}