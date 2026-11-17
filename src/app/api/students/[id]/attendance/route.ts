import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  computeAttendanceStats,
  currentMonth,
} from "@/lib/format";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const month = req.nextUrl.searchParams.get("month") ?? currentMonth();
  const student = await db.student.findUnique({ where: { id } });
  if (!student || !student.active) {
    return NextResponse.json(
      { error: "Maklumat tidak dijumpai" },
      { status: 404 },
    );
  }
  const records = await db.attendance.findMany({
    where: { studentId: id, date: { startsWith: month } },
    orderBy: { date: "asc" },
  });

  // build trend for last 6 months ending at month
  const [y, m] = month.split("-").map((n) => parseInt(n, 10));
  const trend: { month: string; percentage: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    const mm = d.toISOString().slice(0, 7);
    const recs = await db.attendance.findMany({
      where: { studentId: id, date: { startsWith: mm } },
    });
    const stats = computeAttendanceStats(recs.map((r) => ({ status: r.status })));
    trend.push({ month: mm, percentage: stats.percentage });
  }

  const stats = computeAttendanceStats(records.map((r) => ({ status: r.status })));
  return NextResponse.json({
    month,
    records: records.map((r) => ({
      id: r.id,
      date: r.date,
      status: r.status,
      timeIn: r.timeIn,
      note: r.note,
    })),
    stats,
    trend,
  });
}
