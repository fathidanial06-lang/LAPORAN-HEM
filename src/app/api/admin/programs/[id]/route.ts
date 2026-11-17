import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
  } = body as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  if (typeof title === "string") data.title = title;
  if (typeof category === "string") data.category = category;
  if (typeof date === "string") data.date = date;
  if (typeof location === "string") data.location = location;
  if (typeof description === "string") data.description = description;
  if (typeof objectives === "string") data.objectives = objectives;
  if (typeof outcome === "string") data.outcome = outcome;
  if (typeof coverImage === "string") data.coverImage = coverImage || null;
  if (Array.isArray(gallery)) data.gallery = JSON.stringify(gallery);
  if (typeof published === "boolean") data.published = published;

  const program = await db.program.update({ where: { id }, data });

  if (Array.isArray(participantIds)) {
    // Replace participants
    await db.programParticipant.deleteMany({ where: { programId: id } });
    if (participantIds.length > 0) {
      const consentless = await db.student.findMany({
        where: { id: { in: participantIds as string[] }, photoConsent: false },
        select: { id: true, name: true },
      });
      if (consentless.length > 0) {
        return NextResponse.json(
          {
            error:
              "Amaran: Terdapat pelajar tanpa keizinan foto: " +
              consentless.map((s) => s.name).join(", "),
          },
          { status: 422 },
        );
      }
      await db.programParticipant.createMany({
        data: (participantIds as string[]).map((sid) => ({
          programId: id,
          studentId: sid,
        })),
        skipDuplicates: true,
      });
    }
  }

  await auditLog({
    userId: user.id,
    username: user.username,
    action: "UPDATE_PROGRAM",
    entity: "Program",
    entityId: id,
    detail: `Kemaskini program ${program.title}`,
  });
  return NextResponse.json({ program });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });
  }
  const program = await db.program.delete({ where: { id } });
  await auditLog({
    userId: user.id,
    username: user.username,
    action: "DELETE_PROGRAM",
    entity: "Program",
    entityId: id,
    detail: `Padam program ${program.title}`,
  });
  return NextResponse.json({ ok: true });
}
