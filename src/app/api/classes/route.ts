import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const classes = await db.classRoom.findMany({
    include: { teacher: true },
    orderBy: [{ year: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({
    classes: classes.map((c) => ({
      id: c.id,
      name: c.name,
      year: c.year,
      homeroomTeacherId: c.homeroomTeacherId,
      homeroomTeacherName: c.teacher?.name ?? null,
    })),
  });
}
