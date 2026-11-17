"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { BentoCard } from "@/components/mtaf/bento";
import { Loading, ErrorState, EmptyState } from "@/components/mtaf/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Target,
  Trophy,
  Users,
  CheckCircle2,
} from "lucide-react";
import {
  PROGRAM_CATEGORY_LABELS,
  formatBMDate,
} from "@/lib/format";

type ProgramDetail = {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  date: string;
  location: string;
  description: string;
  objectives: string;
  outcome: string;
  coverImage: string | null;
  gallery: string[];
  published: boolean;
  participantCount: number;
  participating: boolean;
};

export function ProgramDetailView() {
  const { selectedProgramId, setView } = useStore();
  const [lightbox, setLightbox] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<ProgramDetail>({
    queryKey: ["program-detail", selectedProgramId],
    queryFn: () => api(`/api/programs/${selectedProgramId}`),
    enabled: !!selectedProgramId,
  });

  if (isLoading) return <Loading label="Memuatkan program..." />;
  if (error || !data)
    return (
      <ErrorState message="Program tidak dijumpai atau tidak diterbitkan." />
    );

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => setView("programs")} className="h-10">
        <ArrowLeft className="size-4" />
        Senarai Program
      </Button>

      <BentoCard className="p-0 overflow-hidden">
        <div className="relative aspect-[21/9] w-full bg-muted">
          {data.coverImage ? (
            <Image
              src={data.coverImage}
              alt={data.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Trophy className="size-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <Badge className="mb-2 bg-brand text-white border-brand">
              {data.categoryLabel}
            </Badge>
            <h1 className="text-xl font-extrabold sm:text-2xl">{data.title}</h1>
            <div className="mt-1 flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {formatBMDate(data.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {data.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-4" />
                {data.participantCount} peserta
              </span>
            </div>
          </div>
        </div>

        {data.participating && (
          <div className="flex items-center gap-2 bg-status-green/10 p-3 text-status-green">
            <CheckCircle2 className="size-5" />
            <span className="font-medium">
              Pelajar anda menyertai program ini
            </span>
          </div>
        )}
      </BentoCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BentoCard>
          <h3 className="mb-2 flex items-center gap-2 font-bold">
            <Target className="size-4 text-primary" />
            Penerangan
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.description || "Tiada penerangan."}
          </p>
        </BentoCard>
        <BentoCard>
          <h3 className="mb-2 flex items-center gap-2 font-bold">
            <Target className="size-4 text-primary" />
            Objektif
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.objectives || "Tiada objektif."}
          </p>
        </BentoCard>
      </div>

      <BentoCard>
        <h3 className="mb-2 flex items-center gap-2 font-bold">
          <Trophy className="size-4 text-primary" />
          Hasil / Outcome
        </h3>
        <p className="text-sm text-muted-foreground">
          {data.outcome || "Tiada maklumat hasil."}
        </p>
      </BentoCard>

      <BentoCard>
        <h3 className="mb-3 font-bold">Galeri Gambar</h3>
        {data.gallery.length === 0 ? (
          <EmptyState title="Tiada gambar dalam galeri" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {data.gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setLightbox(src)}
                className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
              >
                <Image
                  src={src}
                  alt={`Galeri ${i + 1}`}
                  fill
                  sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover transition hover:scale-105"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </BentoCard>

      <Dialog
        open={!!lightbox}
        onOpenChange={(o) => !o && setLightbox(null)}
      >
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">Paparan Gambar</DialogTitle>
          {lightbox && (
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={lightbox}
                alt="Paparan gambar"
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
