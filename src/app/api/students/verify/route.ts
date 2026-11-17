import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { studentId, lastFour } = body as {
    studentId?: string;
    lastFour?: string;
  };
  if (!studentId || !lastFour) {
    return NextResponse.json(
      { verified: false, error: "Parameter tidak lengkap" },
      { status: 400 },
    );
  }
  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student || !student.active) {
    return NextResponse.json(
      { verified: false, error: "Maklumat tidak dijumpai" },
      { status: 404 },
    );
  }
  const last4 = String(lastFour).replace(/\D/g, "");
  const expected = student.ic.slice(-4);
  return NextResponse.json({ verified: last4 === expected });
}
