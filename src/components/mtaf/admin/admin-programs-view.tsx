"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiPost, apiPut, apiDelete } from "@/lib/api";
import { BentoCard, SectionTitle } from "@/components/mtaf/bento";
import { Loading, EmptyState } from "@/components/mtaf/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { FolderKanban, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PROGRAM_CATEGORIES, PROGRAM_CATEGORY_LABELS, formatBMDate } from "@/lib/format";

type ProgramsResp = {
  programs: {
    id: string;
    title: string;
    category: string;
    categoryLabel: string;
    date: string;
    location: string;
    coverImage: string | null;
    published: boolean;
    participantCount: number;
    createdAt: string;
  }[];
};

type StudentsResp = {
  students: { id: string; name: string; className: string; photoConsent: boolean }[];
};

export function AdminProgramsView() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<ProgramsResp>({
    queryKey: ["admin-programs"],
    queryFn: () => api("/api/admin/programs"),
  });
  const { data: studentsData } = useQuery<StudentsResp>({
    queryKey: ["admin-students"],
    queryFn: () => api("/api/admin/students"),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProgramsResp["programs"][number] | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "TAHFIZ",
    date: new Date().toISOString().slice(0, 10),
    location: "",
    description: "",
    objectives: "",
    outcome: "",
    coverImage: "",
    gallery: "",
    published: true,
    participantIds: [] as string[],
  });

  function openAdd() {
    setEditing(null);
    setForm({
      title: "",
      category: "TAHFIZ",
      date: new Date().toISOString().slice(0, 10),
      location: "",
      description: "",
      objectives: "",
      outcome: "",
      coverImage: "",
      gallery: "",
      published: true,
      participantIds: [],
    });
    setDialogOpen(true);
  }

  function openEdit(p: ProgramsResp["programs"][number]) {
    setEditing(p);
    setForm({
      title: p.title,
      category: p.category,
      date: p.date,
      location: p.location,
      description: "",
      objectives: "",
      outcome: "",
      coverImage: p.coverImage ?? "",
      gallery: "",
      published: p.published,
      participantIds: [],
    });
    setDialogOpen(true);
  }

  async function onSave() {
    if (!form.title || !form.category || !form.date) {
      toast.error("Tajuk, kategori dan tarikh diperlukan");
      return;
    }
    try {
      const gallery = form.gallery
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        ...form,
        coverImage: form.coverImage || undefined,
        gallery,
      };
      if (editing) {
        await apiPut(`/api/admin/programs/${editing.id}`, payload);
        toast.success("Program dikemaskini");
      } else {
        await apiPost("/api/admin/programs", payload);
        toast.success("Program dicipta");
      }
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-programs"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function onDelete(p: ProgramsResp["programs"][number]) {
    if (!confirm(`Padam program "${p.title}"?`)) return;
    try {
      await apiDelete(`/api/admin/programs/${p.id}`);
      toast.success("Program dipadam");
      qc.invalidateQueries({ queryKey: ["admin-programs"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Pengurusan Program"
        subtitle="Cipta dan urus program madrasah."
        action={
          <Button onClick={openAdd} className="h-10">
            <Plus className="size-4" />
            Program Baru
          </Button>
        }
      />

      <BentoCard>
        {isLoading ? (
          <Loading />
        ) : !data || data.programs.length === 0 ? (
          <EmptyState title="Tiada program" />
        ) : (
          <div className="max-h-[70vh] overflow-y-auto custom-scroll">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3">Tajuk</th>
                  <th className="py-2 pr-3">Kategori</th>
                  <th className="py-2 pr-3">Tarikh</th>
                  <th className="py-2 pr-3">Peserta</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {data.programs.map((p) => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="py-2 pr-3 font-medium">{p.title}</td>
                    <td className="py-2 pr-3">
                      <Badge variant="secondary">{p.categoryLabel}</Badge>
                    </td>
                    <td className="py-2 pr-3 text-xs">{formatBMDate(p.date)}</td>
                    <td className="py-2 pr-3">{p.participantCount}</td>
                    <td className="py-2 pr-3">
                      {p.published ? (
                        <Badge className="bg-status-green border-status-green text-white">
                          Diterbitkan
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Draf</Badge>
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive"
                          onClick={() => onDelete(p)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BentoCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Kemaskini Program" : "Program Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Tajuk *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAM_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {PROGRAM_CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tarikh</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Lokasi</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Penerangan</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Objektif</Label>
              <Textarea
                value={form.objectives}
                onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hasil</Label>
              <Textarea
                value={form.outcome}
                onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>URL Gambar Kulit</Label>
              <Input
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="/images/programs/..."
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>URL Galeri (satu per baris)</Label>
              <Textarea
                value={form.gallery}
                onChange={(e) => setForm({ ...form, gallery: e.target.value })}
                rows={3}
                placeholder="/images/programs/p001-1.svg&#10;/images/programs/p001-2.svg"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Switch
                checked={form.published}
                onCheckedChange={(v) => setForm({ ...form, published: v })}
              />
              <Label>Diterbitkan</Label>
            </div>
            {!editing && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Peserta (opsyenal - keizinan foto diperlukan)</Label>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-border p-2 space-y-1 text-sm custom-scroll">
                  {studentsData?.students.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center gap-2 rounded px-2 py-1 hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={form.participantIds.includes(s.id)}
                        onChange={(e) => {
                          setForm((prev) => ({
                            ...prev,
                            participantIds: e.target.checked
                              ? [...prev.participantIds, s.id]
                              : prev.participantIds.filter((id) => id !== s.id),
                          }));
                        }}
                      />
                      <span>{s.name}</span>
                      {!s.photoConsent && (
                        <Badge variant="destructive" className="text-xs">
                          Tiada keizinan foto
                        </Badge>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={onSave}>
              <FolderKanban className="size-4" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
