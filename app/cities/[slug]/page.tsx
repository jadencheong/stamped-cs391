/**
 * app/cities/[slug]/page.tsx
 *
 * city detail page — shows a city's
 * 1. global ranking
 * 2. most common tags
 * 3. feed of public posts for that city
 *
 * [slug] is dynamic route segment — e.g. /cities/barcelona
 *  slug = "barcelona"
 * data is fetched by slug (maps to a city document in MongoDB)
 *
 * created by: Jaden
 *
 * currently working on: shell only — layout and structure, placeholder data
 * will wire in live data from mongodb later
 */

// bridge between URL and database
// slug — tells DB what city user chose
interface CityPageProps {
    params: Promise<{ slug: string }>
}

export default async function CityPage({ params }: CityPageProps) {
    const { slug } = await params;

    // todo: wire live data
    // query: Destination.findOne({ slug })
    // returns: city.name, city.globalAverageScore, city.tags, city.photoUrl
    // will use Unsplash API to generate images
    const city = null; // replace this with DB query later on

    return (
        <div>

            {/* city header */}
            <div>
                <h1>City Name</h1>
                <p>Global Ranking: #-</p>
            </div>

            {/* city image — use Unsplash API
                replace src with real image source later on */}
            <div>
                {/* <img src={city?.photoUrl} alt={city?.name} /> */}
            </div>

            {/* most common tags */}
            <div>
                <h2>Most common tags</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <span>-</span>
                </div>
            </div>

            {/* post feed */}
            <div>
                <h2>Posts</h2>
                <p>No posts yet for {slug}.</p>
            </div>

        </div>
    );
}