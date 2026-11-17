import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatIc, isValidIc12, maskIc } from "@/lib/format";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("query")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ mode: "empty", ic: null, list: [] });
  }

  const digits = q.replace(/\D/g, "");

  // IC mode: exact 12-digit match
  if (isValidIc12(digits)) {
    const student = await db.student.findFirst({
      where: { ic: digits, active: true },
      include: { class: true },
    });
    if (student) {
      return NextResponse.json({
        mode: "ic",
        found: true,
        student: {
          id: student.id,
          name: student.name,
          ic: student.ic,
          classId: student.classId,
          className: student.class?.name ?? "",
          year: student.year,
          guardianName: student.guardianName,
        },
      });
    }
    return NextResponse.json({ mode: "ic", found: false });
  }

  // Name mode: partial, case-insensitive (SQLite contains is case-insensitive by default for ASCII)
  const students = await db.student.findMany({
    where: {
      active: true,
      name: { contains: q },
    },
    include: { class: true },
    take: 20,
  });
  const list = students.map((s) => ({
    id: s.id,
    name: s.name,
    classId: s.classId,
    className: s.class?.name ?? "",
    icMasked: maskIc(s.ic),
    icFormatted: formatIc(s.ic),
  }));
  return NextResponse.json({ mode: "name", found: list.length > 0, list });
}
