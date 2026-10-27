import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAMES = { tests: "edunote_tests_access", create: "edunote_create_access" };
const PASSWORD_VARIABLES = { tests: "TEST_ACCESS_PASSWORD", create: "CREATE_ACCESS_PASSWORD" };

export function isAccessScope(scope) {
  return Object.hasOwn(COOKIE_NAMES, scope);
}

function constantTimeMatch(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  return timingSafeEqual(createHash("sha256").update(left).digest(), createHash("sha256").update(right).digest());
}

export function validateAccessPassword(scope, password) {
  if (!isAccessScope(scope)) return false;
  const expected = process.env[PASSWORD_VARIABLES[scope]];
  return Boolean(expected) && constantTimeMatch(password, expected);
}

export function accessCookieToken(scope) {
  const secret = process.env.ACCESS_COOKIE_SECRET;
  if (!secret || !isAccessScope(scope)) return null;
  return createHmac("sha256", secret).update(`edunote:${scope}:authorized`).digest("hex");
}

export async function hasAccess(scope) {
  const name = COOKIE_NAMES[scope];
  const expected = accessCookieToken(scope);
  if (!name || !expected) return false;
  const cookieStore = await cookies();
  return constantTimeMatch(cookieStore.get(name)?.value, expected);
}

export async function hasAnyAccess(scopes) {
  for (const scope of scopes) if (await hasAccess(scope)) return true;
  return false;
}

export function accessCookieName(scope) {
  return COOKIE_NAMES[scope];
}
