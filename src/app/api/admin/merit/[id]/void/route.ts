import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const { reason } = await req.json().catch(() => ({}));
  if (!reason) {
    return NextResponse.json(
      { error: "Sebab pembatalan diperlukan" },
      { status: 400 },
    );
  }
  const record = await db.meritRecord.update({
    where: { id },
    data: {
      voided: true,
      voidReason: reason,
      voidedBy: user.teacherId ?? null,
      voidedAt: new Date(),
    },
  });
  await auditLog({
    userId: user.id,
    username: user.username,
    action: "VOID_MERIT",
    entity: "MeritRecord",
    entityId: id,
    detail: `Batalkan rekod merit pelajar ${record.studentId}: ${reason}`,
  });
  return NextResponse.json({ ok: true });
}
