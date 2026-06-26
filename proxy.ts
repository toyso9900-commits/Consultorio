import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth", "/_next", "/favicon.ico"];

function isPublic(path: string) {
  if (path.startsWith("/api/auth")) return true;
  if (path.startsWith("/_next")) return true;
  if (path.startsWith("/uploads/")) return true;
  return PUBLIC_PATHS.some((publicPath) =>
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
}

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  // Allow public assets, uploads and auth routes
  if (isPublic(path)) {
    return NextResponse.next();
  }

  // Not authenticated → login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  const isPatientRoute = path.startsWith("/paciente/dashboard");
  const isProfessionalRoute = path.startsWith("/profesional/dashboard");

  if (isPatientRoute && role !== "PATIENT") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isProfessionalRoute && role !== "ADMIN" && role !== "PROFESSIONAL") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*$).*)"],
};
