import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { PROGRAM_CATEGORY_LABELS } from "@/lib/format";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const programs = await db.program.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { participants: true } } },
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
      published: p.published,
      participantCount: p._count.participants,
      createdAt: p.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const {
    title,
    category,
    date,
    location,
    description,
    objectives,
    outcome,
    coverImage,
    gallery,
    published,
    participantIds,
  } = body as {
    title?: string;
    category?: string;
    date?: string;
    location?: string;
    description?: string;
    objectives?: string;
    outcome?: string;
    coverImage?: string;
    gallery?: string[];
    published?: boolean;
    participantIds?: string[];
  };
  if (!title || !category || !date) {
    return NextResponse.json(
      { error: "Tajuk, kategori dan tarikh diperlukan" },
      { status: 400 },
    );
  }

  // Photo consent warning if adding a student without photoConsent
  if (participantIds && participantIds.length > 0) {
    const consentless = await db.student.findMany({
      where: { id: { in: participantIds }, photoConsent: false },
      select: { id: true, name: true },
    });
    if (consentless.length > 0) {
      return NextResponse.json(
        {
          error:
            "Amaran: Terdapat pelajar tanpa keizinan foto: " +
            consentless.map((s) => s.name).join(", ") +
            ". Sila dapatkan keizinan ibu bapa terlebih dahulu.",
          consentless,
        },
        { status: 422 },
      );
    }
  }

  const program = await db.program.create({
    data: {
      title,
      category,
      date,
      location: location ?? "",
      description: description ?? "",
      objectives: objectives ?? "",
      outcome: outcome ?? "",
      coverImage: coverImage ?? null,
      gallery: JSON.stringify(gallery ?? []),
      published: published ?? true,
    },
  });
  if (participantIds && participantIds.length > 0) {
    await db.programParticipant.createMany({
      data: participantIds.map((sid) => ({
        programId: program.id,
        studentId: sid,
      })),
      skipDuplicates: true,
    });
  }
  await auditLog({
    userId: user.id,
    username: user.username,
    action: "CREATE_PROGRAM",
    entity: "Program",
    entityId: program.id,
    detail: `Cipta program ${program.title}`,
  });
  return NextResponse.json({ program });
}
