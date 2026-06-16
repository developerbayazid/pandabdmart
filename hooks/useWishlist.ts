'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    addToWishlistAction,
    removeFromWishlistByVariantAction,
    checkWishlistAction,
} from '@/actions/wishlist.actions';

type UseWishlistResult = {
    isWishlisted: boolean;
    isLoading: boolean;
    toggle: () => void;
};

export function useWishlist(variantId: string | undefined): UseWishlistResult {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data }) => {
            setIsAuthenticated(!!data.session);
        });
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !variantId) {
            setIsWishlisted(false);
            return;
        }

        let cancelled = false;
        checkWishlistAction(variantId).then((result) => {
            if (!cancelled) {
                setIsWishlisted(result.isWishlisted);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, variantId]);

    const toggle = useCallback(() => {
        if (!variantId || isLoading) return;

        if (!isAuthenticated) {
            window.location.href = '/signin';
            return;
        }

        setIsLoading(true);

        if (isWishlisted) {
            removeFromWishlistByVariantAction(variantId).then((result) => {
                if (result.success) {
                    setIsWishlisted(false);
                }
                setIsLoading(false);
            });
        } else {
            addToWishlistAction(variantId).then((result) => {
                if (result.success) {
                    setIsWishlisted(true);
                }
                setIsLoading(false);
            });
        }
    }, [variantId, isWishlisted, isAuthenticated, isLoading]);

    return { isWishlisted, isLoading, toggle };
}
