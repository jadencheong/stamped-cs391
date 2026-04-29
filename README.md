# Stamped App

## Technologies 

### Mongoose
Mongoose is an addition to MongoDB that adds a layer of discipline to the freedom of BSON documents. It serves as the **Object Data Modeling library** for Node.js.

In "raw" MongoDB, it is possible to save a user with a string for an age in one document and an integer in another. Mongoose remedies this by requiring a Schema, and Mongoose will block a save() on data that does not match that schema. 

There's built-in validation, excellent support for middleware, and virtual properites. Mongoose is considered the industry standard for production environments that require data integrity, consistent validation logic, and scalability.

#### How Did We Find It?
I (Anna) have actually used Mongoose in multiple different projects before. I learned it over about 2 weeks for an interview, and found that I really enjoyed how it bridged the fluidity of nonrelational databases with the structure of something like SQL, allowing for a happy medium. 

I've since used it in multiple outside projects, and figured it would be a perfect fit for a project where we have models like Users, Duels, and Destinations where validation and integrity matters. It’s a perfect fit for an app like Stamped, where data consistency (like ELO scores and ranking snapshots) is paramount.

### Database Schemas

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `mapboxId` | String | Required, Unique | |
| `name` | String | Required | |
| `placeName` | String | - | |
| `country` | String | - | |
| `imageUrl` | String | Default: null | |
| `description` | String | Default: null | Wikipedia sourcing |
| `location` | Object | GeoJSON Point | |
| `postCount` | Number | Default: 0 | |
| `category` | String | Enum | City, Nature, Resort, Other |
| `globalTotalScore` | Number | Default: 1000 | |
| `timesDuelled` | Number | Default: 0 | |
| `globalAverageScore`| Number | Default: 1000 | |

#### 👤 User Model
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `username` | String | Required, Unique | |
| `email` | String | Required, Unique | |
| `verified` | Boolean | Default: true | |
| `verificationToken`| String | Default: null | |
| `password` | String | Required | |
| **`myRankings`** | **Array** | **Sub-docs** | **User's Personal Leaderboard** |
| - `destinationId` | ObjectId | Ref: Destination | |
| - `personalElo` | Number | Default: 1000 | |
| - `isSettled` | Boolean | Default: false | |
| - `timesDuelled` | Number | Default: 0 | |
| - `createdAt` | Date | Default: Now | |
| `following` | Array | Ref: User | Social Relationships Outward |
| `followers` | Array | Ref: User | Social Relationships Inward |

#### Duel Model
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `userId` | ObjectId | Ref: 'User' | Participant ID |
| `winnerId` | ObjectId | Ref: 'Destination' | Winning City |
| `loserId` | ObjectId | Ref: 'Destination' | Losing City |
| `isDraw` | Boolean | Default: false | Support for tie-breaks |
| `eloGain` | Number | - | Statistical swing (+) for analytics |
| `eloLoss` | Number | - | Statistical swing (-) for analytics |
| `timestamp` | Date | Default: Date.now | Historical record |

#### Post Model
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `userId` | ObjectId | Ref: User | |
| `destinationId` | ObjectId | Ref: Destination | |
| **`tags`** | **Array** | **Enum + Validator** | **Must be 1-3 tags** |
| `caption` | String | Max: 2200 | |
| `images` | Array | [String] | |
| `ratingSnapshot` | Object | `{ newRank: Number }` | Post-duel state capture |
| `createdAt` | Date | Default: Now | |


| **`INDEX`** | **Compound** | **Unique** | **{ userId, destinationId }** |


### APIs and External Services
**Mapbox Geocoding APIv5**

Stamped uses Mapbox for city search and typeahead. When a user types a city name, the search route queries Mapbox with types=place&limit=5, returning only cities, capped at 5 results. Each result is normalized to a consistent shape before returning to the frontend.

Mapbox was selected over Google Places (due to high cost) and Teleport (limited international coverage) for its geocoding quality. Mapbox handles the search, and MongoDB handles persistence in the database. Cities are only saved to the database when a user actually selects one to visit the city detail page.

**Unsplash API**

On a city's first stamp, the resolve route fetches a cover photo from Unsplash using the city name as the search query. The top result's urls.regular is stored as imageUrl on the Destination document. If the Unsplash call fails, the city is created, but without a photo.

**Wikipedia REST API**

On a city's first stamp, the resolve route also fetches a plain-text description from Wikipedia's free REST API (/api/rest_v1/page/summary/{city}). No API key was required. We use the extract field (full opening paragraph) rather than description, which was too short and inconsistent across cities. We truncated to 500 characters at the nearest sentence ending.

**Tag System**

Tags are the vocabulary users use to describe their experience of a city. Each post requires at least 1 tag selected from a canonical list of 19 tags grouped into three categories: Vibe and Quality, Logistics, and Experience type.

lib/tags.ts acts as the source of truth. It exports
- VALID_TAGS
- Tag type
- isValidTag()
- TAGS_BY_CATEGORY

Tags are never hardcoded in the components themselves. The Post schema validates tags against VALID_TAGS via Mongoose's enum validator. When a post is created, tag counts are incremented on the Destination document, which feeds into the "Most common tags" section on each city's detail page.


### Routes
**/api/cities/search — GET**

Proxies Mapbox Geocoding API. Accepts ?q= query param, returns normalized city results. Called on each debounced keystroke from SearchBar component.

**/api/cities/resolve — POST**

Bridge between Mapbox and MongoDB. Checks if a city exists by mapboxID. If new — fetch Unsplash photo and Wikipedia description --> create a Destination document. Returns existing or newly created city.

**/api/users/search — GET**

Searches users by username using MongoDB with case-insensitive flag. Accepts ?q= query param. Returns up to 10 results with username, city count, follower count, and following count. Sensitive fields excluded.

**/cities/[slug] — City Detail Page**

Dynamic server component — derives name from URL slug, queries MongoDB by case-insensitive name match. Calculates global rank using weight formulas as is used in the Leaderboard. Shows cover photo, global ranking, Wikipedia description, most common tags, and post feed.

