import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const school = await db.schoolInfo.findUnique({ where: { id: "singleton" } });
  if (!school) {
    return NextResponse.json(
      { error: "Maklumat sekolah tidak dijumpai" },
      { status: 404 },
    );
  }
  return NextResponse.json(school);
}
