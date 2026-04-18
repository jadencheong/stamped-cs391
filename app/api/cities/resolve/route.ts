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

// using POST and not GET — route potentially writes to DB

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

        // city doesn't exist yet — create it from the Mapbox data
        // globalAverageScore starts at 1000 (standard Elo baseline)
        // all aggregated fields start empty/zero and grow as users interact
        city = await Destination.create({
            mapboxId,
            name,
            placeName,
            country: country ?? null,
            location: {
                type: 'Point',
                coordinates, // [lng, lat] from Mapbox
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