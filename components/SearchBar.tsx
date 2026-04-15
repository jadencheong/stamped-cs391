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
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>

            {/* text input */}
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search for a city..."
                style={{ width: '100%', padding: '8px 12px', fontSize: '16px' }}
            />

            {/* loading indicator */}
            {isLoading && <p>Searching...</p>}

            {/* results dropdown */}
            {isOpen && results.length > 0 && (
                <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid gray',
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    zIndex: 10,
                }}>
                    {results.map(city => (
                        <li
                            key={city.mapboxId}
                            onClick={() => handleSelect(city)}
                            style={{ padding: '8px 12px', cursor: 'pointer' }}
                        >
                            {city.placeName}
                        </li>
                    ))}
                </ul>
            )}

            {/* empty state */}
            {isOpen && results.length === 0 && !isLoading &&(
                <p>No results found</p>
            )}

        </div>
    );
}