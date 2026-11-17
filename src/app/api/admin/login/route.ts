import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { username, password } = body as {
    username?: string;
    password?: string;
  };
  if (!username || !password) {
    return NextResponse.json(
      { error: "Sila masukkan nama pengguna dan kata laluan" },
      { status: 400 },
    );
  }
  const user = await db.user.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json(
      { error: "Nama pengguna atau kata laluan salah" },
      { status: 401 },
    );
  }
  // passwordHash format: "plain:$PLAINTEXT"
  const expected =
    user.passwordHash.startsWith("plain:")
      ? user.passwordHash.slice(6)
      : user.passwordHash;
  if (expected !== password) {
    return NextResponse.json(
      { error: "Nama pengguna atau kata laluan salah" },
      { status: 401 },
    );
  }
  await auditLog({
    userId: user.id,
    username: user.username,
    action: "LOGIN",
    entity: "User",
    entityId: user.id,
    detail: `Log masuk berjaya (${user.role})`,
  });
  const res = NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      teacherId: user.teacherId,
      name: user.name,
    },
  });
  // Set a cookie too (for any server-side use), but main auth uses header.
  res.cookies.set("adminSession", user.username, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
