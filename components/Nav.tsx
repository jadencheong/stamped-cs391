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
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
    const pathname = usePathname();

    return (
        // nav container styling
        <nav style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid #eee',
            background: 'white',
        }}>

            {/* each link styling with path */}
            <Link href="/" style={{
                fontWeight: pathname === '/' ? 'bold' : 'normal',
                textDecoration: 'none',
                color: 'black',
            }}>
                Feed
            </Link>

            <Link href="/list" style={{
                fontWeight: pathname === '/list' ? 'bold' : 'normal',
                textDecoration: 'none',
                color: 'black',
            }}>
                Your List
            </Link>

            <Link href="/post" style={{
                fontWeight: pathname === '/post' ? 'bold' : 'normal',
                textDecoration: 'none',
                color: 'black',
            }}>
                Post
            </Link>

            <Link href="/leaderboard" style={{
                fontWeight: pathname === '/leaderboard' ? 'bold' : 'normal',
                textDecoration: 'none',
                color: 'black',
            }}>
                Leaderboard
            </Link>

            <Link href="/profile" style={{
                fontWeight: pathname === '/profile' ? 'bold' : 'normal',
                textDecoration: 'none',
                color: 'black',
            }}>
                Profile
            </Link>

        </nav>
    );
}