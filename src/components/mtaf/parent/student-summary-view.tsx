"use client";

import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import {
  BentoCard,
  StatCard,
} from "@/components/mtaf/bento";
import {
  MeritLevelBadge,
  GradeBadge,
} from "@/components/mtaf/badges";
import { Loading, ErrorState } from "@/components/mtaf/states";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AttendanceTab } from "./tabs/attendance-tab";
import { CharacterTab } from "./tabs/character-tab";
import { MeritTab } from "./tabs/merit-tab";
import { DutyTab } from "./tabs/duty-tab";
import { ProgramTab } from "./tabs/program-tab";
import {
  ArrowLeft,
  Printer,
  CalendarCheck,
  ClipboardList,
  Award,
  FileText,
  FolderKanban,
} from "lucide-react";
import { toast } from "sonner";
import {
  bmMonthLabel,
  MERIT_LEVEL_LABELS,
} from "@/lib/format";

type Summary = {
  profile: {
    id: string;
    name: string;
    icMasked: string;
    gender: string;
    classId: string;
    className: string;
    year: number;
    guardianName: string;
    guardianPhone: string;
  };
  attendanceStats: {
    months: string[];
    byMonth: Record<
      string,
      {
        total: number;
        hadir: number;
        lewat: number;
        thBersebab: number;
        thTanpa: number;
        cuti: number;
        effective: number;
        present: number;
        percentage: number;
      }
    >;
    currentMonth: string;
    current: {
      total: number;
      hadir: number;
      lewat: number;
      percentage: number;
    };
  };
  character: {
    id: string;
    period: string;
    periodLabel: string;
    akhlak: number;
    ibadah: number;
    tanggungjawab: number;
    kebersihan: number;
    kerjasama: number;
    average: number;
    grade: string;
    comment: string;
    teacherName: string | null;
    previousAverage: number | null;
  } | null;
  merit: {
    merit: number;
    demerit: number;
    cleanPoints: number;
    level: string;
    hasBerat: boolean;
    recent: {
      id: string;
      date: string;
      points: number;
      type: string;
      categoryName: string;
      isBerat: boolean;
      note: string | null;
    }[];
  };
  programs: {
    id: string;
    title: string;
    category: string;
    date: string;
    location: string;
    coverImage: string | null;
  }[];
};

