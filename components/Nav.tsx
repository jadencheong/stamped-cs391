/**
 * components/Nav.tsx
 *
 * global nav bar — rendered on every page via app/layout.tsx
 * links to all five main sections of the app.
 *
 * Routes:
 *   /          → Feed (Alen)
 *   /list      → Your List — personal city rankings (Jaden)
 *   /post      → Create a post (Alen)
 *   /leaderboard → Global city rankings (Jaden)
 *   /profile   → User profile (Ellen)
 *
 * created by: Jaden
 *
 * Ellen changes: hiding nav on login/signup page
 */

'use client';

import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import Link from 'next/link';

// STYLED COMPONENTS
// nav container — full width, sits above all page content via layout.tsx
const NavBar = styled.nav`
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 14px 0;
    background: #EEEEEE;
    border-bottom: 0.5px solid #e5e7eb;
    position: sticky;
    top: 0;
    // make sure nav sits visually on top of other page content
    z-index: 100;
`;

// individual nav link — bold when active route
const NavLink = styled(Link)<{ $active: boolean }>`
    font-size: calc( 8px + 1vw);
    font-weight: ${props => props.$active ? '600' : '400'};
    color: ${props => props.$active ? '#326273' : '#6b7280'};
    text-decoration: none;
    transition: color 0.15s ease;

    &:hover {
        color: #326273;
    }
`;

export default function Nav() {
    const pathname = usePathname();

    // hide nav on auth pages
    if (pathname === '/login' || pathname === '/signup') return null;

    return (
        <NavBar>
            <NavLink href="/" $active={pathname === '/'}>Feed</NavLink>
            <NavLink href="/list" $active={pathname === '/list'}>Your List</NavLink>
            <NavLink href="/post" $active={pathname === '/post'}>Post</NavLink>
            <NavLink href="/leaderboard" $active={pathname === '/leaderboard'}>Leaderboard</NavLink>
            <NavLink href="/profile" $active={pathname === '/profile'}>Profile</NavLink>
        </NavBar>
    );
}

