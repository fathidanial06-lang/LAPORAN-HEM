import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { DUTY_STATUS_LABELS } from "@/lib/format";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  const status = req.nextUrl.searchParams.get("status");

  const where: { status?: string } = {};
  if (user) {
    if (status) where.status = status;
  } else {
    // public only sees DITERBITKAN
    where.status = "DITERBITKAN";
  }
  const reports = await db.dutyReport.findMany({
    where,
    include: { teacher: true },
    orderBy: [{ weekNo: "desc" }, { startDate: "desc" }],
  });
  return NextResponse.json({
    reports: reports.map((r) => ({
      id: r.id,
      weekNo: r.weekNo,
      startDate: r.startDate,
      endDate: r.endDate,
      teacherName: r.teacher?.name ?? "Tidak ditentukan",
      status: r.status,
      statusLabel: DUTY_STATUS_LABELS[r.status] ?? r.status,
      attendanceSummary: r.attendanceSummary,
      disciplineSummary: r.disciplineSummary,
      noticeToParents: r.noticeToParents,
    })),
  });
}
