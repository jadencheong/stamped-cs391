/**
 * lib/registry.tsx
 *
 * Styled-components registry for Next.js SSR compatibility.
 * Collects all styled-component styles during server rendering and injects
 * them into the HTML before it's sent to the browser, ensuring class names
 * match between server and client to prevent hydration mismatches.
 *
 * Wrap the root layout body with this component to apply globally.
 *
 * Created by: Ellen
 */

'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

export default function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
    const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

    useServerInsertedHTML(() => {
        const styles = styledComponentsStyleSheet.getStyleElement();
        styledComponentsStyleSheet.instance.clearTag();
        return <>{styles}</>;
    });

    if (typeof window !== 'undefined') return <>{children}</>;

    return (
        <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
            {children}
        </StyleSheetManager>
    );
}