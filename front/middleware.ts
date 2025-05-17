import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './utils/supabase/server'

// Define route patterns
const PUBLIC_ROUTES = ['/', '/sign-in', '/sign-up', '/forgot-password']
const PROTECTED_ROUTES = ['/dashboard', '/habits', '/goals', '/health', '/journal', '/profile']
const STATIC_ROUTES = ['/_next', '/favicon.ico', '/public', '/api']

// Custom error for timeout
class TimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TimeoutError'
  }
}

// Timeout wrapper for promises
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new TimeoutError('Request timed out')), ms)
  })
  return Promise.race([promise, timeout])
}

export async function middleware(request: NextRequest) {
  try {
    // Skip middleware for static routes
    const pathname = request.nextUrl.pathname
    if (STATIC_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    // Initialize Supabase client
    const supabase = createClient(request)

    // Check auth status with timeout
    const { data: { user }, error: authError } = await withTimeout(
      supabase.auth.getUser(),
      5000 // 5 second timeout
    )

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // Route protection logic
    const isAuthPage = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

    // Create base response
    let response = NextResponse.next()

    // Add user context to headers for server components if user exists
    if (user) {
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-role', user.role || 'user')
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect unauthenticated users to sign-in
    if (isProtectedRoute && !user) {
      const returnUrl = encodeURIComponent(pathname)
      return NextResponse.redirect(new URL(`/sign-in?returnUrl=${returnUrl}`, request.url))
    }

    return response
  } catch (e) {
    console.error('Middleware error:', e)

    // Handle timeout errors specifically
    if (e instanceof TimeoutError) {
      return NextResponse.redirect(new URL('/sign-in?error=timeout', request.url))
    }

    // For other errors, redirect to error page or sign-in
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/sign-in?error=auth', request.url))
    }

    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Match all protected routes
    '/dashboard/:path*',
    '/habits/:path*',
    '/goals/:path*',
    '/health/:path*',
    '/journal/:path*',
    '/profile/:path*',
    // Match auth routes
    '/sign-in',
    '/sign-up',
    '/forgot-password',
  ],
}
