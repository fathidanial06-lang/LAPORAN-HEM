import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const students = await db.student.findMany({
    include: { class: true },
    orderBy: { id: "asc" },
  });
  return NextResponse.json({
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      ic: s.ic,
      classId: s.classId,
      className: s.class?.name ?? "",
      gender: s.gender,
      year: s.year,
      guardianName: s.guardianName,
      guardianPhone: s.guardianPhone,
      photoConsent: s.photoConsent,
      active: s.active,
      createdAt: s.createdAt,
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
    id,
    name,
    ic,
    classId,
    gender,
    year,
    guardianName,
    guardianPhone,
    photoConsent,
  } = body as {
    id?: string;
    name?: string;
    ic?: string;
    classId?: string;
    gender?: string;
    year?: number;
    guardianName?: string;
    guardianPhone?: string;
    photoConsent?: boolean;
  };
  if (!id || !name || !ic || !classId || !gender || !year || !guardianName) {
    return NextResponse.json(
      { error: "Sila lengkapkan semua medan wajib" },
      { status: 400 },
    );
  }
  const exists = await db.student.findUnique({ where: { id } });
  if (exists) {
    return NextResponse.json(
      { error: "ID pelajar sudah wujud" },
      { status: 400 },
    );
  }
  const student = await db.student.create({
    data: {
      id,
      name,
      ic,
      classId,
      gender,
      year,
      guardianName,
      guardianPhone: guardianPhone ?? "",
      photoConsent: photoConsent ?? false,
      photoConsentDate: photoConsent ? new Date() : null,
    },
  });
  await auditLog({
    userId: user.id,
    username: user.username,
    action: "CREATE",
    entity: "Student",
    entityId: student.id,
    detail: `Tambah pelajar ${student.name} (${student.id})`,
  });
  return NextResponse.json({ student });
}
