import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { DUTY_STATUS_LABELS } from "@/lib/format";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const status = req.nextUrl.searchParams.get("status");
  const where: { status?: string } = {};
  if (status && status !== "ALL") where.status = status;
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
      teacherId: r.teacherId,
      status: r.status,
      statusLabel: DUTY_STATUS_LABELS[r.status] ?? r.status,
      attendanceSummary: r.attendanceSummary,
      disciplineSummary: r.disciplineSummary,
      reviewNote: r.reviewNote,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
  });
}

export async function POST(req: NextRequest) {
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
  } = body as {
    weekNo?: number;
    startDate?: string;
    endDate?: string;
    teacherId?: string;
    attendanceSummary?: string;
    disciplineSummary?: string;
    cleanliness?: string;
    safety?: string;
    positives?: string[];
    improvements?: string[];
    noticeToParents?: string;
    status?: string;
  };
  if (!weekNo || !startDate || !endDate) {
    return NextResponse.json(
      { error: "Minggu, tarikh mula dan tamat diperlukan" },
      { status: 400 },
    );
  }
  const report = await db.dutyReport.create({
    data: {
      weekNo,
      startDate,
      endDate,
      teacherId: teacherId || user.teacherId || null,
      attendanceSummary: attendanceSummary ?? "",
      disciplineSummary: disciplineSummary ?? "",
      cleanliness: cleanliness ?? "",
      safety: safety ?? "",
      positives: JSON.stringify(positives ?? []),
      improvements: JSON.stringify(improvements ?? []),
      noticeToParents: noticeToParents ?? "",
      status: status ?? "DRAF",
    },
  });
  return NextResponse.json({ report });
}
