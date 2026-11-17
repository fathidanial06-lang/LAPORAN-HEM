"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BentoCard, SectionTitle } from "@/components/mtaf/bento";
import { Loading, EmptyState } from "@/components/mtaf/states";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";

type LogsResp = {
  logs: {
    id: string;
    userId: string | null;
    username: string | null;
    action: string;
    entity: string;
    entityId: string | null;
    detail: string;
    createdAt: string;
  }[];
};

export function AdminAuditView() {
  const { data, isLoading } = useQuery<LogsResp>({
    queryKey: ["admin-audit-logs"],
    queryFn: () => api("/api/admin/audit-logs"),
  });

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Log Audit"
        subtitle="Rekod aktiviti pentadbir sistem."
      />
      <BentoCard>
        {isLoading ? (
          <Loading />
        ) : !data || data.logs.length === 0 ? (
          <EmptyState title="Tiada log" />
        ) : (
          <div className="max-h-[70vh] overflow-y-auto custom-scroll">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3">Pengguna</th>
                  <th className="py-2 pr-3">Tindakan</th>
                  <th className="py-2 pr-3">Entiti</th>
                  <th className="py-2 pr-3">Butiran</th>
                  <th className="py-2">Masa</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((l) => (
                  <tr key={l.id} className="border-b border-border">
                    <td className="py-2 pr-3 font-medium">
                      {l.username ?? "-"}
                    </td>
                    <td className="py-2 pr-3">
                      <Badge variant="secondary">{l.action}</Badge>
                    </td>
                    <td className="py-2 pr-3 text-xs">{l.entity}</td>
                    <td className="py-2 pr-3 text-xs">{l.detail}</td>
                    <td className="py-2 text-xs text-muted-foreground">
                      {new Date(l.createdAt).toLocaleString("ms-MY")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BentoCard>
      <BentoCard className="bg-muted/30">
        <div className="flex items-start gap-3 text-xs text-muted-foreground">
          <ScrollText className="size-4 text-primary" />
          <p>
            Log audit merekod setiap tindakan pentadbir termasuk log masuk,
            penciptaan, kemaskini dan pemadaman rekod.
          </p>
        </div>
      </BentoCard>
    </div>
  );
}
