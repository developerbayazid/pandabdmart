import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveRedirect } from '@/lib/auth/resolve-redirect';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = request.nextUrl;
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const next = searchParams.get('redirect') ?? '/account';

    const supabase = await createClient();

    if (tokenHash && type) {
        const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as 'email' | 'recovery',
        });

        if (error || !data.user) {
            console.error('[api/auth/callback]', error);
            return NextResponse.redirect(`${origin}/signin?error=Unable+to+sign+in`);
        }

        const redirectTo = await resolveRedirect(data.user.id, next);
        return NextResponse.redirect(`${origin}${redirectTo}`);
    }

    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.user) {
            console.error('[api/auth/callback]', error);
            return NextResponse.redirect(`${origin}/signin?error=Unable+to+sign+in`);
        }

        const redirectTo = await resolveRedirect(data.user.id, next);
        return NextResponse.redirect(`${origin}${redirectTo}`);
    }

    return NextResponse.redirect(`${origin}/signin`);
}
