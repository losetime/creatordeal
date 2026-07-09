import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
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
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup") || request.nextUrl.pathname.startsWith("/verify-email")
  const isLandingPage = request.nextUrl.pathname === "/"
  const isLegalPage = request.nextUrl.pathname.startsWith("/terms") || request.nextUrl.pathname.startsWith("/privacy") || request.nextUrl.pathname.startsWith("/refund") || request.nextUrl.pathname.startsWith("/reset-password")
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/")
  const isStatic = request.nextUrl.pathname.startsWith("/_next") || request.nextUrl.pathname.includes(".")

  if (isStatic || isApiRoute) {
    return supabaseResponse
  }

  if (!user && !isAuthPage && !isLandingPage && !isLegalPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/home"
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/home"
    return NextResponse.redirect(url)
  }

  // Auto-downgrade expired subscriptions
  if (user && !isAuthPage && !isLandingPage && !isLegalPage && !isApiRoute && !isStatic) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, subscription_expires_at")
      .eq("id", user.id)
      .single()

    if (profile?.plan === "pro" && profile?.subscription_expires_at) {
      const expiresAt = new Date(profile.subscription_expires_at)
      if (expiresAt < new Date()) {
        // Subscription expired, downgrade to free
        await supabase
          .from("profiles")
          .update({
            plan: "free",
            subscription_status: "expired",
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
