// app/post/page.tsx
'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import SearchBar from '@/components/SearchBar';
import PostForm from '@/components/PostForm';
import Image from 'next/image';
import {useUserId} from "@/lib/hooks/useUserId";

/* created by Alen */
/* Jaden addition — added image to cover */

/**
 *
 * this is the post creation page
 *
 * a user searches for a city using the SearchBar component
 * once a city is selected, PostForm renders with that city locked in
 *
 * the change city back button resets selectedCity back to null
 * takes user back to the search step
 */

//ResolvedCity is returned after a city is selected from the search dropdown
type ResolvedCity = {
    _id: string;
    name: string;
    placeName: string;
    mapboxId: string;
    country: string | null;
    coordinates: [number, number];
    imageUrl: string | null;
};

const Wrapper = styled.div`
  max-width: 80vw;
  margin: 0 auto;
  padding: 1.5rem 1rem;
`;

const Heading = styled.p`
  font-family: 'Unbounded', sans-serif;
  font-size: calc(10px + 0.5vw);
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem;
  position: relative;
`;

const BackButton = styled.button`
  font-size: calc(10px + 0.5vw);
  color: #326273;
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 1.5rem;
  cursor: pointer;
  &:hover { color: #BF7245; }
`;

// hero image container — same pattern as city detail page
const CoverPhoto = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #EEEEEE;
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 1.5rem;
`;

// dark gradient overlay — city name readable over any photo
const TextOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem 1.25rem 1rem;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  border-radius: 0 0 16px 16px;
`;

const CityTitle = styled.p`
  font-family: 'Unbounded', sans-serif;
  font-size: calc(15px + 0.5vw);
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 2px;
`;

const CityCountry = styled.p`
  font-size: calc(10px + 0.5vw);
  color: rgba(255,255,255,0.8);
  margin: 0;
`;

export default function PostPage() {
    //im converting this to my userId hook
    const { userId, ready } = useUserId();
    // selectedCity is null until the user picks a city from the search bar
    // null means show search step, else show post form step
    const [selectedCity, setSelectedCity] = useState<ResolvedCity | null>(null);

    //loading if not ready
    if (!ready) {
        return <Wrapper><Heading>Loading user session...</Heading></Wrapper>;
    }

    // city search
    if (!selectedCity) {
        return (
            <Wrapper>
                <Heading>Where did you go?</Heading>
                <SearchBar onCitySelect={(city) => setSelectedCity(city as ResolvedCity)} />
            </Wrapper>
        );
    }

    //post form, city has been chosen with the search bar above
    return (
        <Wrapper>
            {/* clicking back resets selectedCity to null, returns to search */}
            <BackButton onClick={() => setSelectedCity(null)}>
                ← Change city
            </BackButton>

            {/* hero image — same CoverPhoto/TextOverlay pattern as city detail page */}
            <CoverPhoto>
                {selectedCity.imageUrl ? (
                    <Image
                        src={selectedCity.imageUrl}
                        alt={selectedCity.name}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#EEEEEE' }} />
                )}
                <TextOverlay>
                    <CityTitle>{selectedCity.name}</CityTitle>
                    {/* only render country if it exists */}
                    {selectedCity.country && (
                        <CityCountry>{selectedCity.country}</CityCountry>
                    )}
                </TextOverlay>
            </CoverPhoto>

            {/* userId! non-null assertion is used here because we checked !ready above
            destinationId comes from mongo _id of the resolved city */}
            <PostForm
                mode="create"
                userId={userId!}
                destinationId={selectedCity._id}
                destinationName={selectedCity.name}
            />
        </Wrapper>
    );
}