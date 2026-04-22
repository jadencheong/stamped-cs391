// app/post/page.tsx
'use client';
import { useState } from 'react';
import styled from 'styled-components';
import SearchBar from '@/components/SearchBar';
import PostForm from '@/components/PostForm';

/* created by Alen */

// TODO: replace with real auth once login is implemented
const HARDCODED_USER_ID = '000000000000000000000001';

type ResolvedCity = {
    _id: string;
    name: string;
    placeName: string;
    mapboxId: string;
    country: string | null;
    coordinates: [number, number];
};

const Wrapper = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
`;

const Heading = styled.p`
  font-family: 'Unbounded', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem;
`;

const BackButton = styled.button`
  font-size: 12px;
  color: #EEEEEE;
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 1.5rem;
  cursor: pointer;
  &:hover { color: #6b7280; }
`;

export default function PostPage() {
    const [selectedCity, setSelectedCity] = useState<ResolvedCity | null>(null);

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
            <BackButton onClick={() => setSelectedCity(null)}>
                ← Change city
            </BackButton>
            <PostForm
                mode="create"
                userId={HARDCODED_USER_ID}
                destinationId={selectedCity._id}
                destinationName={selectedCity.name}
            />
        </Wrapper>
    );
}