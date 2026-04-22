'use client';
import styled from 'styled-components';

// colors for my own reference 
// blue slate: #326273
// pacific blue: #5C9EAD
// sky blue: #7DC4D4
// Cinnamon wood: #BF7245
// Sandy Brown: #F19C4C
// platinum: #EEEEEE

export const DuelGrid = styled.div<{ $loading?: boolean }>`
    display: grid;
    /* forces two equal columns */
    grid-template-columns: 1fr 1fr; /* fractional unit, split into equal halves */
    gap: 5%;
    max-width: 1000px;
    width: 100%;
    /* changes opacity to 50% when loading */
    opacity: ${props => (props.$loading ? 0.5 : 1)}; /* help make it visually clear its loading */
    /* chnages pointer to none when loading so users know not to click */
    pointer-events: ${props => (props.$loading ? 'none' : 'auto')}; 
    transition: opacity 0.2s ease;

    /* tightens gap on smaller screens */
    @media (max-width: 768px) { 
        grid-template-columns: 1fr; 
        gap: 4vh; 
    }
`;
