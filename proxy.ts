import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isDashboard = pathname.startsWith('/account');
    const isAdmin = pathname.startsWith('/admin');

    if (!isDashboard && !isAdmin) {
        return NextResponse.next();
    }

    const supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/signin';
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)',
    ],
};
