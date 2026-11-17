// Audit log helper
import { db } from "@/lib/db";

export async function auditLog(opts: {
  userId?: string | null;
  username?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  detail: string;
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: opts.userId ?? null,
        username: opts.username ?? null,
        action: opts.action,
        entity: opts.entity,
        entityId: opts.entityId ?? null,
        detail: opts.detail,
      },
    });
  } catch {
    // silent - do not fail main operation
  }
}
