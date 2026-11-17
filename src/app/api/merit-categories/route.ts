import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const categories = await db.meritCategory.findMany({
    orderBy: [{ type: "asc" }, { code: "asc" }],
  });
  return NextResponse.json({ categories });
}
