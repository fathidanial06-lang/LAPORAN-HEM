import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  computeAttendanceStats,
  computeMeritStatus,
  formatIc,
  maskIc,
  bmMonthLabel,
  currentMonth,
} from "@/lib/format";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const student = await db.student.findUnique({
    where: { id },
    include: { class: true },
  });
  if (!student || !student.active) {
    return NextResponse.json(
      { error: "Maklumat tidak dijumpai" },
      { status: 404 },
    );
  }

  // Attendance: last 3 months including current
  const now = new Date();
  const months: string[] = [];
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  const attendanceByMonth: Record<
    string,
    ReturnType<typeof computeAttendanceStats>
  > = {};
  for (const m of months) {
    const recs = await db.attendance.findMany({
      where: { studentId: id, date: { startsWith: m } },
    });
    attendanceByMonth[m] = computeAttendanceStats(recs.map((r) => ({ status: r.status })));
  }
  const currentM = currentMonth();
  const currentStats = attendanceByMonth[currentM];

  // Character - latest assessment
  const assessments = await db.characterAssessment.findMany({
    where: { studentId: id },
    orderBy: { period: "desc" },
    include: { teacher: true },
  });
  const latestAssessment = assessments[0] ?? null;
  const previousAssessment = assessments[1] ?? null;

  // Merit
  const meritRecords = await db.meritRecord.findMany({
    where: { studentId: id },
    include: { category: true },
  });
  const meritStats = computeMeritStatus(
    meritRecords.map((r) => ({
      points: r.points,
      severity: r.severity,
      voided: r.voided,
    })),
  );

  // Programs
  const participants = await db.programParticipant.findMany({
    where: { studentId: id },
    include: { program: true },
  });
  const programs = participants
    .filter((p) => p.program.published)
    .map((p) => ({
      id: p.program.id,
      title: p.program.title,
      category: p.program.category,
      date: p.program.date,
      location: p.program.location,
      coverImage: p.program.coverImage,
    }));

  return NextResponse.json({
    profile: {
      id: student.id,
      name: student.name,
      icMasked: maskIc(student.ic),
      icFormatted: formatIc(student.ic),
      gender: student.gender,
      classId: student.classId,
      className: student.class?.name ?? "",
      year: student.year,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
    },
    attendanceStats: {
      months,
      byMonth: attendanceByMonth,
      currentMonth: currentM,
      current: currentStats,
    },
    character: latestAssessment
      ? {
          id: latestAssessment.id,
          period: latestAssessment.period,
          periodLabel: bmMonthLabel(latestAssessment.period),
          akhlak: latestAssessment.akhlak,
          ibadah: latestAssessment.ibadah,
          tanggungjawab: latestAssessment.tanggungjawab,
          kebersihan: latestAssessment.kebersihan,
          kerjasama: latestAssessment.kerjasama,
          average: latestAssessment.average,
          grade: latestAssessment.grade,
          comment: latestAssessment.comment,
          teacherName: latestAssessment.teacher?.name ?? null,
          previousAverage: previousAssessment?.average ?? null,
        }
      : null,
    merit: {
      ...meritStats,
      recent: meritRecords
        .filter((r) => !r.voided)
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 5)
        .map((r) => ({
          id: r.id,
          date: r.date,
          points: r.points,
          type: r.points >= 0 ? "MERIT" : "DEMERIT",
          categoryName: r.category?.name ?? "",
          categoryType: r.category?.type ?? "",
          severity: r.severity,
          isBerat: r.severity === "BERAT",
          note: r.note,
        })),
    },
    programs,
  });
}
