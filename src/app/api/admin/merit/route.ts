import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, BERAT_ROLES } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const studentId = req.nextUrl.searchParams.get("studentId");
  const records = await db.meritRecord.findMany({
    where: studentId ? { studentId } : undefined,
    include: { student: { include: { class: true } }, category: true, teacher: true },
    orderBy: { date: "desc" },
    take: 100,
  });
  return NextResponse.json({
    records: records.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.student.name,
      className: r.student.class?.name ?? "",
      categoryId: r.categoryId,
      categoryName: r.category?.name ?? "",
      categoryType: r.category?.type ?? "",
      date: r.date,
      points: r.points,
      severity: r.severity,
      severityReason: r.severityReason,
      note: r.note,
      recordedBy: r.recordedBy,
      recordedByName: r.teacher?.name ?? null,
      voided: r.voided,
      voidReason: r.voidReason,
      voidedAt: r.voidedAt,
      createdAt: r.createdAt,
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
    categoryId,
    date,
    points,
    severity,
    severityReason,
    note,
  } = body as {
    studentId?: string;
    categoryId?: string;
    date?: string;
    points?: number;
    severity?: string;
    severityReason?: string;
    note?: string;
  };
  if (!studentId || !categoryId || !date) {
    return NextResponse.json(
      { error: "Sila pilih pelajar, kategori dan tarikh" },
      { status: 400 },
    );
  }
  const cat = await db.meritCategory.findUnique({ where: { id: categoryId } });
  if (!cat) {
    return NextResponse.json(
      { error: "Kategori tidak wujud" },
      { status: 400 },
    );
  }
  // Determine severity (only for demerit)
  let finalSeverity: string | null = cat.severity ?? null;
  let finalSeverityReason: string | null = null;
  if (cat.type === "DEMERIT") {
    if (severity && severity !== cat.severity) {
      // override - reason mandatory
      if (!severityReason) {
        return NextResponse.json(
          { error: "Sebab perubahan tahap diperlukan" },
          { status: 400 },
        );
      }
      finalSeverity = severity;
      finalSeverityReason = severityReason;
    }
    if (finalSeverity === "BERAT") {
      const ok = BERAT_ROLES.includes(user.role);
      if (!ok) {
        return NextResponse.json(
          {
            error:
              "Kes Berat hanya boleh direkod oleh Guru Kanan HEM / Pengetua / Superadmin",
          },
          { status: 403 },
        );
      }
    }
  }
  const finalPoints =
    typeof points === "number" ? points : cat.points;
  const record = await db.meritRecord.create({
    data: {
      studentId,
      categoryId,
      date,
      points: finalPoints,
      severity: finalSeverity,
      severityReason: finalSeverityReason,
      note: note ?? null,
      recordedBy: user.teacherId ?? null,
    },
  });
  await auditLog({
    userId: user.id,
    username: user.username,
    action: "CREATE_MERIT",
    entity: "MeritRecord",
    entityId: record.id,
    detail: `Rekod ${cat.type} (${cat.name}) pelajar ${studentId}: ${finalPoints} mata`,
  });
  return NextResponse.json({ record });
}
