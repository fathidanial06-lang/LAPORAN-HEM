import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PROGRAM_CATEGORY_LABELS } from "@/lib/format";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getSessionUser();
  const program = await db.program.findUnique({
    where: { id },
    include: { participants: { include: { student: true } } },
  });
  if (!program) {
    return NextResponse.json(
      { error: "Program tidak dijumpai" },
      { status: 404 },
    );
  }
  if (!user && !program.published) {
    return NextResponse.json(
      { error: "Program tidak dijumpai" },
      { status: 404 },
    );
  }
  // optional: pass ?studentId= to check participation
  const studentId = req.nextUrl.searchParams.get("studentId");
  const participating = studentId
    ? program.participants.some((p) => p.studentId === studentId)
    : false;

  return NextResponse.json({
    id: program.id,
    title: program.title,
    category: program.category,
    categoryLabel:
      PROGRAM_CATEGORY_LABELS[program.category] ?? program.category,
    date: program.date,
    location: program.location,
    description: program.description,
    objectives: program.objectives,
    outcome: program.outcome,
    coverImage: program.coverImage,
    gallery: safeParse(program.gallery),
    published: program.published,
    participantCount: program.participants.length,
    participating,
  });
}

function safeParse(s: string): string[] {
  try {
    const v = JSON.parse(s);
    if (Array.isArray(v)) return v.map((x) => String(x));
  } catch {
    return s ? [s] : [];
  }
  return [];
}
