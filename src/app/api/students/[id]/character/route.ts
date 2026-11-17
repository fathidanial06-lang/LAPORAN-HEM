import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bmMonthLabel } from "@/lib/format";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const student = await db.student.findUnique({ where: { id } });
  if (!student || !student.active) {
    return NextResponse.json(
      { error: "Maklumat tidak dijumpai" },
      { status: 404 },
    );
  }
  const assessments = await db.characterAssessment.findMany({
    where: { studentId: id },
    orderBy: { period: "asc" },
    include: { teacher: true },
  });
  return NextResponse.json({
    assessments: assessments.map((a) => ({
      id: a.id,
      period: a.period,
      periodLabel: bmMonthLabel(a.period),
      akhlak: a.akhlak,
      ibadah: a.ibadah,
      tanggungjawab: a.tanggungjawab,
      kebersihan: a.kebersihan,
      kerjasama: a.kerjasama,
      average: a.average,
      grade: a.grade,
      comment: a.comment,
      teacherName: a.teacher?.name ?? null,
      createdAt: a.createdAt,
    })),
  });
}
