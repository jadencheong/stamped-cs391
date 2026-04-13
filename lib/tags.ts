/**
 * lib/tags.ts
 *
 * Use as source of truth for all valid destination tags in app
 * Used for:
 *   - Alen: postSchema (enum validation)
 *   - Ellen: userSchema (custom validator in myRankings.personalTags)
 *   - Jaden: tag selector UI + city detail page aggregation
 *
 * Created by Jaden
 */

// create tag array
export const VALID_TAGS = [
    // vibe & quality tags
    'iconic',
    'hidden gem',
    'overrated',
    'scenic',
    'relaxing',
    'historic',
    'authentic',
    'photogenic',
    'romantic',

    // logistics related tags
    'crowded',
    'best value',
    'expensive',

    // experience related tags
    'nightlife',
    'food scene',
    'culture',
    'outdoors',
    'adventure',
    'walkable',
    'family-friendly',
] as const;

// creates a Tag type; gives the exact array (the tuple of 19 strings)
// result: type called Tag that represents exactly one valid tag string at the indexed number
// use this type anywhere you need to type a tag value in the codebase
export type Tag = typeof VALID_TAGS[number];

// checks whether given string is in valid tags list at runtime
export const isValidTag = (tag: string): tag is Tag =>
    (VALID_TAGS as readonly string[]).includes(tag);

// the 19 tags that we agreed upon grouped by category
// thinking about ui — don't want all 19 tags just flat out; think it'd be helpful for user to
// have them as 3 blocks/organized from a UI and user perspective
// Record<string, readonly Tag[]> is the TypeScript type
// e.g. an object where the keys are strings and the values are readonly arrays of Tag
export const TAGS_BY_CATEGORY: Record<string, readonly Tag[]> = {
    'Vibe & Quality': [
        'iconic',
        'hidden gem',
        'overrated',
        'scenic',
        'relaxing',
        'historic',
        'authentic',
        'photogenic',
        'romantic',
    ],
    'Logistics': [
        'crowded',
        'best value',
        'expensive',
    ],
    'Experience Type': [
        'nightlife',
        'food scene',
        'culture',
        'outdoors',
        'adventure',
        'walkable',
        'family-friendly',
    ],
};