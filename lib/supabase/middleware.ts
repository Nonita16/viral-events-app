import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Check if user is anonymous (has a session but no email)
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const isAnonymous = authUser?.is_anonymous || false;

  // Define public routes that don't require authentication
  const publicRoutes = ["/"];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // Allow public access to /events pages but not /events/create
  const isEventsView = request.nextUrl.pathname.startsWith("/events") &&
    !request.nextUrl.pathname.startsWith("/events/create");

  // Allow public access to GET /api/events and /api/rsvps/counts (but not POST)
  const isPublicApiRoute =
    request.nextUrl.pathname === "/api/events" && request.method === "GET" ||
    request.nextUrl.pathname.startsWith("/api/events/") && request.method === "GET" ||
    request.nextUrl.pathname === "/api/events/latest" && request.method === "GET" ||
    request.nextUrl.pathname === "/api/rsvps/counts" && request.method === "GET" ||
    request.nextUrl.pathname.startsWith("/api/rsvps/event/") && request.method === "GET" ||
    request.nextUrl.pathname === "/api/referrals/track-click" && request.method === "POST";

  // Routes that require full authentication (not anonymous)
  const protectedRoutes = ["/protected", "/invites", "/events/create", "/analytics"];
  const requiresFullAuth = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirect anonymous users trying to access protected routes
  if (isAnonymous && requiresFullAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users
  if (
    !user &&
    !isPublicRoute &&
    !isEventsView &&
    !isPublicApiRoute &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
