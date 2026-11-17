import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeMeritStatus } from "@/lib/format";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const filter = req.nextUrl.searchParams.get("filter") ?? "all";
  const month = req.nextUrl.searchParams.get("month") ?? "";
  const student = await db.student.findUnique({ where: { id } });
  if (!student || !student.active) {
    return NextResponse.json(
      { error: "Maklumat tidak dijumpai" },
      { status: 404 },
    );
  }
  const where: { studentId: string; voided?: boolean; date?: { startsWith: string } } = {
    studentId: id,
    voided: false,
  };
  if (month) where.date = { startsWith: month };
  const records = await db.meritRecord.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
  });

  // Mask Kes Berat records for parent context - show category type "Kes Berat" + level, no note
  const masked = records.map((r) => {
    const isBerat = r.severity === "BERAT";
    return {
      id: r.id,
      date: r.date,
      points: r.points,
      type: r.points >= 0 ? "MERIT" : "DEMERIT",
      categoryName: isBerat ? "Kes Berat" : r.category?.name ?? "",
      categoryType: r.category?.type ?? "",
      group: r.category?.group ?? null,
      severity: r.severity,
      isBerat,
      needsParentMeeting: isBerat,
      note: isBerat ? null : r.note,
      recordedAt: r.createdAt,
    };
  });

  const filtered = masked.filter((r) => {
    if (filter === "merit") return r.type === "MERIT";
    if (filter === "demerit") return r.type === "DEMERIT";
    return true;
  });

  // Recompute totals from all active records (not filtered)
  const allRecords = await db.meritRecord.findMany({
    where: { studentId: id, voided: false },
    include: { category: true },
  });
  const stats = computeMeritStatus(
    allRecords.map((r) => ({
      points: r.points,
      severity: r.severity,
      voided: r.voided,
    })),
  );

  return NextResponse.json({ records: filtered, stats });
}
