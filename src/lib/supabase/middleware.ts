import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    const path = request.nextUrl.pathname;
    if (path === "/login" || path.startsWith("/auth")) {
      return NextResponse.next({ request });
    }
    const u = request.nextUrl.clone();
    u.pathname = "/login";
    return NextResponse.redirect(u);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/auth") ||
    path === "/auth/auth-code-error";

  if (!user && !isAuthRoute) {
    const u = request.nextUrl.clone();
    u.pathname = "/login";
    return NextResponse.redirect(u);
  }

  if (user && path === "/login") {
    const u = request.nextUrl.clone();
    u.pathname = "/";
    return NextResponse.redirect(u);
  }

  return supabaseResponse;
}
