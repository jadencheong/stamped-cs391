/**
 * app/api/cities/search/route.ts
 *
 * search route — calls Mapbox Geocoding API with the user's query
 * and returns a list of city results for the user's search within the search bar.
 *
 * called by: the search bar component on every keystroke
 * does not write to the database — read/lookup only.
 *
 * created by: Jaden
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    // grab the search query from the URL
    // e.g. /api/cities/search?q=barcelona
    // q reads '?q=barcelona'
    const q = req.nextUrl.searchParams.get('q');

    // if no query was provided, return early with an empty array
    if (!q || q.trim() === '') {
        return NextResponse.json({ results: [] });
    }

    // read MapBox token from .env.local
    // give right error if no MapBox URl
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
        return NextResponse.json(
            { error: 'Mapbox token not configured' },
            { status: 500 }
        );
    }

    // build MapBox API url dynamically
    // use encodeURIComponent to convert to URL safe chars
    // types=place -> MapBox filter, cities/towns only
    // limit=5 -> return top 5 matches
    // language=en -> english results
    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?types=place&limit=5&language=en&access_token=${token}`;

    // calling MapBox
    const mapboxRes = await fetch(mapboxUrl);

    // true if HTTP status was 200-299 range
    // if 401 (bad token) or 429 (rate limited) –> ok is false, we catch here
    if (!mapboxRes.ok) {
        return NextResponse.json(
            { error: 'Mapbox request failed' },
            { status: 502 }
        );
    }

    const data = await mapboxRes.json();

    // normalize — pull only the five fields we need from Mapbox's response
    // we don't return the full Mapbox object to the frontend, just what's useful
    // e.g. id, text, place_name, context, coordinates
    const results = data.features.map((feature: any) => ({
        mapboxId: feature.id,
        name: feature.text,
        placeName: feature.place_name,
        country: feature.context?.find((c: any) => c.id.startsWith('country'))?.text ?? null,
        coordinates: feature.geometry.coordinates, // [lng, lat]
    }));

    return NextResponse.json({ results });
}