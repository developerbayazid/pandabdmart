'use client';

import { useEffect } from 'react';

export function AdminBodyLock() {
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;

        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        body.style.height = '100vh';
        body.style.minHeight = '100vh';

        return () => {
            html.style.overflow = '';
            body.style.overflow = '';
            body.style.height = '';
            body.style.minHeight = '';
        };
    }, []);

    return null;
}