export function StudentSummaryView() {
  const { selectedStudentId, setView } = useStore();

  const { data, isLoading, error } = useQuery<Summary>({
    queryKey: ["student-summary", selectedStudentId],
    queryFn: () => api(`/api/students/${selectedStudentId}/summary`),
    enabled: !!selectedStudentId,
  });

  if (isLoading) return <Loading label="Memuatkan laporan pelajar..." />;
  if (error)
    return (
      <ErrorState message="Gagal memuatkan maklumat pelajar. Sila cuba lagi." />
    );
  if (!data) return null;

  const current = data.attendanceStats.current;
  const sentence = `Anak anda hadir ${current.hadir + (data.attendanceStats.byMonth[data.attendanceStats.currentMonth]?.lewat ?? 0)} daripada ${data.attendanceStats.byMonth[data.attendanceStats.currentMonth]?.effective ?? 0} hari pada ${bmMonthLabel(data.attendanceStats.currentMonth)}.`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => setView("home")} className="h-10">
          <ArrowLeft className="size-4" />
          Kembali
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            toast.success("Mencetak laporan...");
            setTimeout(() => window.print(), 300);
          }}
          className="h-10 no-print"
        >
          <Printer className="size-4" />
          Cetak
        </Button>
      </div>

      {/* Profile + stats bento */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Profile card spans 2 cols */}
        <BentoCard className="sm:col-span-2 lg:col-span-2">
          <div className="flex items-start gap-4">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl font-bold">
              {data.profile.name.charAt(0)}
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-brand-dark">
                {data.profile.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Tingkatan {data.profile.year} - {data.profile.className}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  IC: {data.profile.icMasked}
                </Badge>
                <Badge variant="secondary">
                  Jantina: {data.profile.gender === "L" ? "Lelaki" : "Perempuan"}
                </Badge>
              </div>
              <div className="mt-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Ibu Bapa / Penjaga: </span>
                  <span className="font-medium">{data.profile.guardianName}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Telefon: </span>
                  <span className="font-medium">{data.profile.guardianPhone || "-"}</span>
                </p>
              </div>
            </div>
          </div>
        </BentoCard>

        <StatCard
          label="Kedatangan Bulan Ini"
          value={`${data.attendanceStats.current.percentage}%`}
          sublabel={`${current.hadir}/${current.total} hari`}
          color="#16A34A"
          icon={<CalendarCheck className="size-4" />}
        />

        <StatCard
          label="Tahap Sahsiah"
          value={
            data.character ? (
              <GradeBadge grade={data.character.grade} />
            ) : (
              "-"
            )
          }
          sublabel={
            data.character
              ? `Purata: ${data.character.average.toFixed(2)} / 5.0`
              : "Belum dinilai"
          }
          color="#0E7C8F"
          icon={<ClipboardList className="size-4" />}
        />

        <StatCard
          label="Jumlah Merit"
          value={data.merit.merit}
          sublabel="Mata positif"
          color="#16A34A"
          icon={<Award className="size-4" />}
        />

        <StatCard
          label="Jumlah Demerit"
          value={Math.abs(data.merit.demerit)}
          sublabel="Mata negatif"
          color="#DC2626"
          icon={<Award className="size-4" />}
        />

        <StatCard
          label="Mata Bersih"
          value={data.merit.cleanPoints}
          sublabel={
            <span className="flex items-center gap-2">
              <MeritLevelBadge level={data.merit.level} />
              {data.merit.hasBerat && (
                <Badge variant="destructive">Kes Berat</Badge>
              )}
            </span>
          }
          color="#0E7C8F"
          icon={<Award className="size-4" />}
        />

        <StatCard
          label="Penyertaan Program"
          value={data.programs.length}
          sublabel="Program disertai"
          color="#00B4CC"
          icon={<FolderKanban className="size-4" />}
        />
      </div>

      {/* Human-readable sentence */}
      <BentoCard className="bg-primary/5 border-primary/20">
        <p className="text-base font-medium text-brand-dark">
          {sentence}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="flex items-center gap-2">
            <CalendarCheck className="size-4 text-status-green" />
            Status Disiplin:{" "}
            <MeritLevelBadge level={data.merit.level} />{" "}
            ({MERIT_LEVEL_LABELS[data.merit.level]})
          </span>
        </div>
      </BentoCard>

      {/* Tabs */}
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
          <TabsTrigger value="attendance" className="h-11">
            <CalendarCheck className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">Kedatangan</span>
          </TabsTrigger>
          <TabsTrigger value="character" className="h-11">
            <ClipboardList className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">Sahsiah</span>
          </TabsTrigger>
          <TabsTrigger value="merit" className="h-11">
            <Award className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">Merit/Demerit</span>
          </TabsTrigger>
          <TabsTrigger value="duty" className="h-11">
            <FileText className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">Guru Bertugas</span>
          </TabsTrigger>
          <TabsTrigger value="program" className="h-11">
            <FolderKanban className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">Program</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-4">
          <AttendanceTab studentId={data.profile.id} currentMonth={data.attendanceStats.currentMonth} />
        </TabsContent>
        <TabsContent value="character" className="mt-4">
          <CharacterTab studentId={data.profile.id} />
        </TabsContent>
        <TabsContent value="merit" className="mt-4">
          <MeritTab studentId={data.profile.id} />
        </TabsContent>
        <TabsContent value="duty" className="mt-4">
          <DutyTab studentId={data.profile.id} />
        </TabsContent>
        <TabsContent value="program" className="mt-4">
          <ProgramTab programs={data.programs} studentId={data.profile.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
