import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { characterGrade } from "@/lib/format";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const studentId = req.nextUrl.searchParams.get("studentId");
  const assessments = await db.characterAssessment.findMany({
    where: studentId ? { studentId } : undefined,
    include: { student: { include: { class: true } }, teacher: true },
    orderBy: { period: "desc" },
  });
  return NextResponse.json({
    assessments: assessments.map((a) => ({
      id: a.id,
      studentId: a.studentId,
      studentName: a.student.name,
      className: a.student.class?.name ?? "",
      period: a.period,
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

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const {
    studentId,
    period,
    akhlak,
    ibadah,
    tanggungjawab,
    kebersihan,
    kerjasama,
    comment,
  } = body as {
    studentId?: string;
    period?: string;
    akhlak?: number;
    ibadah?: number;
    tanggungjawab?: number;
    kebersihan?: number;
    kerjasama?: number;
    comment?: string;
  };
  if (
    !studentId ||
    !period ||
    [akhlak, ibadah, tanggungjawab, kebersihan, kerjasama].some(
      (v) => typeof v !== "number",
    )
  ) {
    return NextResponse.json(
      { error: "Sila lengkapkan semua medan" },
      { status: 400 },
    );
  }
  const avg =
    (akhlak! + ibadah! + tanggungjawab! + kebersihan! + kerjasama!) / 5;
  const grade = characterGrade(avg);
  const assessment = await db.characterAssessment.upsert({
    where: { studentId_period: { studentId, period } },
    create: {
      studentId,
      period,
      akhlak: akhlak!,
      ibadah: ibadah!,
      tanggungjawab: tanggungjawab!,
      kebersihan: kebersihan!,
      kerjasama: kerjasama!,
      average: avg,
      grade,
      comment: comment ?? "",
      assessedBy: user.teacherId ?? null,
    },
    update: {
      akhlak: akhlak!,
      ibadah: ibadah!,
      tanggungjawab: tanggungjawab!,
      kebersihan: kebersihan!,
      kerjasama: kerjasama!,
      average: avg,
      grade,
      comment: comment ?? "",
      assessedBy: user.teacherId ?? null,
    },
  });
  await auditLog({
    userId: user.id,
    username: user.username,
    action: "ASSESS_CHARACTER",
    entity: "CharacterAssessment",
    entityId: assessment.id,
    detail: `Penilaian sahsiah pelajar ${studentId} untuk ${period} (${grade})`,
  });
  return NextResponse.json({ assessment });
}
