import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const teachers = await db.teacher.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({
    teachers: teachers.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      phone: t.phone,
    })),
  });
}
