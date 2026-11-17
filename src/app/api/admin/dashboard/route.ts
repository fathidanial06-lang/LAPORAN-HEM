import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeAttendanceStats, todayStr } from "@/lib/format";

export async function GET() {
  const totalStudents = await db.student.count({ where: { active: true } });
  const today = todayStr();
  const todayAttendance = await db.attendance.findMany({
    where: { date: today },
  });
  const todayStats = computeAttendanceStats(
    todayAttendance.map((r) => ({ status: r.status })),
  );
  const todayPct =
    todayStats.effective > 0 ? todayStats.percentage : 0;

  // Students with demerit >= 30 (cleanPoints <= -30) or any BERAT
  const students = await db.student.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      classId: true,
      class: true,
      meritRecords: {
        where: { voided: false },
        select: { points: true, severity: true },
      },
    },
  });
  const highDemeritStudents = students
    .map((s) => {
      const total = s.meritRecords.reduce((acc, r) => acc + r.points, 0);
      const hasBerat = s.meritRecords.some((r) => r.severity === "BERAT");
      const absClean = Math.abs(total);
      const flagged = hasBerat || absClean >= 30;
      return flagged
        ? {
            id: s.id,
            name: s.name,
            className: s.class?.name ?? "",
            cleanPoints: total,
            hasBerat,
          }
        : null;
    })
    .filter(Boolean) as {
    id: string;
    name: string;
    className: string;
    cleanPoints: number;
    hasBerat: boolean;
  }[];

  const dutyPending = await db.dutyReport.count({
    where: { status: "MENUNGGU" },
  });

  const recentMerit = await db.meritRecord.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    where: { voided: false },
    include: { student: { include: { class: true } }, category: true },
  });

  const programsCount = await db.program.count();

  const auditLogs = await db.auditLog.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    totalStudents,
    todayAttendancePct: todayPct,
    todayAttendanceStats: todayStats,
    highDemeritCount: highDemeritStudents.length,
    highDemeritStudents,
    dutyPending,
    recentMerit: recentMerit.map((r) => ({
      id: r.id,
      date: r.date,
      points: r.points,
      studentName: r.student.name,
      className: r.student.class?.name ?? "",
      categoryName: r.category?.name ?? "",
      severity: r.severity,
    })),
    programsCount,
    auditLogs: auditLogs.map((a) => ({
      id: a.id,
      username: a.username,
      action: a.action,
      entity: a.entity,
      detail: a.detail,
      createdAt: a.createdAt,
    })),
  });
}
