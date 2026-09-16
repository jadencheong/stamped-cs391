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
 */

// Without this, Next.js statically pre-renders this page at build time
// since it's a plain async Server Component with no dynamic APIs used.
// That would freeze the ranking/tags/post feed at whatever they were
// during the build, instead of reflecting new duels and posts.
export const dynamic = 'force-dynamic';

import dbConnect from '@/lib/db';
import Destination from '@/lib/models/Destination';
import Post from '@/lib/models/Post';
import Image from 'next/image';
import styled from 'styled-components';
import User from '@/lib/models/User';

// tell TS what shape data is coming back from MongoDB will be
interface CityPageProps {
    params: Promise<{ slug: string }>;
}

interface CityDocument {
    _id: string;
    name: string;
    country: string | null;
    imageUrl: string | null;
    description: string | null;
    globalAverageScore: number;
    timesDuelled: number;
    tags: { label: string; count: number }[];
}

interface PostDocument {
    _id: string;
    userId: { username: string };
    tags: string[];
    caption: string;
}

// STYLED COMPONENTS

// container for entire page
const PageWrapper = styled.div`
  max-width: 680px;
  margin: 0 auto;
  padding: 0 0 4rem;
    background: #EEEEEE;
`;

// container for city cover photo
// position relative so TextOverlay positions relative to this
const CoverPhoto = styled.div`
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    background: #EEEEEE;
    overflow: hidden;
`;

// dark gradient overlay — makes city name readable over any photo
const TextOverlay = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem 1.5rem 1.5rem;
    background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
`;

const HeroPlaceholder = styled.div`
    width: 100%;
    height: 100%;
    background: #EEEEEE;
`;

// city name displayed over hero photo
const CityTitle = styled.h1`
    font-family: 'Unbounded', sans-serif;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    color: #ffffff;
    margin: 0 0 4px;
`;

// country name under city title
const CitySubtitle = styled.p`
    font-size: calc( 2px + 2vw);
    color: rgba(255,255,255,0.8);
    margin: 0;
`;

// reusable wrapper for each section below hero
// consistent padding + bottom border creates visual separation
const ContentSection = styled.div`
    padding: 1.5rem 1.25rem;
    border-bottom: 0.5px solid #e5e7eb;
`;

// small uppercase label above each section
const SectionLabel = styled.p`
  font-size: calc( 10px + 1vw);
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 10px;
`;

// pill badge showing global rank + score
const RankBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #326273;
    color: #ffffff;
    font-size: calc( 10px + 1vw);
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 99px;
`;

// wikipedia description text
const Description = styled.p`
    font-size: calc( 10px + 1vw);
    color: #4b5563;
    line-height: 1.7;
    margin: 0;
`;

// horizontal row of tag pills — wraps to next line if needed
const TagRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

// individual tag chip — matches Alen's PostCard tag styling
const TagPill = styled.span`
    font-size: calc( 2px + 1.5vw);
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 99px;
    background: #fff7ed;
    color: #BF7245;
    border: 0.5px solid #F19C4C;
`;

// container for each post in the feed
const PostCard = styled.div`
    background: #ffffff;
    border: 0.5px solid #e5e7eb;
    border-radius: 16px;
    padding: 1rem 1.25rem;
    margin-bottom: 12px;
`;

// post author username
const PostAuthor = styled.p`
    font-size: calc( 2px + 1.5vw);
    color: #5C9EAD;
    margin: 0 0 6px;
    font-weight: 500;
`;

// post caption text
const PostCaption = styled.p`
    font-size: calc( 10px + 1vw);
    color: #6b7280;
    line-height: 1.6;
    margin: 6px 0 0;
`;

// shown when no posts exist for this city
const EmptyState = styled.p`
    font-size: calc( 2px + 2vw);
    color: #9ca3af;
    text-align: center;
    padding: 2rem 0;
`;

// shown when city doesn't exist in DB
const NotFound = styled.div`
    text-align: center;
    padding: 4rem 1rem;
`;

const DuelNote = styled.p`
    font-size: calc( 2px + 1.5vw);
    color: #9ca3af;
    margin-top: 8px;
`;

const NoTagsText = styled.p`
    font-size: calc( 2px + 1.5vw);
    color: #9ca3af;
    margin: 0;
`;

const LastSection = styled(ContentSection)`
    border-bottom: none;
`;

// END OF STYLED COMPONENTS

