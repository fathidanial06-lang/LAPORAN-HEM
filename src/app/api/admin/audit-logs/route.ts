import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const logs = await db.auditLog.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      userId: l.userId,
      username: l.username,
      action: l.action,
      entity: l.entity,
      entityId: l.entityId,
      detail: l.detail,
      createdAt: l.createdAt,
    })),
  });
}
