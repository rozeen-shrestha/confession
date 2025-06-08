import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set in environment variables.");
  }

  const session = await getToken({ req, secret });

  const protectedPaths = ["/admin"];
  const isProtected = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));

  if (isProtected) {
    if (!session || session.role !== "admin") {
      const url = new URL("login", req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
