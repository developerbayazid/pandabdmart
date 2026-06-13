'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[app/error]', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="text-center max-w-md">
                <h1 className="text-2xl font-semibold text-text-primary mb-2">
                    Something went wrong
                </h1>
                <p className="text-sm text-text-secondary mb-6">
                    We apologize for the inconvenience. Please try again or contact support if the problem persists.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Button onClick={reset} variant="primary">
                        Try again
                    </Button>
                    <Button onClick={() => window.location.href = '/'} variant="secondary">
                        Go home
                    </Button>
                </div>
            </div>
        </div>
    );
}
