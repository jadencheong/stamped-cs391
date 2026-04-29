'use client';

import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useSearchParams, useRouter } from 'next/navigation';
import { Trophy, XCircle, Sword, Loader2 } from 'lucide-react'; 
import { DuelCard } from '../components/duel/DuelCard';
import { DuelGrid } from '../components/duel/DuelGrid';
import { DuelAction } from '../components/duel/DuelAction';
import { fadeIn, shimmy, slamDown, AnimatedCardWrapper } from '../components/duel/DuelStyles';

// created by Anna


/**
 * STYLED COMPONENTS
 */
const GauntletPage = styled.main`
    min-height: 100vh;
    background: #EEEEEE;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 6vh 2vw;
    position: relative;
    animation: ${fadeIn} 0.5s ease-out;

    /* trigger shimmy on both cards when hovering the draw button area */
    /* this targets sibling elements from a parent, which normal CSS hover can't do without JS.*/
    &:has(.draw-wrap:hover) .shimmy-element {
        animation: ${shimmy} 0.25s ease-in-out infinite;
    }
`;

// full duel header
const TitleHeader = styled.h1`
    font-family: 'Helvetica', sans-serif;
    font-size: calc(18px + 2.5vw);
    font-weight: 800;
    color: #326273;
    margin-bottom: 5vh;
    text-align: center;
`;



/* full screen backdrop for behind models, dims and blurs screen behind it */
const Overlay = styled.div`
    position: fixed;
    inset: 0;
    /* ensure it hovers over the content "below" it (any main page) */
    z-index: 1000;
    background: rgba(0, 0, 0, 0.6);
    /* https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter */
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    /* animation to smooth things out visually a little */
    animation: ${fadeIn} 0.3s ease-out;
`;

/* white card for modal overlay popup */
const ModalBox = styled.div`
    background: #EEEEEE;
    border-radius: 16px;
    padding: 2.5%;
    width: 90vw;
    max-width: 450px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    /* https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function/cubic-bezier */
    /* creates "overshoot" in animation to make it look more forceful */
    animation: ${slamDown} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

const ModalTitle = styled.h2` 
    font-family: 'Helvetica', sans-serif; 
    color: #326273; 
    margin: 1% 0; 
`;

/* isError is a transient prop, and while true, the text color shifts to orange to signal error visually */
const ModalText = styled.p<{ $isError?: boolean }>` 
    color: ${props => props.$isError ? '#BF7245' : '#4a4a4a'};
    line-height: 1.6; 
    margin-bottom: 5%; 
`;

/* shared button for modal actions */
const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    /* conditionals for different colors on buttons, secondary is for less priminent actions, default is solid filled*/
    border: ${props => props.$variant === 'secondary' ? '2px solid #5C9EAD' : 'none'};
    background: ${props => props.$variant === 'secondary' ? 'transparent' : '#326273'};
    color: ${props => props.$variant === 'secondary' ? '#326273' : '#EEEEEE'};
    margin-bottom: 0.75%;
    transition: all 0.2s;
    /* cute little visual to show it's being hovered on */
    &:hover { filter: brightness(1.1); transform: translateY(-2px); }
`;

const ExitButton = styled.button`
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    cursor: pointer; /* help specify that this is clickable */
    color: #BF7245;
    transition: transform 0.3s ease;
    z-index: 100;
    /* cute little spin transition... kind of extra, but i like it :] */
    /* open to criticism, though */
    &:hover { transform: rotate(90deg); }
`;

const LoadingState = styled.div`
    margin-top: 10vh;
    color: #326273;
    display: flex;
    gap: 12px;
    align-items: center;
    font-weight: 700;
`;

const IconSpacer = styled.div`
    margin-bottom: 1%;
    display: flex;
    justify-content: center;
`;

// MAIN COMPONENT
/**
 * 
 * This part runs the gauntlet, the series of duels between destinations. 
 * 
 * There are two modes:
 * 
 * 1. Challenger mode: occurs when there's a new entry, fights up the ranks until it loses or reaches #1
 * 
 * 2. Random mode: occurs when there is no "undueled" entry, just allows users to duel random pairs for funsies 
 */
