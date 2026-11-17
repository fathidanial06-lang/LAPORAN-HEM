"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import Image from "next/image";
import { BentoCard, SectionTitle } from "@/components/mtaf/bento";
import { EmptyState, Loading } from "@/components/mtaf/states";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  MapPin,
  FolderKanban,
  ArrowRight,
} from "lucide-react";
import {
  PROGRAM_CATEGORIES,
  PROGRAM_CATEGORY_LABELS,
  formatBMDate,
} from "@/lib/format";

type ProgramsResp = {
  programs: {
    id: string;
    title: string;
    category: string;
    categoryLabel: string;
    date: string;
    location: string;
    coverImage: string | null;
    description: string;
    published: boolean;
  }[];
};

export function ProgramsView() {
  const { goProgram } = useStore();
  const [category, setCategory] = useState("ALL");

  const { data, isLoading } = useQuery<ProgramsResp>({
    queryKey: ["programs-public", category],
    queryFn: () =>
      api(
        `/api/programs?category=${encodeURIComponent(category)}`,
      ),
  });

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Program & Aktiviti"
        subtitle="Program dan aktiviti yang dianjurkan oleh Madrasah Tahfiz Al Furqan."
        action={
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              {PROGRAM_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {PROGRAM_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isLoading ? (
        <Loading />
      ) : !data || data.programs.length === 0 ? (
        <EmptyState
          title="Tiada program"
          description="Tiada program diterbitkan buat masa ini."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.programs.map((p) => (
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
                    loading="lazy"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <FolderKanban className="size-8" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {p.categoryLabel}
                </span>
                <h4 className="font-bold leading-snug line-clamp-2">
                  {p.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {p.description}
                </p>
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
                <Button variant="ghost" size="sm" className="mt-1 h-9 w-fit -ml-2">
                  Butiran
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </BentoCard>
          ))}
        </div>
      )}
    </div>
  );
}
