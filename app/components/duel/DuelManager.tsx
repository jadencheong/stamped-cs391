'use client';
import { useState } from 'react';
import { DuelOverlay } from './DuelOverlay';


// ** MOCK DATA ** THIS NEEDS TO BE CHANGED LATER
const MOCK_DESTINATIONS = [
    {
        _id: 'mock-1',
        name: 'The Alps, Switzerland',
        // random images, might need to change how these feilds are depending on how posts/ destinatons are done
        imageUrl: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=1000&auto=format&fit=crop',
        description: 'Crisp mountain air, tiny wooden chalets, and the best hot chocolate you will ever have.'
    },
    {
        _id: 'mock-2',
        name: 'Kyoto, Japan',
        imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop',
        description: 'Peaceful bamboo groves and hidden tea houses. The ultimate cozy-high-end aesthetic.'
    }
];



export default function DuelManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // use the mock data as the initial state
    const [cities, setCities] = useState({
        cityA: MOCK_DESTINATIONS[0],
        cityB: MOCK_DESTINATIONS[1]
    });

    const handleDuelResult = async (winnerId: string, loserId: string, isDraw: boolean) => {
        setIsLoading(true);
        
        // simulate a network delay (1 second) so we can see the loading styles
        console.log("Mocking API Call with:", { winnerId, loserId, isDraw });
        

        setTimeout(() => {
        setIsLoading(false);
        alert(`Duel logged! Winner: ${winnerId === 'mock-1' ? 'The Alps' : 'Kyoto'}`);
        // in a real app, we will fetch the NEXT pair here
        }, 1000);
    };

    return (
        <>
            {/* button stays on your main page for testing */}
            <div style={{ padding: '2rem', background: '#EEEEEE' }}>
                <button 
                    onClick={() => setIsOpen(true)}
                    className="p-4 bg-[#7DC4D4] text-white rounded-xl font-bold"
                >
                Test Styled Duel UI
                </button>
            </div>

            {isOpen && (
                <DuelOverlay 
                    cityA={cities.cityA}
                    cityB={cities.cityB}
                    loading={isLoading}
                    onClose={() => setIsOpen(false)} 
                    onVote={handleDuelResult}
                />
            )}
        </>
    );
}