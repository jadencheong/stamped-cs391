// a place to put all of my animations for later reuse 

import styled, { keyframes } from 'styled-components';

// created by Anna

// effects for the "normal" stuff for bg/modal box
export const fadeIn = keyframes`
    from { 
        opacity: 0; 
    }
    to { 
        opacity: 1; 
        }
`;

export const slideUp = keyframes`
    from { transform: translateY(15px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
`;


// "thuds" down with some blur
// trying to give "let the epic battle commentce"
export const slamDown = keyframes`
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
export const shimmy = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-1deg); }
  100% { transform: rotate(0deg); }
`;

// SLAMS the cards down to feel more epic :]
export const AnimatedCardWrapper = styled.div<{ $delay: string }>`
    width: 100%;
    /* https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function/cubic-bezier */
    animation: ${slamDown} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; /* stolen from my duel stuff */
    animation-delay: ${props => props.$delay};

    /* trying to make sure things don't lag horifically */
    /* https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change */
    backface-visibility: hidden;
    will-change: transform, opacity, filter;
`;