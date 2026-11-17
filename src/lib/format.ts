// Shared helpers used by both API and frontend
// (IC masking, attendance stats, merit status level, grade calc)

export function maskIc(ic: string): string {
  // format as xxxxxx-xx-**34
  if (!ic || ic.length !== 12) return ic ?? "";
  return `${ic.slice(0, 6)}-${ic.slice(6, 8)}-**${ic.slice(10, 12)}`;
}

export function formatIc(ic: string): string {
  // format as xxxxxx-xx-xxxx
  if (!ic || ic.length !== 12) return ic ?? "";
  return `${ic.slice(0, 6)}-${ic.slice(6, 8)}-${ic.slice(8, 12)}`;
}

export function formatIcInput(value: string): string {
  // auto-format input as user types: keep only digits, max 12, format with dashes
  const digits = value.replace(/\D/g, "").slice(0, 12);
  let out = digits;
  if (digits.length > 6) {
    out = `${digits.slice(0, 6)}-${digits.slice(6)}`;
  }
  if (digits.length > 8) {
    out = `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
  }
  return out;
}

export function isValidIc12(ic: string): boolean {
  return /^\d{12}$/.test(ic.replace(/\D/g, ""));
}

export function lastFourIc(ic: string): string {
  if (!ic || ic.length < 4) return "";
  return ic.slice(-4);
}

// ---------- Attendance ----------
export type AttendanceStatus =
  | "HADIR"
  | "LEWAT"
  | "TH_BERSEBAB"
  | "TH_TANPA_SEBAB"
  | "CUTI";

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  HADIR: "Hadir",
  LEWAT: "Lewat",
  TH_BERSEBAB: "Tidak Hadir (Bersebab)",
  TH_TANPA_SEBAB: "Tidak Hadir (Tanpa Sebab)",
  CUTI: "Cuti",
};

export const ATTENDANCE_COLORS: Record<AttendanceStatus, string> = {
  HADIR: "#16A34A",
  LEWAT: "#F59E0B",
  TH_BERSEBAB: "#2563EB",
  TH_TANPA_SEBAB: "#DC2626",
  CUTI: "#9CA3AF",
};

export function attendanceColor(status: string): string {
  return (
    ATTENDANCE_COLORS[status as AttendanceStatus] ?? "#9CA3AF"
  );
}

export function computeAttendanceStats(records: { status: string }[]) {
  const total = records.length;
  const hadir = records.filter((r) => r.status === "HADIR").length;
  const lewat = records.filter((r) => r.status === "LEWAT").length;
  const thBersebab = records.filter((r) => r.status === "TH_BERSEBAB").length;
  const thTanpa = records.filter((r) => r.status === "TH_TANPA_SEBAB").length;
  const cuti = records.filter((r) => r.status === "CUTI").length;
  // percentage: (hadir + lewat) / (total - cuti) since cuti days shouldn't count
  const effective = total - cuti;
  const present = hadir + lewat;
  const percentage = effective > 0 ? Math.round((present / effective) * 100) : 0;
  return {
    total,
    hadir,
    lewat,
    thBersebab,
    thTanpa,
    cuti,
    effective,
    present,
    percentage,
  };
}

// ---------- Character ----------
export function characterGrade(avg: number): string {
  if (avg >= 4.5) return "CEMERLANG";
  if (avg >= 3.5) return "BAIK";
  if (avg >= 2.5) return "MEMUASKAN";
  return "PERLU_BIMBINGAN";
}

export const GRADE_LABELS: Record<string, string> = {
  CEMERLANG: "Cemerlang",
  BAIK: "Baik",
  MEMUASKAN: "Memuaskan",
  PERLU_BIMBINGAN: "Perlu Bimbingan",
};

export const GRADE_COLORS: Record<string, string> = {
  CEMERLANG: "#16A34A",
  BAIK: "#0E7C8F",
  MEMUASKAN: "#F59E0B",
  PERLU_BIMBINGAN: "#DC2626",
};

export const ASPECT_LABELS: { key: string; label: string }[] = [
  { key: "akhlak", label: "Akhlak" },
  { key: "ibadah", label: "Ibadah" },
  { key: "tanggungjawab", label: "Tanggungjawab" },
  { key: "kebersihan", label: "Kebersihan" },
  { key: "kerjasama", label: "Kerjasama" },
];

// ---------- Merit ----------
export function computeMeritStatus(records: { points: number; severity?: string | null; voided: boolean }[]) {
  const active = records.filter((r) => !r.voided);
  const merit = active
    .filter((r) => r.points > 0)
    .reduce((s, r) => s + r.points, 0);
  const demerit = active
    .filter((r) => r.points < 0)
    .reduce((s, r) => s + r.points, 0);
  const cleanPoints = merit + demerit; // demerit is negative
  const hasBerat = active.some((r) => r.severity === "BERAT");
  const absClean = Math.abs(cleanPoints);
  let level: "HIJAU" | "KUNING" | "JINGGA" | "MERAH";
  if (hasBerat || absClean >= 50) level = "MERAH";
  else if (absClean >= 30) level = "JINGGA";
  else if (absClean >= 15) level = "KUNING";
  else level = "HIJAU";
  return { merit, demerit, cleanPoints, level, hasBerat };
}

export const MERIT_LEVEL_LABELS: Record<string, string> = {
  HIJAU: "Hijau",
  KUNING: "Kuning",
  JINGGA: "Jingga",
  MERAH: "Merah",
};

export const MERIT_LEVEL_COLORS: Record<string, string> = {
  HIJAU: "#16A34A",
  KUNING: "#F59E0B",
  JINGGA: "#EA580C",
  MERAH: "#DC2626",
};

// ---------- Misc ----------
export const DUTY_STATUS_LABELS: Record<string, string> = {
  DRAF: "Draf",
  MENUNGGU: "Menunggu Kelulusan",
  DIKEMBALIKAN: "Dikembalikan",
  DILULUSKAN: "Diluluskan",
  DITERBITKAN: "Diterbitkan",
};

export const DUTY_STATUS_COLORS: Record<string, string> = {
  DRAF: "#9CA3AF",
  MENUNGGU: "#F59E0B",
  DIKEMBALIKAN: "#DC2626",
  DILULUSKAN: "#0E7C8F",
  DITERBITKAN: "#16A34A",
};

export const PROGRAM_CATEGORIES = [
  "TAHFIZ",
  "SAHSIAH",
  "SUKAN",
  "KEMASYHAKATAN",
  "LAWATAN",
] as const;

export const PROGRAM_CATEGORY_LABELS: Record<string, string> = {
  TAHFIZ: "Tahfiz",
  SAHSIAH: "Sahsiah",
  SUKAN: "Sukan",
  KEMASYHAKATAN: "Kemasyarakatan",
  LAWATAN: "Lawatan",
};

export function bmMonthLabel(month: string): string {
  // month format YYYY-MM
  if (!month || month.length !== 7) return month;
  const [y, m] = month.split("-");
  const months = [
    "Januari",
    "Februari",
    "Mac",
    "April",
    "Mei",
    "Jun",
    "Julai",
    "Ogos",
    "September",
    "Oktober",
    "November",
    "Disember",
  ];
  const idx = parseInt(m, 10) - 1;
  if (idx < 0 || idx > 11) return month;
  return `${months[idx]} ${y}`;
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function formatBMDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  const months = [
    "Januari",
    "Februari",
    "Mac",
    "April",
    "Mei",
    "Jun",
    "Julai",
    "Ogos",
    "September",
    "Oktober",
    "November",
    "Disember",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
