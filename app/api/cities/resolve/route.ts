/**
 * app/api/cities/resolve/route.ts
 *
 * Resolve route — called when a user selects a city from the search dropdown
 * checks if the city already exists in MongoDB by mapboxId
 * if it does — returns it
 * if it doesn't — creates it and returns it
 *
 * MapBox handles search, MongoDB handles persistence
 * Route acts as bridge
 *
 * called by: search bar component when user makes a city selection
 * writes to: Destination collection (on first stamp of a city)
 *
 * created by: Jaden
 */

import { NextRequest, NextResponse } from 'next/server';
// import connection function
import dbConnect from '@/lib/db';
// import Mongoose model
import Destination from '@/lib/models/Destination';

export async function POST(req: NextRequest) {
    try {
        // parse the city data sent from the frontend
        const body = await req.json();
        // pull specific fields out of the object into one line
        const { mapboxId, name, placeName, country, coordinates } = body;

        // validate that required fields are present
        if (!mapboxId || !name || !coordinates) {
            return NextResponse.json(
                { error: 'Missing required fields: mapboxId, name, coordinates' },
                { status: 400 }
            );
        }

        // connect to MongoDB
        await dbConnect();

        // check if this city already exists in our DB
        // mapboxId is a unique identifier — prevents duplicate cities
        let city = await Destination.findOne({ mapboxId });

        if (city) {
            // city already exists — return it as-is
            return NextResponse.json({ city, created: false });
        }

        // fetch a cover photo from Unsplash for this city
        // called once on first "stamp"
        // photo url then stored in city document
        let imageUrl = null;
        const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

        // only fetch if the key exists
        // if it doesn't — photoURL returns null
        if (unsplashKey) {
            try {
                const unsplashRes = await fetch(
                    // get only one result, top match
                    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(name)}&per_page=1&client_id=${unsplashKey}`
                );

                // make request and pass as json object
                // 2 separate requests — wait for network, wait for body to bew read/parsed
                const unsplashData = await unsplashRes.json();
                imageUrl = unsplashData.results?.[0]?.urls?.regular ?? null;
            } catch (err) {
                // if Unsplash fails — proceed without a photo instead of failing whole request
                console.error('[[/api/cities/resolve] Unsplash fetch failed:', err);
            }
        }

        // fetch Wikipedia description
        // returns short plain-text summary of city
        // used in Anna's DuelCard tooltip and city detail page
        let description = null

        try {
            const wikiRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`
            );

            if (wikiRes.ok) {
                const wikiData = await wikiRes.json();
                // extract plain text summary
                // truncate to 300 chars
                description = wikiData.extract
                    ? wikiData.extract.slice(0, 500).replace(/[^.!?]*$/, '').trim()
                    : null;
            }
        } catch (err) {
            // if Wikipedia fails — proceed without description
            console.error('[/api/cities/resolve] Wikipedia fetch failed:', err);
        }


        // city doesn't exist yet — create it from the Mapbox data including photos
        // globalAverageScore starts at 1000 (standard Elo baseline)
        // all aggregated fields start empty/zero and grow as users interact
        city = await Destination.create({
            mapboxId,
            name,
            placeName,
            country: country ?? null,
            imageUrl,
            description,
            location: {
                type: 'Point',
                coordinates,
            },
            globalAverageScore: 1000,
            globalTotalScore: 1000,
            timesDuelled: 0,
            postCount: 0,
            tags: [],
        });

        // return the newly created city, with created: true so the
        // caller knows this was a first-time stamp
        return NextResponse.json({ city, created: true });

    } catch (err) {
        console.error('[/api/cities/resolve]', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}