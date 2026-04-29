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
