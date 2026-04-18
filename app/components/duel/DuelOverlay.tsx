'use client';
import styled, { keyframes } from 'styled-components';
import { XCircle } from 'lucide-react'; // icons :]
import { DuelCard } from './DuelCard';
import { DuelAction } from './DuelAction';

/**
 * ANIMATIONS ZONE!!!
 */

// effects for the "normal" stuff for bg/modal box
const fadeIn = keyframes`
    from { 
        opacity: 0; 
    }
    to { 
        opacity: 1; 
        }
`;

const slideUp = keyframes`
    from { transform: translateY(15px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
`;


// "thuds" down with some blur
// trying to give "let the epic battle commentce"
const slamDown = keyframes`
    0% {
        opacity: 0;
        transform: scale(1.2) translateY(-30px);
        filter: blur(4px);
    }
    70% {
        transform: scale(0.98) translateY(2px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
        filter: blur(0);
    }
`;

// define shimmy here as well so ModalBody can access it
const shimmy = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-1deg); }
  100% { transform: rotate(0deg); }
`;


/**
 * STYLED COMPONENTS ZONE
 */

// serves as the "stage" for the rest of the duel 
// "blocks out" the stuff behind it with a blur
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  /* ensure it hovers over the content "below" it (any main page) */
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1%;
  background: rgba(0, 0, 0, 0.6);
  /* https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter */
  backdrop-filter: blur(8px);
  /* animation to smooth things out visually a little */
  animation: ${fadeIn} 0.3s ease-out;
`;

// actual content zone
const ModalContent = styled.div`
  position: relative;
  width: 90vw; 
  max-width: 1000px;
  background-color: #EEEEEE;
  border-radius: 2%;
  padding: 3% 2%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  /* once again, just make it seem a little more smooth instead of just popping into existence */
  animation: ${slideUp} 0.3s ease-out; 
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden; 
`;

// exit button
const CloseButton = styled.button`
  position: absolute;
  top: 1.5%;
  right: 1.5%;
  color: #BF7245;
  background: none;
  border: none;
  cursor: pointer; /* help specify that this is clickable */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  z-index: 10;

  /* cute little spin transition... kind of extra, but i like it :] */
  /* open to criticism, though */
  &:hover {
    transform: rotate(90deg);
  }
`;


const DuelGrid = styled.div<{ $loading?: boolean }>`
  display: grid;
  /* forces two equal columns */
  grid-template-columns: 1fr 1fr; /* fractional unit, split into equal halves */
  gap: 5%;
  justify-items: center;
  align-items: start;
  width: 100%;
  margin-bottom: 5%;
  /* changes opacity to 50% when loading */
  opacity: ${props => (props.$loading ? 0.5 : 1)};
  /* chnages pointer to none when loading so users know not to click */
  pointer-events: ${props => (props.$loading ? 'none' : 'auto')};
  transition: opacity 0.2s ease;

  /* tightens gap on smaller screens */
  @media (max-width: 768px) {
    gap: 2.5%;
  }
`;

// full duel header
const TitleHeader = styled.h1`
  font-family: 'Helvetica', sans-serif;
  font-size: calc(10px + 2.5vw);
  font-weight: 800;
  text-align: center;
  color: #326273;
  margin-bottom: 2.5rem;

`;

// SLAMS the cards down to feel more epic :]
const AnimatedCardWrapper = styled.div<{ $delay: string }>`
  width: 100%;
  /* overshoots the target to look more forceful */
  /* https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function/cubic-bezier */
  animation: ${slamDown} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: ${props => props.$delay};

  /* trying to make sure things don't lag horifically */
  /* https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change */
  backface-visibility: hidden;
  will-change: transform, opacity, filter;
`;


/**
 * TYPES
 */


interface Destination {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
}

interface DuelOverlayProps {
  cityA: Destination;
  cityB: Destination;
  onClose: () => void;
  onVote: (winnerId: string, loserId: string, isDraw: boolean) => void;
  loading: boolean;
}

const ModalBody = styled.div`
  /* when the draw-wrap is hovered, shimmy ALL elements with that class */
  &:has(.draw-wrap:hover) .shimmy-element {
    animation: ${shimmy} 0.25s ease-in-out infinite;
  }
`;

/**
 * FINAL COMPONENT
 */
export const DuelOverlay = ({ cityA, cityB, onClose, onVote, loading }: DuelOverlayProps) => (
  <ModalOverlay>
    <ModalContent>
      <CloseButton onClick={onClose}>
        <XCircle size={36} />
      </CloseButton>
      
      <TitleHeader>The Stamp Duel</TitleHeader>
      
      <ModalBody>
        <DuelGrid $loading={loading}>
          <AnimatedCardWrapper $delay="0.1s">
            <DuelCard 
              city={cityA} 
              buttonColor="#F19C4C" 
              onSelect={() => onVote(cityA._id, cityB._id, false)} 

            />
          </AnimatedCardWrapper>

          <AnimatedCardWrapper $delay="0.2s">
            <DuelCard 
              city={cityB} 
              buttonColor="#5C9EAD" 
              onSelect={() => onVote(cityB._id, cityA._id, false)} 
            />
          </AnimatedCardWrapper>
        </DuelGrid>


        {/*  triggers the double shimmy in ModalBody */}
        <div className="draw-wrap">
          <DuelAction 
            onClick={() => onVote(cityA._id, cityB._id, true)} 
            disabled={loading} 
          />
        </div>
      </ModalBody>
    </ModalContent>
  </ModalOverlay>
);