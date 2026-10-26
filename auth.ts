import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "si_rtlh_session";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 jam

export type SessionUser = {
  id: number;
  name: string;
  username: string;
  role: "SUPER_ADMIN" | "OPERATOR";
};

function getSecret() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ??
      "si-rtlh-konawe-secret-dev-1234567890-ganti-di-produksi"
  );
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    name: user.name,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return {
      id: Number(payload.sub),
      name: String(payload.name ?? ""),
      username: String(payload.username ?? ""),
      role: payload.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "OPERATOR",
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function canEdit(user: SessionUser | null): boolean {
  return !!user && (user.role === "SUPER_ADMIN" || user.role === "OPERATOR");
}
