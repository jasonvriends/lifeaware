import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            request.cookies.delete({
              name,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.delete({
              name,
              ...options,
            });
          },
        },
      }
    );

    // Verify authentication using getUser
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Check if the request is for a protected route
    const isProtectedRoute = 
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/habits') ||
      request.nextUrl.pathname.startsWith('/goals') ||
      request.nextUrl.pathname.startsWith('/health') ||
      request.nextUrl.pathname.startsWith('/journal') ||
      request.nextUrl.pathname.startsWith('/profile') ||
      request.nextUrl.pathname.startsWith("/protected");

    // If it's a protected route and there's no authenticated user, redirect to sign-in
    if (isProtectedRoute && (!user || error)) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // If signed in and trying to access landing page, redirect to dashboard
    if (request.nextUrl.pathname === "/" && user && !error) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  } catch (e) {
    // If there's an error, redirect to sign-in for protected routes
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/protected')) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
