import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from 'next/headers';

export const createClient = () => {
  const cookieStore = cookies() as unknown as ReadonlyRequestCookies;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? '';
        },
        set(name: string, value: string, options: CookieOptions) {
          // Cookie management is handled by middleware
        },
        remove(name: string, options: CookieOptions) {
          // Cookie management is handled by middleware
        },
      },
    }
  );
};