export default function DuelGauntlet() {
    // naviagtion stuff
    const searchParams = useSearchParams(); // reads ?challengerId= from URL
    const router = useRouter();
    
    

    // state managmenet stuff
    const [loading, setLoading] = useState(false); // global fetching state
    const [currentPair, setCurrentPair] = useState<any>(null); // store the two destinations dueling 
    const [error, setError] = useState<string | null>(null);
    const [lastOpponentId, setLastOpponentId] = useState<string | null>(null); // try to make sure that identical duels don't happen twice in a row 
    
    // modal/flow stuff
    const [isCheckingQueue, setIsCheckingQueue] = useState(true); // check for queue loading 
    const [promptCity, setPromptCity] = useState<any>(null); // new entry that still needs to be dueled 
    const [showQueueModal, setShowQueueModal] = useState(false);
    const [showNoNewModal, setShowNoNewModal] = useState(false);
    
    // result modals 
    const [showVictory, setShowVictory] = useState(false); // new entry beat everything
    const [showDefeat, setShowDefeat] = useState(false); // new entry lost 

    // get the challenger from the URL
    const urlChallengerId = searchParams.get('challengerId');

    // userId stuff
    const [userId, setUserId] = useState<string | null>(null);

    // fetch logic to grab next pair for dueling 
    const fetchNextDuel = useCallback(async (id: string | null, prevOpponent: string | null) => {
        setLoading(true);
        setError(null);


        try {
            let url = `/api/duel?userId=${userId}`;
            // force the current specific challenger if provided (when dueling new entries)
            if (id) url += `&challengerId=${id}`;
            if (prevOpponent) url += `&lastOpponentId=${prevOpponent}`;

            const res = await fetch(url, { cache: 'no-store' });
            const data = await res.json();

            // if the challenger wins, show the victory modal 
            if (data.isVictory) {
                setCurrentPair(null);
                setShowVictory(true);
            } else {
                setCurrentPair({ cityA: data.pair[0], cityB: data.pair[1] });
            }
        } catch (err: any) {
            setError("Failed to load the duel.");
        } finally {
            setLoading(false);
        }
    }, [userId]);


    // intitialization effect that determines whether or not to prompt a user with a new gauntlet (series of duels)
    useEffect(() => {
        const savedId = localStorage.getItem('userId');

        setUserId(savedId);


        const checkInitialQueue = async () => {
            if (urlChallengerId) {
                setIsCheckingQueue(false); // skip the modal if there's an existing target
                return;
            }

            try {
                const res = await fetch(`/api/duel?userId=${userId}&t=${Date.now()}`);
                const data = await res.json();

                if (data.isNewChallenger) {
                    setPromptCity(data.pair[0]); // found an item with 0 duels, its undueled 
                    setShowQueueModal(true);
                } else if (data.pair && data.pair[0].timesDuelled > 0) { // everything dueled at least once, prompt random dueling 
                    setShowNoNewModal(true);
                } else {
                    setIsCheckingQueue(false);
                }
            } catch (err) {
                setIsCheckingQueue(false);
            }
        };
        checkInitialQueue();
    }, [urlChallengerId, userId]);


    // start the actual gaunlet effect once the initial checks are finished 
    useEffect(() => {
        const canStart = !isCheckingQueue && !showQueueModal && !showNoNewModal && !showVictory && !showDefeat;
        if (canStart) {
            fetchNextDuel(urlChallengerId, lastOpponentId);
        }
    }, [isCheckingQueue, showQueueModal, showNoNewModal, showVictory, showDefeat, urlChallengerId, lastOpponentId, fetchNextDuel]);

    // submit the duel results to the db, determine the next step
    const handleVote = async (winnerId: string, loserId: string, isDraw: boolean) => {
        setLoading(true);
        try {
            const res = await fetch('/api/duel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId, winnerId, loserId, isDraw, challengerId: urlChallengerId })
            });

            if (res.ok) {
                // tell the duel icon to refresh the notication bubble
                window.dispatchEvent(new Event('refreshDuelCount'));
                setLastOpponentId(loserId);

                // if the challenger loses or ties, the "streak" ends 
                const stillChampion = (winnerId === urlChallengerId && !isDraw);
                if (urlChallengerId && !stillChampion) {
                    setShowDefeat(true);
                    return;
                }
                
                // get the next battle for the gaunlet 
                await fetchNextDuel(stillChampion ? urlChallengerId : null, loserId);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        
        /* these are the items that are ALWAYS visible within duels/gauntlets, no conditional rendering */
        <GauntletPage>
            {/* exit button to take user out of duel and back to collection */}
            <ExitButton onClick={() => router.push('/list')} title="Exit Gauntlet">
                <XCircle size={36} />
            </ExitButton>

            <TitleHeader>The Stamp Duel</TitleHeader>

            {/* shows error message if it exists */}
            {error && <ModalText $isError>{error}</ModalText>}


            {/* shows a laoding spinner while the app checks db for new items */}
            {isCheckingQueue && !showQueueModal && !showNoNewModal && (
                <LoadingState>
                    <Loader2 className="animate-spin" /> Initializing Gauntlet...
                </LoadingState>
            )}

            {/* "main event" -- only displays if there's a pair of cities to show  */}
            {currentPair && !showVictory && !showDefeat && !showQueueModal && (
                <>
                    <DuelGrid $loading={loading}>
                        <AnimatedCardWrapper $delay="0.1s">
                            <DuelCard 
                                city={currentPair.cityA} 
                                buttonColor="#F19C4C" 
                                onSelect={() => handleVote(currentPair.cityA._id, currentPair.cityB._id, false)} 
                            />
                        </AnimatedCardWrapper>
                        <AnimatedCardWrapper $delay="0.2s">
                            <DuelCard 
                                city={currentPair.cityB} 
                                buttonColor="#5C9EAD" 
                                onSelect={() => handleVote(currentPair.cityB._id, currentPair.cityA._id, false)} 
                            />
                        </AnimatedCardWrapper>
                    </DuelGrid>
                    
                    
                    {/* wraps for shimmy animation */}
                    <div className="draw-wrap" style={{ width: '100%', maxWidth: '400px' }}>
                        <DuelAction 
                            onClick={() => handleVote(currentPair.cityA._id, currentPair.cityB._id, true)} 
                            disabled={loading} 
                        />
                    </div>
                </>
            )}

            {/* pops up to ask if the user wants to duel when a new city is added */}
            {showQueueModal && promptCity && (
                <Overlay>

                    <ModalBox>

                        <IconSpacer><Sword size={48} color="#326273" /></IconSpacer>
                        
                        <ModalTitle>New Entry Found</ModalTitle>
                        
                        {/* prompt with the city that hasn't been dueled */}
                        <ModalText><strong>{promptCity.name}</strong> hasn't been duelied yet. Start its gauntlet climb?</ModalText>
                        
                        {/* allow to duel the new entry */}
                        <ActionButton onClick={() => {
                            setShowQueueModal(false);
                            setIsCheckingQueue(false);
                            router.push(`/duel-gauntlet?challengerId=${promptCity._id}`);
                        }}>Duel {promptCity.name}</ActionButton>
                        
                        {/* allow to do some random duels   */}
                        <ActionButton $variant="secondary" onClick={() => {
                            setShowQueueModal(false);
                            setIsCheckingQueue(false);
                        }}>Random Duels</ActionButton>

                    </ModalBox>

                </Overlay>
            )}

            {/* "all caught up", allows for dueling random places once all duels are completed */}
            {showNoNewModal && (
                <Overlay>

                    <ModalBox>

                        <IconSpacer><Trophy size={48} color="#5C9EAD" /></IconSpacer>
                        
                        <ModalTitle>All Caught Up!</ModalTitle>
                        
                        <ModalText>Every destination in your list has been duelied. Keep sharpening your rankings?</ModalText>
                        
                        {/* continue dueling random ones */}
                        <ActionButton onClick={() => { setShowNoNewModal(false); setIsCheckingQueue(false); }}>
                            Let's Duel
                        </ActionButton>
                       
                        {/* return to the list */}
                        <ActionButton $variant="secondary" onClick={() => router.push('/list')}>
                            Back to List
                        </ActionButton>
                    
                    </ModalBox>
                
                </Overlay>
            )}

            {/* the new challenger has won, end gaunlet and show modal */}
            {showVictory && (
                <Overlay>
                    <ModalBox>
                        <IconSpacer><Trophy size={60} color="#F19C4C" /></IconSpacer>
                        <ModalTitle>New Rank #1!</ModalTitle>
                        <ModalText>The challenger has reached the top of your list.</ModalText>
                        <ActionButton onClick={() => router.push('/list')}>View Leaderboard</ActionButton>
                    </ModalBox>
                </Overlay>
            )}

            {/* the new challenger has lost, end gaunlet and show modal */}
            {showDefeat && (
                <Overlay>
                    <ModalBox>
                        <IconSpacer><XCircle size={60} color="#BF7245" /></IconSpacer>
                        <ModalTitle>Gauntlet Over</ModalTitle>
                        <ModalText>The challenger has settled into its new rank.</ModalText>
                        <ActionButton onClick={() => router.push('/list')}>Check Rankings</ActionButton>
                        <ActionButton $variant="secondary" onClick={() => { 
                            setShowDefeat(false); 
                            setLastOpponentId(null);
                            fetchNextDuel(null, null); 
                        }}>Continue Dueling</ActionButton>
                    </ModalBox>
                </Overlay>
            )}
        </GauntletPage>
    );
}
