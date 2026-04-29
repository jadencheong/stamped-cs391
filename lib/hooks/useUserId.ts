'use client';
import { useEffect, useState } from 'react';
/* created by Alen */
//this hook will be used to replace all hard coded user id with the locally saved userID after login
// ready state was added to help aid everything loading before userID could be found in local storage
export function useUserId(): { userId: string | null; ready: boolean } {
    const [userId, setUserId] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // useEffect runs client side
        // read from localStorage on mount
        const id = localStorage.getItem('userId');
        setUserId(id);
        setReady(true); //only load after the local storage has been read
    }, []);

    return {userId, ready};
}