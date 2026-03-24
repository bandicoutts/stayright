import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_NAME } from '@/lib/supabase/constants'

// Refresh the Supabase session on every request so it doesn't expire.
// Also protects authenticated routes — redirects unauthenticated users to /login.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
      cookieOptions: {
        name: COOKIE_NAME,
      },
    }
  )

  // Refresh the session — do not remove this call.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (process.env.CI) {
    console.log(`[Middleware] Path: ${request.nextUrl.pathname}, User ID: ${user?.id || 'none'}, Error: ${userError?.message || 'none'}`)
  }

  const { pathname } = request.nextUrl

  // Authenticated routes — redirect to /login if not signed in
  const isAppRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/trips') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/onboarding')

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect legacy /trips route to /dashboard after auth check
  if (pathname.startsWith('/trips')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    // Preserve modal intent if possible, or just go to dashboard
    if (pathname.endsWith('/plan')) url.searchParams.set('modal', 'plan')
    if (pathname.endsWith('/log')) url.searchParams.set('modal', 'log')
    return NextResponse.redirect(url)
  }

  // Already signed in — redirect away from auth pages
  // Note: /auth/callback and /auth/new-password are intentionally excluded:
  //   callback must be reachable to complete the session exchange,
  //   new-password requires the recovery session that the callback creates.
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/auth/verify-email' ||
    pathname === '/auth/reset-password' ||
    pathname === '/auth/check-email'
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Run on all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|supabase-api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
