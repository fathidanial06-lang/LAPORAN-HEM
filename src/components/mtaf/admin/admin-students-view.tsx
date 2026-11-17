"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiPost, apiPut, apiDelete } from "@/lib/api";
import { BentoCard, SectionTitle } from "@/components/mtaf/bento";
import { Loading, EmptyState } from "@/components/mtaf/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { formatIc } from "@/lib/format";

type ClassesResp = {
  classes: { id: string; name: string; year: number }[];
};
type StudentsResp = {
  students: {
    id: string;
    name: string;
    ic: string;
    classId: string;
    className: string;
    gender: string;
    year: number;
    guardianName: string;
    guardianPhone: string;
    photoConsent: boolean;
    active: boolean;
  }[];
};

export function AdminStudentsView() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StudentsResp["students"][number] | null>(null);
  const [form, setForm] = useState({
    id: "",
    name: "",
    ic: "",
    classId: "",
    gender: "L",
    year: 1,
    guardianName: "",
    guardianPhone: "",
    photoConsent: false,
  });

  const { data: classesData } = useQuery<ClassesResp>({
    queryKey: ["classes"],
    queryFn: () => api("/api/classes"),
  });
  const { data, isLoading } = useQuery<StudentsResp>({
    queryKey: ["admin-students"],
    queryFn: () => api("/api/admin/students"),
  });

  const students = (data?.students ?? []).filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.ic.includes(search);
    const matchClass = classFilter === "ALL" || s.classId === classFilter;
    return matchSearch && matchClass;
  });

  function openAdd() {
    setEditing(null);
    setForm({
      id: "",
      name: "",
      ic: "",
      classId: classesData?.classes[0]?.id ?? "",
      gender: "L",
      year: 1,
      guardianName: "",
      guardianPhone: "",
      photoConsent: false,
    });
    setDialogOpen(true);
  }

  function openEdit(s: StudentsResp["students"][number]) {
    setEditing(s);
    setForm({
      id: s.id,
      name: s.name,
      ic: s.ic,
      classId: s.classId,
      gender: s.gender,
      year: s.year,
      guardianName: s.guardianName,
      guardianPhone: s.guardianPhone,
      photoConsent: s.photoConsent,
    });
    setDialogOpen(true);
  }

  async function onSave() {
    if (!form.name || !form.ic || !form.classId || !form.guardianName) {
      toast.error("Sila lengkapkan medan wajib");
      return;
    }
    try {
      if (editing) {
        await apiPut(`/api/admin/students/${editing.id}`, form);
        toast.success("Pelajar dikemaskini");
      } else {
        if (!form.id) {
          toast.error("ID pelajar diperlukan");
          return;
        }
        await apiPost("/api/admin/students", form);
        toast.success("Pelajar ditambah");
      }
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-students"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function onDeactivate(s: StudentsResp["students"][number]) {
    if (!confirm(`Nyahaktif pelajar ${s.name}?`)) return;
    try {
      await apiDelete(`/api/admin/students/${s.id}`);
      toast.success("Pelajar disahkan telah dinyahaktifkan");
      qc.invalidateQueries({ queryKey: ["admin-students"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Pengurusan Pelajar"
        subtitle="Tambah, kemaskini atau nyahaktifkan pelajar."
        action={
          <Button onClick={openAdd} className="h-10">
            <Plus className="size-4" />
            Tambah Pelajar
          </Button>
        }
      />

      <BentoCard>
        <div className="mb-3 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama / ID / IC..."
              className="h-10 pl-9"
            />
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kelas</SelectItem>
              {classesData?.classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <Loading />
        ) : students.length === 0 ? (
          <EmptyState title="Tiada pelajar dijumpai" />
        ) : (
          <div className="max-h-[70vh] overflow-y-auto custom-scroll">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Nama</th>
                  <th className="py-2 pr-3">IC</th>
                  <th className="py-2 pr-3">Kelas</th>
                  <th className="py-2 pr-3">Jantina</th>
                  <th className="py-2 pr-3">Penjaga</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-border">
                    <td className="py-2 pr-3 font-mono text-xs">{s.id}</td>
                    <td className="py-2 pr-3 font-medium">{s.name}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{formatIc(s.ic)}</td>
                    <td className="py-2 pr-3">{s.className}</td>
                    <td className="py-2 pr-3">{s.gender === "L" ? "L" : "P"}</td>
                    <td className="py-2 pr-3 text-xs">{s.guardianName}</td>
                    <td className="py-2 pr-3">
                      {s.active ? (
                        <Badge className="bg-status-green border-status-green text-white">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Tidak Aktif</Badge>
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openEdit(s)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        {s.active && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive"
                            onClick={() => onDeactivate(s)}
                          >
                            <Ban className="size-4" />
                          </Button>
                        )}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Kemaskini Pelajar" : "Tambah Pelajar Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>ID Pelajar</Label>
              <Input
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                disabled={!!editing}
                placeholder="cth: S0031"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nama Penuh *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>No. IC (12 digit) *</Label>
              <Input
                value={form.ic}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ic: e.target.value.replace(/\D/g, "").slice(0, 12),
                  })
                }
                maxLength={12}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kelas *</Label>
              <Select
                value={form.classId}
                onValueChange={(v) => setForm({ ...form, classId: v })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classesData?.classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Jantina</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setForm({ ...form, gender: v })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Lelaki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tingkatan</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) =>
                  setForm({ ...form, year: parseInt(e.target.value, 10) || 1 })
                }
                min={1}
                max={6}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Nama Penjaga *</Label>
              <Input
                value={form.guardianName}
                onChange={(e) =>
                  setForm({ ...form, guardianName: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Telefon Penjaga</Label>
              <Input
                value={form.guardianPhone}
                onChange={(e) =>
                  setForm({ ...form, guardianPhone: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Keizinan Foto</Label>
              <Select
                value={form.photoConsent ? "yes" : "no"}
                onValueChange={(v) =>
                  setForm({ ...form, photoConsent: v === "yes" })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Ya</SelectItem>
                  <SelectItem value="no">Tidak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={onSave}>
              <Users className="size-4" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
