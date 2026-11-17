import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PROGRAM_CATEGORY_LABELS } from "@/lib/format";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  const category = req.nextUrl.searchParams.get("category");
  const where: { published?: boolean; category?: string } = {};
  if (!user) where.published = true;
  if (category && category !== "ALL") where.category = category;
  const programs = await db.program.findMany({
    where,
    orderBy: { date: "desc" },
  });
  return NextResponse.json({
    programs: programs.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      categoryLabel:
        PROGRAM_CATEGORY_LABELS[p.category] ?? p.category,
      date: p.date,
      location: p.location,
      coverImage: p.coverImage,
      description: p.description,
      published: p.published,
    })),
  });
}
