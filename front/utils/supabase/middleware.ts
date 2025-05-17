import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
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

    // Handle protected routes
    if (request.nextUrl.pathname.startsWith("/protected") && (!user || error)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Redirect authenticated users from landing to dashboard
    if (request.nextUrl.pathname === "/" && user && !error) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  } catch (e) {
    // If there's an error with protected routes, redirect to sign-in
    if (request.nextUrl.pathname.startsWith("/protected")) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
