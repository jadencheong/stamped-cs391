'use client';

import styled from 'styled-components';
import { Sword } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const FixedContainer = styled.div`
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 9999; /* Stay above everything */
`;

const IconWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: #ffffff;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    
    &:hover { 
        transform: scale(1.1) rotate(-10deg);
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }
    &:active { transform: scale(0.9); }
`;

const NotificationDot = styled.div`
    position: absolute;
    top: 2px;
    right: 2px;
    width: 16px;
    height: 16px;
    background-color: #ef4444;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
    z-index: 10;
`;

export default function DuelIcon() {
    const [undueledCount, setUndueledCount] = useState(0);
    const router = useRouter();
    const TEST_USER_ID = '000000000000000000000001';

    useEffect(() => {
            const checkNotification = async () => {
                const res = await fetch(`/api/duel/count?userId=${TEST_USER_ID}&t=${Date.now()}`);
                const data = await res.json();
                setUndueledCount(data.count || 0);
            };

            checkNotification();
            
            // Listen for a custom refresh event from the Duel Page
            window.addEventListener('refreshDuelCount', checkNotification);
            const interval = setInterval(checkNotification, 30000);

            return () => {
                window.removeEventListener('refreshDuelCount', checkNotification);
                clearInterval(interval);
            };
        }, []);

    return (
        <FixedContainer onClick={() => router.push('/duel-gauntlet')}>
            <IconWrapper>
                <Sword size={30} color="#326273" />
                
                {/* REPLACED LINE BELOW */}
                {undueledCount > 0 && (
                    <NotificationDot>
                        <span style={{ 
                            fontSize: '10px', 
                            color: 'white', 
                            position: 'absolute', 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)', // Centers the number perfectly
                            fontWeight: 'bold' 
                        }}>
                            {undueledCount}
                        </span>
                    </NotificationDot>
                )}
            </IconWrapper>
        </FixedContainer>
    );
}