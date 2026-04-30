'use client';
import styled, { keyframes } from 'styled-components';
// icon library :]
// https://www.npmjs.com/package/lucide-react 
import { Info, XCircle, Sword } from 'lucide-react';
import Image from 'next/image';

/**
 * components/duel/DuelCard.tsx
 * 
 * FILE OVERVIEW:
 * This component represents an individual competitor in the duel. It displays 
 * the city image, name, and a hoverable info tooltip for descriptions. It 
 * features a unique "shimmy" animation triggered when the selection button  is 
 * hovered, providing visual feedback for the user's potential choice :]
 *
 */


// created by Anna

// colors for my own reference 
// blue slate: #326273
// pacific blue: #5C9EAD
// sky blue: #7DC4D4
// Cinnamon wood: #BF7245
// Sandy Brown: #F19C4C
// platinum: #EEEEEE

// animations, very similar to how they work in normal css/html actually (which I've used before)
// didn't steal the animation itself, but helped me make sure i got the styled-components syntax correct
// https://medium.com/@matt.readout/adding-css-animations-with-styled-components-6c191c23b6ba
const shimmy = keyframes`
    0% { transform: rotate(0deg); }
    25% { transform: rotate(1deg); }
    50% { transform: rotate(0deg); }
    75% { transform: rotate(-1deg); }
    100% { transform: rotate(0deg); }
`;

// wraps the card area, provides shaking zone
const CardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5vh;
    width: 100%;
    max-width: 100%;
    text-align: center;

    /* shimmy when the button is being hovered over!!!! ahhhh this might be my favorite part */
    /* checks to see if button is being hovered on, finds loops classes with .shimmy-element animation while hovered */
    &:has(button:hover) .shimmy-element {
        animation: ${shimmy} 0.25s ease-in-out infinite;
    }
`;

//  wraps the content for formatting
const ContentWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25vh;
`;


// wraps image
const ImageWrapper = styled.div`
    position: relative;
    width: 100%;
    /* for uniformity */
    /* https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio */
    aspect-ratio: 4/3;
    overflow: hidden;
    border-radius: 2vh;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    background: #EEEEEE;
    display: block;
`;

// decides how the image resizes 
// https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit
const StyledImage = styled(Image)`
    object-fit: cover;
`;

const TitleRow = styled.div`
    display: flex;
    align-items: center;
    gap: 5%;
    position: relative; /* for tooltip positioning */
    z-index: 100;
`;

// the little 'i' icon popup thing (the actual information part)
const Tooltip = styled.div`
    /* abosolute positioning so the tool tip doesn't "push" other elements out of the way */
    /* it lays overtop instead */
    position: absolute;
    bottom: 120%; /* pushes it above the 'i' icon */
    /* https://stackoverflow.com/questions/25982135/why-does-left-50-transform-translatex-50-horizontally-center-an-element */
    left: 50%; /* pushes it slightly to left */
    transform: translateX(-50%); /* then pushes it back (for good centering) */
    background: #326273;
    color: #EEEEEE;
    padding: 0.75%;
    border-radius: 0.5%;
    font-size: calc(8px + 0.5vw);
    width: 200px;
    pointer-events: none; /* explicitly say nothing happens to cursors when hovering, just has this pop up */
    opacity: 0;
    transition: opacity 0.1s ease-in-out; /* instant speed pop-up for the tool tip when hovering over the 'i' icon*/
    z-index: 10; /* raise z-index so it floats above the rest of the content */
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);

    /* https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::after */
    &::after {
        /* create another pseudo element, add content property so it renders */
        content: '';
        /* put the arrow at very bottom edge center of bubble (so it looks like it's springing up) */
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #326273 transparent transparent transparent;
    }
`;

// the actual 'i' icon :]
const InfoButton = styled.div`
    color: #5C9EAD;
    display: flex;
    align-items: center;

    /* when we hover on this, it looks for the tooltip component and ensures it opacity is 1 */
    /* referring to the styled component like this https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Nesting_selector */
    /* but with CSS descendant combinator https://www.w3schools.com/css/css_combinators.asp */
    &:hover ${Tooltip} {
        opacity: 1;
    }
`;

// title of destination for card
const CityTitle = styled.h2`
    white-space: nowrap; /* try to force it to one line */
    font-family: 'Helvetica', sans-serif;
    font-size: calc(4px + 2vw);
    font-weight: 700;
    color: #326273;
    margin: 0;
`;

// the choice buttons
const SelectButton = styled.button<{ $buttonColor?: string }>` // Changed name here
    width: 100%;
    padding: 3.5%;
    /* Use the $buttonColor prop, or default to the sky blue if missing */
    background-color: ${props => props.$buttonColor || '#7DC4D4'}; 
    color: white;
    font-weight: 700;
    border: none;
    border-radius: 7px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        filter: brightness(0.9);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
`;



export const DuelCard = ({ city, onSelect, buttonColor }: any) => (
    <CardContainer>
        <ContentWrapper className="shimmy-element">
            <ImageWrapper>
                <StyledImage src={city.imageUrl} alt={city.name} fill />
            </ImageWrapper>

            <TitleRow>
                <CityTitle>{city.name}, {city.country}</CityTitle>
                <InfoButton>
                    <Info size={20} />
                    <Tooltip>{city.description}</Tooltip>
                </InfoButton>
            </TitleRow>
        </ContentWrapper>

        <SelectButton 
            $buttonColor={buttonColor} // pass the color here
            onClick={() => onSelect(city._id)}
        >
            Choose {city.name}
        </SelectButton>
    </CardContainer>
);