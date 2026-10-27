import { NextResponse } from "next/server";
import { accessCookieName, accessCookieToken, hasAccess, isAccessScope, validateAccessPassword } from "@/lib/access-control";

export async function GET(request) {
  const scope = new URL(request.url).searchParams.get("scope");
  if (!isAccessScope(scope)) return NextResponse.json({ error: "Invalid access scope." }, { status: 400 });
  return NextResponse.json({ authorized: await hasAccess(scope) });
}

export async function POST(request) {
  try {
    const { scope, password } = await request.json();
    if (!isAccessScope(scope)) return NextResponse.json({ error: "Invalid access scope." }, { status: 400 });
    if (!validateAccessPassword(scope, password)) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    const token = accessCookieToken(scope);
    if (!token) return NextResponse.json({ error: "Access cookie secret is not configured." }, { status: 503 });
    const response = NextResponse.json({ authorized: true });
    response.cookies.set(accessCookieName(scope), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 12 * 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid access request." }, { status: 400 });
  }
}