export default async function CityPage({ params }: CityPageProps) {
    const { slug } = await params;

    // derive city name from slug — "new-york" → "New York"
    // .split --> turns "new-york" into ["new", "york"]
    // .map() --> capitalizes first letter of each word
    // + word.slice(1) --> appends rest of word unchanged
    // .join(' ') --> puts array back into string w/ spaces
    const nameFromSlug = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    let city: CityDocument | null = null;
    let posts: PostDocument[] = [];
    let globalRank = 0;
    let weightedScore = 0;

    try {
        await dbConnect();

        // database query
        // find city in mongodb whose name matches what the user navigated to
        city = await Destination.findOne({
            name: { $regex: new RegExp(`^${nameFromSlug}$`, 'i') }
        }).lean() as CityDocument | null;

        if (city) {
            // figure out what rank this city is globally
            // calculate global rank using same weighted formula as leaderboard
            // fetch all cities and users to replicate the leaderboard scoring
            const allDestinations = await Destination.find().lean();
            const users = await User.find({}, 'myRankings.destinationId').lean();

            // count how many users have ranked each city
            const countMap: Record<string, number> = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            users.forEach((user: any) => {
                user.myRankings.forEach((ranking: any) => {
                    const id = ranking.destinationId.toString();
                    countMap[id] = (countMap[id] || 0) + 1;
                });
            });

            // compute weighted score for each city — same formula as leaderboard
            const scoredCities = allDestinations.map((c: any) => {
                const id = c._id.toString();
                const userCount = Math.max(countMap[id] || 0, 1);
                const duels = c.timesDuelled || 0;
                const totalPoints = c.globalTotalScore || 0;
                const averageScore = duels > 0 ? Math.round(totalPoints / userCount) : 1000;
                return { id, averageScore };
            }).sort((a, b) => b.averageScore - a.averageScore);

            // find this city's position in the sorted list
            const cityId = city._id.toString();
            globalRank = scoredCities.findIndex(c => c.id === cityId) + 1;
            // get the weighted score for this specific city
            weightedScore = scoredCities.find(c => c.id === cityId)?.averageScore ?? city.globalAverageScore;

            // get all posts for this city, newest first
            // include author username
            const postResults = await Post.find({ destinationId: city._id })
                .sort({ createdAt: -1 })
                .populate('userId', 'username')
                .lean();

            posts = postResults as PostDocument[];
        }

    } catch (err) {
        console.error('[/cities/slug] Failed to fetch city:', err);
    }

    // if city doesn't exist in db --> show error
    if (!city) {
        return (
            <NotFound>
                <h1>City not found</h1>
                <p>We don&apos;t have data for &quot;{nameFromSlug}&quot; yet.</p>
            </NotFound>
        );
    }

    // show top 5 most used tags for that city
    const topTags = [...(city.tags ?? [])]
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return (
        <PageWrapper>

            {/* hero image
                show city's cover photo w/ name and country overlaid at bottom
                fall back to gray placeholder if no photo exists
            */}
            <CoverPhoto>
                {city.imageUrl ? (
                    <Image
                        src={city.imageUrl}
                        alt={city.name}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <HeroPlaceholder />
                )}
                <TextOverlay>
                    <CityTitle>{city.name}</CityTitle>
                    {city.country && (
                        <CitySubtitle>{city.country}</CitySubtitle>
                    )}
                </TextOverlay>
            </CoverPhoto>

            {/* global ranking */}
            <ContentSection>
                <SectionLabel>Global ranking</SectionLabel>
                <RankBadge>
                    #{globalRank} · {weightedScore} pts
                </RankBadge>
                <DuelNote>
                    Based on {city.timesDuelled} {city.timesDuelled === 1 ? 'duel' : 'duels'} across all users
                </DuelNote>
            </ContentSection>

            {/* description — only renders if Wikipedia returned one */}
            {city.description && (
                <ContentSection>
                    <SectionLabel>About</SectionLabel>
                    <Description>{city.description}</Description>
                </ContentSection>
            )}

            {/* most common tags */}
            <ContentSection>
                <SectionLabel>Most common tags</SectionLabel>
                {topTags.length > 0 ? (
                    <TagRow>
                        {topTags.map(tag => (
                            <TagPill key={tag.label}>{tag.label}</TagPill>
                        ))}
                    </TagRow>
                ) : (
                    <NoTagsText>
                        No tags yet — be the first to stamp this city.
                    </NoTagsText>
                )}
            </ContentSection>

            {/* post feed */}
            <LastSection>
                <SectionLabel>Posts</SectionLabel>
                {posts.length === 0 ? (
                    <EmptyState>No posts yet for {city.name}.</EmptyState>
                ) : (
                    posts.map(post => (
                        <PostCard key={post._id.toString()}>
                            <PostAuthor>@{post.userId?.username ?? 'unknown'}</PostAuthor>
                            <TagRow>
                                {post.tags?.map(tag => (
                                    <TagPill key={tag}>{tag}</TagPill>
                                ))}
                            </TagRow>
                            {post.caption && (
                                <PostCaption>{post.caption}</PostCaption>
                            )}
                        </PostCard>
                    ))
                )}
            </LastSection>

        </PageWrapper>
    );
}