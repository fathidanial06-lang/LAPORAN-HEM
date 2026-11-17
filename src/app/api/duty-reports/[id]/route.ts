import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getSessionUser();
  const report = await db.dutyReport.findUnique({
    where: { id },
    include: { teacher: true },
  });
  if (!report) {
    return NextResponse.json(
      { error: "Laporan tidak dijumpai" },
      { status: 404 },
    );
  }
  // Public can only see DITERBITKAN
  if (!user && report.status !== "DITERBITKAN") {
    return NextResponse.json(
      { error: "Laporan tidak dijumpai" },
      { status: 404 },
    );
  }
  return NextResponse.json({
    id: report.id,
    weekNo: report.weekNo,
    startDate: report.startDate,
    endDate: report.endDate,
    teacherName: report.teacher?.name ?? "Tidak ditentukan",
    status: report.status,
    attendanceSummary: report.attendanceSummary,
    disciplineSummary: report.disciplineSummary,
    cleanliness: report.cleanliness,
    safety: report.safety,
    positives: safeParse(report.positives),
    improvements: safeParse(report.improvements),
    noticeToParents: report.noticeToParents,
    reviewNote: report.reviewNote,
    approvedBy: report.approvedBy,
    approvedAt: report.approvedAt,
  });
}

function safeParse(s: string): string[] {
  try {
    const v = JSON.parse(s);
    if (Array.isArray(v)) return v.map((x) => String(x));
  } catch {
    return s ? [s] : [];
  }
  return [];
}
