'use client';
import DuelManager from '@/app/components/duel/DuelManager';
import styled from 'styled-components';

// temporary test page stuffs 
const TestPage = styled.div`
    min-h-screen: 100vh;
    background-color: #EEEEEE;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export default function Page() {
    return (
        <TestPage>
        {/* renders entry button and the duel logic */}
        <DuelManager />
        </TestPage>
    );
}