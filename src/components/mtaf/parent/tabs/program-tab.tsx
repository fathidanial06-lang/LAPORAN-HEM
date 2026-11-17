"use client";

import Image from "next/image";
import { BentoCard } from "@/components/mtaf/bento";
import { EmptyState } from "@/components/mtaf/states";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import {
  PROGRAM_CATEGORY_LABELS,
  formatBMDate,
} from "@/lib/format";
import { CalendarDays, MapPin, FolderKanban, CheckCircle2 } from "lucide-react";

type Program = {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  coverImage: string | null;
};

export function ProgramTab({
  programs,
  studentId,
}: {
  programs: Program[];
  studentId: string;
}) {
  const { goProgram } = useStore();
  void studentId;

  if (programs.length === 0) {
    return (
      <EmptyState
        title="Tiada penyertaan program"
        description="Anak anda belum menyertai sebarang program diterbitkan."
      />
    );
  }

  return (
    <div className="space-y-3">
      <BentoCard className="bg-primary/5 border-primary/20">
        <p className="text-sm">
          Berikut adalah program yang disertai oleh anak anda. Klik untuk butiran
          penuh program.
        </p>
      </BentoCard>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((p) => (
          <BentoCard
            key={p.id}
            onClick={() => goProgram(p.id)}
            className="flex flex-col gap-3 p-0 overflow-hidden"
          >
            <div className="relative aspect-video w-full bg-muted">
              {p.coverImage ? (
                <Image
                  src={p.coverImage}
                  alt={p.title}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <FolderKanban className="size-8" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {PROGRAM_CATEGORY_LABELS[p.category] ?? p.category}
                </Badge>
                <Badge className="bg-status-green text-white border-status-green">
                  <CheckCircle2 className="size-3" />
                  Menyertai
                </Badge>
              </div>
              <h4 className="font-bold leading-snug line-clamp-2">
                {p.title}
              </h4>
              <div className="mt-auto space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  {formatBMDate(p.date)}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {p.location}
                </p>
              </div>
            </div>
          </BentoCard>
        ))}
      </div>
    </div>
  );
}
