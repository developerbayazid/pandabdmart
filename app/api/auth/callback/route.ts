import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = request.nextUrl;
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const next = searchParams.get('redirect') ?? '/account';

    const supabase = await createClient();

    if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as 'email' | 'recovery',
        });

        if (error) {
            console.error('[api/auth/callback]', error);
            return NextResponse.redirect(`${origin}/signin?error=Unable+to+sign+in`);
        }

        return NextResponse.redirect(`${origin}${next}`);
    }

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('[api/auth/callback]', error);
            return NextResponse.redirect(`${origin}/signin?error=Unable+to+sign+in`);
        }

        return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(`${origin}/signin`);
}
