import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, APPROVAL_ROLES } from "@/lib/auth";
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
    weekNo,
    startDate,
    endDate,
    teacherId,
    attendanceSummary,
    disciplineSummary,
    cleanliness,
    safety,
    positives,
    improvements,
    noticeToParents,
    status,
    reviewNote,
  } = body as Record<string, unknown>;

  const existing = await db.dutyReport.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "Laporan tidak dijumpai" },
      { status: 404 },
    );
  }

  // Status workflow enforcement
  if (typeof status === "string" && status !== existing.status) {
    if (
      status === "DILULUSKAN" ||
      status === "DIKEMBALIKAN" ||
      status === "DITERBITKAN"
    ) {
      const ok = APPROVAL_ROLES.includes(user.role);
      if (!ok) {
        return NextResponse.json(
          {
            error:
              "Hanya Guru Kanan HEM / Pengetua / Superadmin boleh meluluskan laporan",
          },
          { status: 403 },
        );
      }
    }
  }

  const data: Record<string, unknown> = {};
  if (typeof weekNo === "number") data.weekNo = weekNo;
  if (typeof startDate === "string") data.startDate = startDate;
  if (typeof endDate === "string") data.endDate = endDate;
  if (typeof teacherId === "string") data.teacherId = teacherId || null;
  if (typeof attendanceSummary === "string") data.attendanceSummary = attendanceSummary;
  if (typeof disciplineSummary === "string") data.disciplineSummary = disciplineSummary;
  if (typeof cleanliness === "string") data.cleanliness = cleanliness;
  if (typeof safety === "string") data.safety = safety;
  if (Array.isArray(positives)) data.positives = JSON.stringify(positives);
  if (Array.isArray(improvements)) data.improvements = JSON.stringify(improvements);
  if (typeof noticeToParents === "string") data.noticeToParents = noticeToParents;
  if (typeof status === "string") {
    data.status = status;
    if (
      status === "DILULUSKAN" ||
      status === "DIKEMBALIKAN" ||
      status === "DITERBITKAN"
    ) {
      data.approvedBy = user.id;
      data.approvedAt = new Date();
      data.reviewNote = typeof reviewNote === "string" ? reviewNote : null;
    }
  }

  const report = await db.dutyReport.update({ where: { id }, data });
  await auditLog({
    userId: user.id,
    username: user.username,
    action: "UPDATE_DUTY_REPORT",
    entity: "DutyReport",
    entityId: id,
    detail: `Kemaskini laporan bertugas minggu ${report.weekNo} -> status ${report.status}`,
  });
  return NextResponse.json({ report });
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
  const report = await db.dutyReport.delete({ where: { id } });
  await auditLog({
    userId: user.id,
    username: user.username,
    action: "DELETE_DUTY_REPORT",
    entity: "DutyReport",
    entityId: id,
    detail: `Padam laporan bertugas minggu ${report.weekNo}`,
  });
  return NextResponse.json({ ok: true });
}
