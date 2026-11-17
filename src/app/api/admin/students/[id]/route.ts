import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const {
    name,
    ic,
    classId,
    gender,
    year,
    guardianName,
    guardianPhone,
    photoConsent,
  } = body as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  if (typeof name === "string") data.name = name;
  if (typeof ic === "string") data.ic = ic;
  if (typeof classId === "string") data.classId = classId;
  if (typeof gender === "string") data.gender = gender;
  if (typeof year === "number") data.year = year;
  if (typeof guardianName === "string") data.guardianName = guardianName;
  if (typeof guardianPhone === "string") data.guardianPhone = guardianPhone;
  if (typeof photoConsent === "boolean") {
    data.photoConsent = photoConsent;
    data.photoConsentDate = photoConsent ? new Date() : null;
  }
  const student = await db.student.update({ where: { id }, data });
  await auditLog({
    userId: user.id,
    username: user.username,
    action: "UPDATE",
    entity: "Student",
    entityId: id,
    detail: `Kemaskini pelajar ${student.name} (${id})`,
  });
  return NextResponse.json({ student });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const student = await db.student.update({
    where: { id },
    data: { active: false },
  });
  await auditLog({
    userId: user.id,
    username: user.username,
    action: "DEACTIVATE",
    entity: "Student",
    entityId: id,
    detail: `Nyahaktif pelajar ${student.name} (${id})`,
  });
  return NextResponse.json({ ok: true });
}
