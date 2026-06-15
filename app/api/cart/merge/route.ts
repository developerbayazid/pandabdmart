import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mergeGuestCart } from '@/services/cart.service';
import { GuestCartItem } from '@/types/cart';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const body = await req.json();
        const guestItems = body.items as GuestCartItem[] | undefined;

        if (!guestItems || !Array.isArray(guestItems)) {
            return NextResponse.json(
                { success: false, error: 'Invalid request body' },
                { status: 400 },
            );
        }

        const result = await mergeGuestCart(user.id, guestItems);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[api/cart/merge]', err);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}
