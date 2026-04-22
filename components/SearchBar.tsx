/**
 * components/SearchBar.tsx
 *
 * search bar component
 * debounces keystrokes by 300ms (e.g. waiting until user stops typing for XX time) before calling /api/cities/search
 *
 * on city selection, calls /api/cities/resolve to save city to DB if new
 *
 * created by: Jaden
 */

'use client';

import { useState, useRef } from 'react';
import styled from 'styled-components';

// shape of single city result returned by /api/cities/search
interface CityResult {
    mapboxId: string;
    name: string;
    placeName: string;
    country: string | null;
    coordinates: [number, number];
}

interface SearchBarProps {
    onCitySelect: (city: CityResult) => void;
}

// STYLED COMPONENTS
const Wrapper = styled.div`
    position: relative;
    width: 100%;
    max-width: 400px;
`;

// text input — white background sits on platinum page background
const Input = styled.input`
    width: 100%;
    padding: 10px 14px;
    font-size: 15px;
    font-family: inherit;
    background: #ffffff;
    border: 0.5px solid #e5e7eb;
    border-radius: 12px;
    outline: none;
    box-sizing: border-box;

    &:focus {
        border-color: #5C9EAD;
    }
`;

// loading indicator
const LoadingText = styled.p`
    font-size: 13px;
    color: #9ca3af;
    margin: 6px 0 0;
`;

// dropdown container — absolute so it floats over page content
const Dropdown = styled.ul`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: #ffffff;
    border: 0.5px solid #e5e7eb;
    border-radius: 12px;
    list-style: none;
    margin: 0;
    padding: 4px 0;
    z-index: 10;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

// individual result row
const DropdownItem = styled.li`
    padding: 10px 14px;
    font-size: 13px;
    color: #374151;
    cursor: pointer;

    &:hover {
        background: #EEEEEE;
    }
`;

// empty state when no results found
const EmptyText = styled.p`
    font-size: 13px;
    color: #9ca3af;
    margin: 6px 0 0;
`;


export default function SearchBar({ onCitySelect }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CityResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // hold active debounce timer between keystrokes
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const fetchResults = async (value: string) => {
        if (!value.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(`/api/cities/search?q=${encodeURIComponent(value)}`);
            const data = await res.json();
            setResults(data.results ?? []);
            setIsOpen(true);
        } catch (err) {
            console.error('Search failed:', err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // cancel previous timer for debouncing if user is still typing
        if (debounceRef.current) clearTimeout(debounceRef.current);

        // start a new 300ms timer and fire fetchResults if user stops typing
        debounceRef.current = setTimeout(() => {
            fetchResults(value);
        }, 300);
    }

    const handleSelect = async (city: CityResult)=> {
        // update input to show selected city name
        setQuery(city.name);

        // close dropdown
        setIsOpen(false);
        setResults([]);

        try {
            // resolve city — save to DB if first time, return existing otherwise
            const res = await fetch('/api/cities/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(city),
            });
            const data = await res.json();

            // fire callback with resolved city document
            onCitySelect(data.city);
        } catch (err) {
            console.error('Resolve failed:', err);
        }
    };

    return (
        <Wrapper>

            <Input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search for a city..."
            />

            {isLoading && <LoadingText>Searching...</LoadingText>}

            {isOpen && results.length > 0 && (
                <Dropdown>
                    {results.map(city => (
                        <DropdownItem
                            key={city.mapboxId}
                            onClick={() => handleSelect(city)}
                        >
                            {city.placeName}
                        </DropdownItem>
                    ))}
                </Dropdown>
            )}

            {isOpen && results.length === 0 && !isLoading && (
                <EmptyText>No results found</EmptyText>
            )}

        </Wrapper>
    );
}