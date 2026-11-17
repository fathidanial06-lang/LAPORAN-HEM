import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

// GET existing attendance for class+date
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const classId = req.nextUrl.searchParams.get("classId");
  const date = req.nextUrl.searchParams.get("date");
  if (!classId || !date) {
    return NextResponse.json(
      { error: "classId dan date diperlukan" },
      { status: 400 },
    );
  }
  const students = await db.student.findMany({
    where: { classId, active: true },
    orderBy: { name: "asc" },
  });
  const records = await db.attendance.findMany({
    where: { date },
  });
  const map = new Map(records.map((r) => [r.studentId, r]));
  return NextResponse.json({
    date,
    classId,
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      status: map.get(s.id)?.status ?? null,
      timeIn: map.get(s.id)?.timeIn ?? null,
      note: map.get(s.id)?.note ?? null,
    })),
  });
}

// POST bulk attendance
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { classId, date, records } = body as {
    classId?: string;
    date?: string;
    records?: { studentId: string; status: string; timeIn?: string; note?: string }[];
  };
  if (!classId || !date || !Array.isArray(records)) {
    return NextResponse.json(
      { error: "classId, date dan records diperlukan" },
      { status: 400 },
    );
  }
  let count = 0;
  for (const r of records) {
    if (!r.studentId || !r.status) continue;
    await db.attendance.upsert({
      where: { studentId_date: { studentId: r.studentId, date } },
      create: {
        studentId: r.studentId,
        date,
        status: r.status,
        timeIn: r.timeIn ?? null,
        note: r.note ?? null,
        recordedBy: user.teacherId ?? null,
      },
      update: {
        status: r.status,
        timeIn: r.timeIn ?? null,
        note: r.note ?? null,
        recordedBy: user.teacherId ?? null,
      },
    });
    count++;
  }
  await auditLog({
    userId: user.id,
    username: user.username,
    action: "BULK_ATTENDANCE",
    entity: "Attendance",
    entityId: `${classId}/${date}`,
    detail: `Rekod kedatangan ${count} pelajar untuk ${classId} pada ${date}`,
  });
  return NextResponse.json({ ok: true, count });
}
