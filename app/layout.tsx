/**
 * app/layout.tsx
 *
 * Jaden changes:
 * - global font setup (Unbounded for headings, Roboto Condensed for body)
 * - global metadata (browser tab title, description)
 * - nav component rendered above all page content at top of page
 *
 * Ellen changes:
 * - added StyledComponentsRegistry to fix SSR hydration mismatch with styled-components
 * 
 * Anna changes:
 * add in duel icon
 */

import type { Metadata } from "next";
import { Unbounded, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import StyledComponentsRegistry from "@/lib/registry";
// from Anna
import DuelIcon from "./components/duel/DuelIcon";

// heading fonts as custom CSS property
// can be referenced anywhere as "--font-unbounded"
const unbounded = Unbounded({
    variable: "--font-unbounded",
    subsets: ["latin"],
});

// body font as custom CSS property
// can be referenced anywhere as ""--font-roboto-condensed
const robotoCondensed = Roboto_Condensed({
    variable: "--font-roboto-condensed",
    subsets: ["latin"],
});

//  controls browser tab title and search engine description
export const metadata: Metadata = {
    title: "Stamped",
    description: "Rank the cities you've visited",
};

export default function RootLayout({
    // children = whatever page is being rendered (feed, your list, etc)
    children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // font variables applied to html element as CSS variables throughout
        <html
            lang="en"
            className={`${unbounded.variable} ${robotoCondensed.variable} h-full antialiased`}
        >
        <body
            className="min-h full flex flex-col"
            style={{ fontFamily: 'var(--font-roboto-condensed), sans-serif' }}
        >
        <StyledComponentsRegistry>
            <Nav />
            { children }
            <DuelIcon />
        </StyledComponentsRegistry>
        </body>
        </html>
    );
}