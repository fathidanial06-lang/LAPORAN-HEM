import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

export async function POST() {
  const user = await getSessionUser();
  if (user) {
    await auditLog({
      userId: user.id,
      username: user.username,
      action: "LOGOUT",
      entity: "User",
      entityId: user.id,
      detail: "Log keluar",
    });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("adminSession");
  return res;
}
