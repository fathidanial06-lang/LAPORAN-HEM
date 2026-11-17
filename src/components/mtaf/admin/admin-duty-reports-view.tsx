"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiPost, apiPut } from "@/lib/api";
import { useStore } from "@/lib/store";
import { BentoCard, SectionTitle } from "@/components/mtaf/bento";
import { Loading, EmptyState } from "@/components/mtaf/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileText, Plus, Send, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  APPROVAL_ROLES,
} from "@/lib/roles";
import {
  DUTY_STATUS_LABELS,
  formatBMDate,
} from "@/lib/format";
import { DutyStatusBadge } from "@/components/mtaf/badges";

type TeachersResp = {
  teachers: { id: string; name: string; role: string }[];
};
type DutyListResp = {
  reports: {
    id: string;
    weekNo: number;
    startDate: string;
    endDate: string;
    teacherName: string;
    teacherId: string | null;
    status: string;
    statusLabel: string;
    attendanceSummary: string;
    disciplineSummary: string;
    reviewNote: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
};

export function AdminDutyReportsView() {
  const qc = useQueryClient();
  const { adminUser } = useStore();
  const { data: teachersData } = useQuery<TeachersResp>({
    queryKey: ["teachers"],
    queryFn: () => api("/api/teachers"),
  });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { data: listData, isLoading } = useQuery<DutyListResp>({
    queryKey: ["admin-duty-reports", statusFilter],
    queryFn: () =>
      api(`/api/admin/duty-reports?status=${encodeURIComponent(statusFilter)}`),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewDialog, setReviewDialog] = useState<{
    id: string;
    weekNo: number;
    action: "DILULUSKAN" | "DIKEMBALIKAN" | "DITERBITKAN";
  } | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [form, setForm] = useState({
    weekNo: 1,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    teacherId: "",
    attendanceSummary: "",
    disciplineSummary: "",
    cleanliness: "",
    safety: "",
    positives: "",
    improvements: "",
    noticeToParents: "",
  });

  const canApprove =
    adminUser && APPROVAL_ROLES.includes(adminUser.role);

  async function onCreate() {
    if (!form.weekNo || !form.startDate || !form.endDate) {
      toast.error("Minggu dan tarikh diperlukan");
      return;
    }
    try {
      await apiPost("/api/admin/duty-reports", {
        ...form,
        positives: form.positives.split("\n").filter(Boolean),
        improvements: form.improvements.split("\n").filter(Boolean),
        status: "DRAF",
      });
      toast.success("Laporan draf dicipta");
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-duty-reports"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function onSubmit(id: string) {
    try {
      await apiPut(`/api/admin/duty-reports/${id}`, { status: "MENUNGGU" });
      toast.success("Laporan dihantar untuk kelulusan");
      qc.invalidateQueries({ queryKey: ["admin-duty-reports"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function onReview() {
    if (!reviewDialog) return;
    try {
      await apiPut(`/api/admin/duty-reports/${reviewDialog.id}`, {
        status: reviewDialog.action,
        reviewNote: reviewNote || undefined,
      });
      toast.success(`Laporan ${DUTY_STATUS_LABELS[reviewDialog.action]}`);
      setReviewDialog(null);
      setReviewNote("");
      qc.invalidateQueries({ queryKey: ["admin-duty-reports"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Laporan Bertugas"
        subtitle="Cipta dan urus laporan mingguan guru bertugas."
        action={
          <Button onClick={() => setDialogOpen(true)} className="h-10">
            <Plus className="size-4" />
            Laporan Baru
          </Button>
        }
      />

      <BentoCard>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-medium">Tapis Status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              {Object.entries(DUTY_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <Loading />
        ) : !listData || listData.reports.length === 0 ? (
          <EmptyState title="Tiada laporan" />
        ) : (
          <div className="max-h-[70vh] overflow-y-auto custom-scroll space-y-2">
            {listData.reports.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-border p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">Minggu {r.weekNo}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBMDate(r.startDate)} - {formatBMDate(r.endDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Guru: {r.teacherName}
                    </p>
                  </div>
                  <DutyStatusBadge status={r.status} />
                </div>
                {r.attendanceSummary && (
                  <p className="mt-1 text-xs line-clamp-2 text-muted-foreground">
                    Kedatangan: {r.attendanceSummary}
                  </p>
                )}
                {r.reviewNote && (
                  <p className="mt-1 text-xs text-status-orange">
                    Catatan pengulas: {r.reviewNote}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.status === "DRAF" && (
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => onSubmit(r.id)}
                    >
                      <Send className="size-3.5" />
                      Hantar untuk Kelulusan
                    </Button>
                  )}
                  {r.status === "MENUNGGU" && canApprove && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8"
                        onClick={() =>
                          setReviewDialog({
                            id: r.id,
                            weekNo: r.weekNo,
                            action: "DILULUSKAN",
                          })
                        }
                      >
                        <Check className="size-3.5" />
                        Lulus
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() =>
                          setReviewDialog({
                            id: r.id,
                            weekNo: r.weekNo,
                            action: "DIKEMBALIKAN",
                          })
                        }
                      >
                        <X className="size-3.5" />
                        Kembalikan
                      </Button>
                    </>
                  )}
                  {r.status === "DILULUSKAN" && canApprove && (
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() =>
                        setReviewDialog({
                          id: r.id,
                          weekNo: r.weekNo,
                          action: "DITERBITKAN",
                        })
                      }
                    >
                      <FileText className="size-3.5" />
                      Terbitkan
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </BentoCard>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Laporan Bertugas Baru</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Minggu</Label>
              <Input
                type="number"
                value={form.weekNo}
                onChange={(e) =>
                  setForm({ ...form, weekNo: parseInt(e.target.value, 10) || 1 })
                }
                min={1}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Guru Bertugas</Label>
              <Select
                value={form.teacherId}
                onValueChange={(v) => setForm({ ...form, teacherId: v })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pilih guru" />
                </SelectTrigger>
                <SelectContent>
                  {teachersData?.teachers
                    .filter((t) => t.role === "guruBertugas" || t.role === "guruKelas")
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tarikh Mula</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tarikh Tamat</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Ringkasan Kedatangan</Label>
              <Textarea
                value={form.attendanceSummary}
                onChange={(e) =>
                  setForm({ ...form, attendanceSummary: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Ringkasan Disiplin</Label>
              <Textarea
                value={form.disciplineSummary}
                onChange={(e) =>
                  setForm({ ...form, disciplineSummary: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kebersihan</Label>
              <Textarea
                value={form.cleanliness}
                onChange={(e) =>
                  setForm({ ...form, cleanliness: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Keselamatan</Label>
              <Textarea
                value={form.safety}
                onChange={(e) => setForm({ ...form, safety: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Perkara Positif (satu per baris)</Label>
              <Textarea
                value={form.positives}
                onChange={(e) =>
                  setForm({ ...form, positives: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Perlu Penambahbaikan (satu per baris)</Label>
              <Textarea
                value={form.improvements}
                onChange={(e) =>
                  setForm({ ...form, improvements: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notis Kepada Ibu Bapa</Label>
              <Textarea
                value={form.noticeToParents}
                onChange={(e) =>
                  setForm({ ...form, noticeToParents: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={onCreate}>Simpan sebagai Draf</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review dialog */}
      <Dialog
        open={!!reviewDialog}
        onOpenChange={(o) => !o && setReviewDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog?.action === "DILULUSKAN"
                ? "Luluskan Laporan"
                : reviewDialog?.action === "DITERBITKAN"
                  ? "Terbitkan Laporan"
                  : "Kembalikan Laporan"}{" "}
              - Minggu {reviewDialog?.weekNo}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Catatan Pengulas (opsyenal)</Label>
            <Textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>
              Batal
            </Button>
            <Button
              variant={
                reviewDialog?.action === "DIKEMBALIKAN"
                  ? "outline"
                  : "default"
              }
              onClick={onReview}
            >
              Sahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BentoCard className="bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Aliran: Draf -&gt; Menunggu (guru hantar) -&gt; Diluluskan/Dikembalikan
          (oleh Guru Kanan HEM / Pengetua) -&gt; Diterbitkan (umum).
        </p>
      </BentoCard>
    </div>
  );
}
