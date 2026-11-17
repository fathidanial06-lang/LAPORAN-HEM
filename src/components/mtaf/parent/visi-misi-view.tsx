"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { api } from "@/lib/api";
import { BentoCard, SectionTitle } from "@/components/mtaf/bento";
import { Loading } from "@/components/mtaf/states";
import { Shield, Eye, Target } from "lucide-react";

type SchoolInfo = {
  name: string;
  nameArabic: string | null;
  logo: string | null;
  vision: string;
  mission: string;
  address: string | null;
  phone: string | null;
  email: string | null;
};

export function VisiMisiView() {
  const { data, isLoading } = useQuery<SchoolInfo>({
    queryKey: ["school"],
    queryFn: () => api("/api/school"),
  });

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Visi & Misi"
        subtitle="Panduan dan hala tuju Madrasah Tahfiz Al Furqan."
      />
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <BentoCard className="bg-gradient-to-br from-primary to-brand text-white border-none">
            <div className="flex flex-col items-center text-center">
              {data?.logo && (
                <Image
                  src={data.logo}
                  alt={data.name}
                  width={120}
                  height={120}
                  className="mb-4"
                />
              )}
              <h1 className="text-2xl font-extrabold">{data?.name}</h1>
              {data?.nameArabic && (
                <p className="mt-1 text-lg opacity-90" dir="rtl">
                  {data.nameArabic}
                </p>
              )}
            </div>
          </BentoCard>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <BentoCard>
              <div className="flex items-center gap-2">
                <Eye className="size-5 text-primary" />
                <h3 className="font-bold">Visi</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {data?.vision}
              </p>
            </BentoCard>
            <BentoCard>
              <div className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                <h3 className="font-bold">Misi</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {data?.mission}
              </p>
            </BentoCard>
          </div>

          {data?.address && (
            <BentoCard className="bg-muted/30">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                <h3 className="font-bold">Maklumat Hubungan</h3>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>{data.address}</p>
                {data.phone && <p>Telefon: {data.phone}</p>}
                {data.email && <p>E-mel: {data.email}</p>}
              </div>
            </BentoCard>
          )}
        </>
      )}
    </div>
  );
}
