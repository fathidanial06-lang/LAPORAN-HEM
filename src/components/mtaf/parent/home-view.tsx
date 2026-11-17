"use client";

import { useState } from "react";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BentoCard, StatCard } from "@/components/mtaf/bento";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  FolderKanban,
  FileText,
  Shield,
  Users,
  CalendarCheck,
  Award,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { formatIcInput } from "@/lib/format";
import { toast } from "sonner";

type SearchResult =
  | { mode: "ic"; found: true; student: { id: string; name: string; ic: string } }
  | { mode: "ic"; found: false }
  | {
      mode: "name";
      found: boolean;
      list: {
        id: string;
        name: string;
        className: string;
        icMasked: string;
      }[];
    }
  | { mode: "empty"; ic: null; list: never[] };

type SchoolInfo = {
  name: string;
  nameArabic: string | null;
  vision: string;
  mission: string;
};

export function HomeView() {
  const { goStudent, setView, setParentSession } = useStore();
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedList, setSelectedList] = useState<
    { id: string; name: string; className: string; icMasked: string }[] | null
  >(null);

  const { data: school } = useQuery<SchoolInfo>({
    queryKey: ["school"],
    queryFn: () => api("/api/school"),
  });

  const { data: stats } = useQuery<{
    totalStudents: number;
    programsCount: number;
  }>({
    queryKey: ["home-stats"],
    queryFn: async () => {
      try {
        const d = await api<{
          totalStudents: number;
          programsCount: number;
        }>("/api/admin/dashboard");
        return { totalStudents: d.totalStudents, programsCount: d.programsCount };
      } catch {
        const p = await api<{ programs: unknown[] }>("/api/programs");
        return { totalStudents: 30, programsCount: p.programs.length };
      }
    },
  });

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error("Sila masukkan No. IC atau nama pelajar");
      return;
    }
    setSubmitting(true);
    setSelectedList(null);
    try {
      const result = await api<SearchResult>(
        `/api/students/search?query=${encodeURIComponent(trimmed)}`,
      );
      if (result.mode === "ic") {
        if (result.found) {
          setParentSession(result.student.id);
          goStudent(result.student.id);
          toast.success(`Selamat datang, ${result.student.name}`);
        } else {
          toast.error(
            "Maklumat tidak dijumpai. Sila semak semula atau hubungi UNIT HEM.",
          );
        }
      } else if (result.mode === "name") {
        if (result.found && result.list.length > 0) {
          setSelectedList(result.list);
        } else {
          toast.error(
            "Maklumat tidak dijumpai. Sila semak semula atau hubungi UNIT HEM.",
          );
        }
      }
    } catch {
      toast.error("Ralat semasa mencari. Sila cuba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Hero search card */}
        <BentoCard className="sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-[#0E7C8F] to-[#00B4CC] text-white border-none">
          <div className="flex h-full flex-col">
            <div className="flex flex-col items-center text-center">
              <Image
                src="/logo-mtaf.svg"
                alt="Logo Madrasah Tahfiz Al Furqan"
                width={96}
                height={96}
                className="mb-3"
                priority
              />
              <h1 className="text-xl font-extrabold sm:text-2xl">
                {school?.name ?? "Madrasah Tahfiz Al Furqan"}
              </h1>
              {school?.nameArabic && (
                <p className="mt-1 text-base opacity-90" dir="rtl">
                  {school.nameArabic}
                </p>
              )}
              <p className="mt-2 text-sm opacity-90">
                Sistem Laporan Disiplin Pelajar
              </p>
            </div>

            <form onSubmit={onSearch} className="mt-5 w-full">
              <label
                htmlFor="search-input"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide opacity-90"
              >
                Cari No. IC atau Nama Pelajar
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="search-input"
                  value={query}
                  onChange={(e) => setQuery(formatIcInput(e.target.value))}
                  placeholder="Contoh: 130412-10-1234 atau nama pelajar"
                  className="h-12 bg-white text-foreground"
                  inputMode="numeric"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="h-12 bg-brand-yellow text-brand-dark hover:bg-brand-yellow/90"
                >
                  <Search className="size-4" />
                  Cari
                </Button>
              </div>
              <p className="mt-2 text-xs opacity-90">
                Format IC: xxxxxx-xx-xxxx (12 digit). Carian nama memerlukan
                pengesahan 4 digit terakhir IC.
              </p>
            </form>

            {selectedList && (
              <div className="mt-4 max-h-56 overflow-y-auto rounded-xl bg-white/10 p-3 custom-scroll">
                <p className="mb-2 text-xs font-medium opacity-90">
                  Pilih pelajar untuk pengesahan:
                </p>
                <ul className="space-y-1.5">
                  {selectedList.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => {
                          sessionStorage.setItem(
                            "mtafPendingStudent",
                            JSON.stringify(s),
                          );
                          setView("select-student");
                        }}
                        className="flex w-full items-center justify-between gap-2 rounded-lg bg-white/15 px-3 py-2 text-left text-sm transition hover:bg-white/25"
                      >
                        <span className="flex flex-col">
                          <span className="font-medium">{s.name}</span>
                          <span className="text-xs opacity-90">
                            {s.className} - IC: {s.icMasked}
                          </span>
                        </span>
                        <ArrowRight className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </BentoCard>

        <BentoCard onClick={() => setView("programs")} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#00B4CC]/15 text-[#00B4CC]">
              <FolderKanban className="size-5" />
            </span>
            <h3 className="font-bold">Program Terkini</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Lihat program dan aktiviti madrasah serta penyertaan anak anda.
          </p>
        </BentoCard>

        <BentoCard onClick={() => setView("duty-reports")} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#F59E0B]/15 text-status-yellow">
              <FileText className="size-5" />
            </span>
            <h3 className="font-bold">Guru Bertugas</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Laporan mingguan guru bertugas untuk pemantauan ibu bapa.
          </p>
        </BentoCard>

        <BentoCard onClick={() => setView("visi-misi")} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#0E7C8F]/15 text-primary">
              <Shield className="size-5" />
            </span>
            <h3 className="font-bold">Visi & Misi</h3>
          </div>
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {school?.vision ?? "Memuatkan..."}
          </p>
        </BentoCard>

        <StatCard
          label="Jumlah Pelajar"
          value={stats?.totalStudents ?? "-"}
          sublabel="Pelajar aktif"
          color="#0E7C8F"
          icon={<Users className="size-4" />}
        />

        <StatCard
          label="Program Aktif"
          value={stats?.programsCount ?? "-"}
          sublabel="Program diterbitkan"
          color="#00B4CC"
          icon={<FolderKanban className="size-4" />}
        />

        <StatCard
          label="Kedatangan"
          value="Harian"
          sublabel="Direkod oleh guru kelas"
          color="#16A34A"
          icon={<CalendarCheck className="size-4" />}
        />

        <StatCard
          label="Sistem Merit"
          value="Aktif"
          sublabel="Pemantauan disiplin"
          color="#F59E0B"
          icon={<Award className="size-4" />}
        />
      </div>

      <BentoCard className="bg-muted/40 border-dashed">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Demo Carian Pelajar</p>
            <p className="mt-1 text-muted-foreground">
              Cuba IC{" "}
              <code className="rounded bg-card px-1.5 py-0.5 font-mono">130412101234</code>{" "}
              (Muhammad Aiman bin Ahmad), atau cari nama{" "}
              <code className="rounded bg-card px-1.5 py-0.5 font-mono">aiman</code>{" "}
              kemudian sahkan dengan 4 digit terakhir{" "}
              <code className="rounded bg-card px-1.5 py-0.5 font-mono">1234</code>.
            </p>
          </div>
        </div>
      </BentoCard>
    </div>
  );
}
