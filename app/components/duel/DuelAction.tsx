'use client';
import styled from 'styled-components';

// colors for my own reference 
// blue slate: #326273
// pacific blue: #5C9EAD
// sky blue: #7DC4D4
// Cinnamon wood: #BF7245
// Sandy Brown: #F19C4C
// platinum: #EEEEEE



// wraps the tie button area so it's distinguished 
const ActionWrapper = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    padding-top: 2%;
    margin-top: 2%;
    /* makes a little line on top to seperate the areas */
    border-top: 1px solid #dddddd;
`;

// button stuff!
const DrawButton = styled.button`
    padding: 1% 2.5%;
    background-color: #326273;
    color: #eeeeee;
    font-weight: 700;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(241, 156, 76, 0.4);
    transition: all 0.2s ease-in-out;

    /* hovering, but not while button is disabled (page loading, etc.) */
    /* https://stackoverflow.com/questions/11600687/hover-and-active-only-when-not-disabled */
    /* makes button a little brighten to show its being hovered on, as well as lifting slightly */
    &:hover:not(:disabled) {
        filter: brightness(1.1);
        transform: translateY(-2px);
    }

    /* presses down when clicked */
    &:active:not(:disabled) {
        transform: scale(0.98);
    }

    /* loading! doesn't make it seem clickable */
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

/* just some renfrcing, makes it so it must have a function when clicked and allows us to say its disabled */
/* https://stevekinney.com/courses/react-typescript/component-props-complete-guide */
interface DuelActionProps {
    onClick: () => void;
    disabled?: boolean;
}

export const DuelAction = ({ onClick, disabled }: DuelActionProps) => (
    <ActionWrapper>
        <DrawButton onClick={onClick} disabled={disabled}>
            About the same
        </DrawButton>
    </ActionWrapper>
);