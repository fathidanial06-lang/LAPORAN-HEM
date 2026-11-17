// Auth helper for admin session (prototaip)
// Reads x-admin-username header from client (stored in localStorage).
// Note: role constants live in lib/roles.ts so they can be imported
// by client components without dragging in next/headers.
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { APPROVAL_ROLES, BERAT_ROLES } from "@/lib/roles";

export type SessionUser = {
  id: string;
  username: string;
  role: string;
  teacherId: string | null;
  name: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const h = await headers();
  const username = h.get("x-admin-username");
  if (!username) return null;
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      role: true,
      teacherId: true,
      name: true,
    },
  });
  return user ?? null;
}

export function requireRole(
  user: SessionUser | null,
  roles: string[],
): { ok: boolean; user: SessionUser | null } {
  if (!user) return { ok: false, user: null };
  if (!roles.includes(user.role)) return { ok: false, user };
  return { ok: true, user };
}

export { APPROVAL_ROLES, BERAT_ROLES };
