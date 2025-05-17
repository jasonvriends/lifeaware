import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
    // Create a response object that we can modify
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Skip middleware for static routes
    const pathname = request.nextUrl.pathname
    if (STATIC_ROUTES.some(route => pathname.startsWith(route))) {
      return response
    }

    // Initialize Supabase client with enhanced error handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Ensure secure cookie settings
            response.cookies.set({
              name,
              value,
              ...options,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              httpOnly: true,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              httpOnly: true,
            })
          },
        },
      }
    )

    // Check auth status with timeout
    const { data: { user }, error: authError } = await withTimeout(
      supabase.auth.getUser(),
      5000 // 5 second timeout
    )

    if (authError) {
      console.error('Auth error:', authError)
      // Clear auth cookies on error
      response.cookies.set({
        name: 'supabase-auth-token',
        value: '',
        maxAge: 0,
        path: '/',
      })
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // Route protection logic
    const isAuthPage = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

    // Redirect authenticated users away from auth pages
    if (isAuthPage && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect unauthenticated users to sign-in
    if (isProtectedRoute && !user) {
      const returnUrl = encodeURIComponent(pathname)
      return NextResponse.redirect(new URL(`/sign-in?returnUrl=${returnUrl}`, request.url))
    }

    // Add user context to headers for server components
    if (user) {
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-role', user.role || 'user')
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

    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
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
