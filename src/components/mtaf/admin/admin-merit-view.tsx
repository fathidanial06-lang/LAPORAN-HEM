"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiPost } from "@/lib/api";
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
import { Award, Save, Ban } from "lucide-react";
import { toast } from "sonner";
import { BERAT_ROLES } from "@/lib/roles";
import { formatBMDate } from "@/lib/format";

type StudentsResp = {
  students: { id: string; name: string; className: string }[];
};
type CatsResp = {
  categories: {
    id: string;
    code: string;
    name: string;
    type: string;
    severity: string | null;
    group: string | null;
    points: number;
  }[];
};
type MeritListResp = {
  records: {
    id: string;
    studentId: string;
    studentName: string;
    className: string;
    categoryName: string;
    categoryType: string;
    date: string;
    points: number;
    severity: string | null;
    severityReason: string | null;
    note: string | null;
    recordedByName: string | null;
    voided: boolean;
    voidReason: string | null;
  }[];
};

export function AdminMeritView() {
  const qc = useQueryClient();
  const { adminUser } = useStore();
  const { data: studentsData } = useQuery<StudentsResp>({
    queryKey: ["admin-students"],
    queryFn: () => api("/api/admin/students"),
  });
  const { data: catsData } = useQuery<CatsResp>({
    queryKey: ["merit-categories"],
    queryFn: () => api("/api/merit-categories"),
  });
  const { data: listData, isLoading } = useQuery<MeritListResp>({
    queryKey: ["admin-merit"],
    queryFn: () => api("/api/admin/merit"),
  });

  const [studentId, setStudentId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [points, setPoints] = useState<number | "">("");
  const [severity, setSeverity] = useState("");
  const [severityReason, setSeverityReason] = useState("");
  const [note, setNote] = useState("");
  const [voidDialog, setVoidDialog] = useState<{ id: string; name: string } | null>(null);
  const [voidReason, setVoidReason] = useState("");

  const selectedCat = catsData?.categories.find((c) => c.id === categoryId);
  const isDemerit = selectedCat?.type === "DEMERIT";
  const severityOptions = ["RINGAN", "SEDERHANA", "BERAT"];
  const canRecordBerat =
    adminUser && BERAT_ROLES.includes(adminUser.role);

  async function onSave() {
    if (!studentId || !categoryId || !date) {
      toast.error("Sila pilih pelajar, kategori dan tarikh");
      return;
    }
    if (isDemerit && severity && severity !== selectedCat?.severity && !severityReason) {
      toast.error("Sebab perubahan tahap diperlukan");
      return;
    }
    if (severity === "BERAT" && !canRecordBerat) {
      toast.error("Kes Berat hanya boleh direkod oleh Guru Kanan HEM / Pengetua / Superadmin");
      return;
    }
    try {
      await apiPost("/api/admin/merit", {
        studentId,
        categoryId,
        date,
        points: points === "" ? undefined : points,
        severity: severity || undefined,
        severityReason: severityReason || undefined,
        note: note || undefined,
      });
      toast.success("Rekod merit disimpan");
      setStudentId("");
      setCategoryId("");
      setSeverity("");
      setSeverityReason("");
      setNote("");
      setPoints("");
      qc.invalidateQueries({ queryKey: ["admin-merit"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function onVoid() {
    if (!voidDialog) return;
    if (!voidReason) {
      toast.error("Sebab pembatalan diperlukan");
      return;
    }
    try {
      await apiPost(`/api/admin/merit/${voidDialog.id}/void`, {
        reason: voidReason,
      });
      toast.success("Rekod dibatalkan");
      setVoidDialog(null);
      setVoidReason("");
      qc.invalidateQueries({ queryKey: ["admin-merit"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Rekod Merit / Demerit"
        subtitle="Tambah rekod merit atau demerit pelajar."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Form */}
        <BentoCard>
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <Award className="size-4 text-primary" />
            Borang Rekod Baru
          </h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Pelajar</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pilih pelajar" />
                </SelectTrigger>
                <SelectContent>
                  {studentsData?.students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.className})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {catsData?.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      [{c.type}] {c.code} - {c.name} ({c.points > 0 ? `+${c.points}` : c.points})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tarikh</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10"
              />
            </div>
            {selectedCat && (
              <div className="rounded-lg bg-muted/40 p-3 text-xs">
                <p>
                  <span className="text-muted-foreground">Jenis: </span>
                  <Badge variant={selectedCat.type === "MERIT" ? "default" : "destructive"}>
                    {selectedCat.type}
                  </Badge>
                </p>
                <p className="mt-1">
                  <span className="text-muted-foreground">Mata lalai: </span>
                  <span className="font-medium">
                    {selectedCat.points > 0 ? `+${selectedCat.points}` : selectedCat.points}
                  </span>
                </p>
                {isDemerit && (
                  <p className="mt-1">
                    <span className="text-muted-foreground">Tahap lalai: </span>
                    <span className="font-medium">{selectedCat.severity ?? "-"}</span>
                  </p>
                )}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Mata (opsyenal, lalai dari kategori)</Label>
              <Input
                type="number"
                value={points}
                onChange={(e) =>
                  setPoints(
                    e.target.value === "" ? "" : parseInt(e.target.value, 10),
                  )
                }
                placeholder={selectedCat ? String(selectedCat.points) : ""}
                className="h-10"
              />
            </div>
            {isDemerit && (
              <>
                <div className="space-y-1.5">
                  <Label>Tahap (opsyenal, lalai dari kategori)</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Guna tahap lalai" />
                    </SelectTrigger>
                    <SelectContent>
                      {severityOptions.map((s) => (
                        <SelectItem
                          key={s}
                          value={s}
                          disabled={s === "BERAT" && !canRecordBerat}
                        >
                          {s}
                          {s === "BERAT" && !canRecordBerat && " (Tidak dibenarkan)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {severity && severity !== selectedCat?.severity && (
                  <div className="space-y-1.5">
                    <Label className="text-status-red">Sebab Perubahan Tahap (Wajib)</Label>
                    <Textarea
                      value={severityReason}
                      onChange={(e) => setSeverityReason(e.target.value)}
                      rows={2}
                      placeholder="Nyatakan sebab perubahan tahap..."
                    />
                  </div>
                )}
              </>
            )}
            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Catatan tentang rekod ini..."
              />
            </div>
            <Button onClick={onSave} className="w-full h-11">
              <Save className="size-4" />
              Simpan Rekod
            </Button>
          </div>
        </BentoCard>

        {/* List */}
        <BentoCard>
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <Award className="size-4 text-primary" />
            Rekod Terkini
          </h3>
          {isLoading ? (
            <Loading />
          ) : !listData || listData.records.length === 0 ? (
            <EmptyState title="Tiada rekod" />
          ) : (
            <div className="max-h-[70vh] overflow-y-auto custom-scroll">
              <ul className="space-y-2">
                {listData.records.map((r) => (
                  <li
                    key={r.id}
                    className={`rounded-lg border p-3 ${
                      r.voided
                        ? "border-border bg-muted/30 opacity-60"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{r.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.className} - {formatBMDate(r.date)}
                        </p>
                      </div>
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: r.points >= 0 ? "#16A34A15" : "#DC262615",
                          color: r.points >= 0 ? "#16A34A" : "#DC2626",
                        }}
                      >
                        {r.points > 0 ? `+${r.points}` : r.points}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary">{r.categoryName}</Badge>
                      {r.severity && (
                        <Badge variant="outline">{r.severity}</Badge>
                      )}
                      {r.voided && (
                        <Badge variant="destructive">Dibatalkan</Badge>
                      )}
                    </div>
                    {r.note && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {r.note}
                      </p>
                    )}
                    {r.voided && r.voidReason && (
                      <p className="mt-1 text-xs italic text-status-red">
                        Sebab batal: {r.voidReason}
                      </p>
                    )}
                    {!r.voided && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 text-destructive"
                        onClick={() =>
                          setVoidDialog({ id: r.id, name: r.studentName })
                        }
                      >
                        <Ban className="size-3.5" />
                        Batal Rekod
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </BentoCard>
      </div>

      <Dialog open={!!voidDialog} onOpenChange={(o) => !o && setVoidDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan Rekod Merit</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Anda akan membatalkan rekod untuk{" "}
            <span className="font-medium text-foreground">
              {voidDialog?.name}
            </span>
            . Tindakan ini akan direkod dalam log audit.
          </p>
          <div className="space-y-1.5">
            <Label>Sebab Pembatalan</Label>
            <Textarea
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              rows={3}
              placeholder="Nyatakan sebab pembatalan..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoidDialog(null)}>
              Tutup
            </Button>
            <Button variant="destructive" onClick={onVoid}>
              <Ban className="size-4" />
              Sahkan Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
