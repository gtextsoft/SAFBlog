import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 renamed the `middleware` convention to `proxy`; this is the same
 * edge-run request interceptor under its current name.
 *
 * Refreshes the Supabase session on every request and gates /admin.
 *
 * Staff (admin or editor) may enter /admin. Admin-only sections redirect
 * editors to the denied login screen.
 */
const ADMIN_ONLY_PREFIXES = [
  "/admin/subscribers",
  "/admin/newsletter",
  "/admin/users",
  "/admin/donations",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() revalidates the token with Supabase. Do not swap this for
  // getSession(), which trusts the cookie without verifying it.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute) {
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "editor"]);

    const roles = (roleRows ?? []).map((r) => r.role);
    const isAdmin = roles.includes("admin");
    const isEditor = roles.includes("editor");

    if (!isAdmin && !isEditor) {
      return NextResponse.redirect(new URL("/admin/login?denied=1", request.url));
    }

    const adminOnly = ADMIN_ONLY_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
    if (adminOnly && !isAdmin) {
      return NextResponse.redirect(new URL("/admin/login?denied=1", request.url));
    }
  }

  // Already signed in as staff? Skip the login form.
  if (isLoginRoute && user) {
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "editor"]);

    if (roleRows && roleRows.length > 0) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Every path except static assets and image files. The session refresh
     * needs to run broadly; skipping these avoids pointless auth round-trips.
     */
    "/((?!_next/static|_next/image|favicon.ico|logos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|xml|txt)$).*)",
  ],
};
