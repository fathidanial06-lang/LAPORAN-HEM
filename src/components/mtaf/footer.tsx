"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Shield, Phone, Mail } from "lucide-react";

type SchoolInfo = {
  id: string;
  name: string;
  nameArabic: string | null;
  vision: string;
  mission: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  hemPhone: string | null;
  hemEmail: string | null;
};

export function Footer() {
  const { data: school } = useQuery<SchoolInfo>({
    queryKey: ["school"],
    queryFn: () => api("/api/school"),
  });
  return (
    <footer className="mt-auto w-full border-t border-border bg-brand-dark text-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-brand" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-brand">
                Visi & Misi
              </h3>
            </div>
            <p className="mt-2 line-clamp-3 text-xs text-gray-300">
              {school?.vision}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-brand">
              UNIT HEM
            </h3>
            <ul className="mt-2 space-y-1 text-xs text-gray-300">
              <li className="flex items-center gap-2">
                <Phone className="size-3.5" />
                {school?.hemPhone ?? school?.phone ?? "-"}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-3.5" />
                {school?.hemEmail ?? school?.email ?? "-"}
              </li>
              <li className="pt-1">{school?.address}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-brand">
              Notis Privasi
            </h3>
            <p className="mt-2 text-xs text-gray-300">
              Maklumat peribadi anak anda dilindungi. Pengesahan No. Kad
              Pengenalan diperlukan untuk mengelakkan akses tanpa kebenaran.
              Data individu tidak akan dipaparkan tanpa keizinan ibu bapa.
            </p>
          </div>
        </div>
        <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} {school?.name ?? "Madrasah Tahfiz Al Furqan"}.
          Hak cipta terpelihara.
        </div>
      </div>
    </footer>
  );
}
