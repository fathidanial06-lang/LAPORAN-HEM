// Seed script: populates SQLite with PRD-compliant dummy data
// Run with: bun run seed
import { db } from "../src/lib/db"

// ---------- Static reference data from PRD ----------

const schoolInfo = {
  id: "singleton",
  name: "Madrasah Tahfiz Al Furqan",
  nameArabic: "مدرسة تحفيظ الفرقان",
  logo: "/logo-mtaf.svg",
  vision:
    "Menjadi institusi yang menerajui sistem pendidikan Islam holistik (lengkap) dan inovatif dengan meletakkan al-Quran dan as-Sunnah sebagai panduan.",
  mission:
    "Membina individu yang menyumbang kepada ummah dan bersifat Rabbani melalui sistem pendidikan Islam yang menyeluruh, unggul dan dihormati.",
  address: "Lot 12, Jalan Furqan, 43000 Kajang, Selangor, Malaysia",
  phone: "+603-8739 1224",
  email: "hem@mtaf.edu.my",
  hemPhone: "+603-8739 1225",
  hemEmail: "hem@mtaf.edu.my",
}

// Classes (4) per PRD prompt: 4 kelas
const classes = [
  { id: "C1A", name: "1 Ibnu Sina", year: 1, homeroomTeacherId: "T001" },
  { id: "C2A", name: "2 Ibnu Sina", year: 2, homeroomTeacherId: "T002" },
  { id: "C3A", name: "3 Al-Ghazali", year: 3, homeroomTeacherId: "T003" },
  { id: "C4A", name: "4 Imam Syafii", year: 4, homeroomTeacherId: "T004" },
]

const teachers = [
  { id: "T001", name: "Ustaz Ahmad Faiz bin Hassan", role: "guruKelas", phone: "+6012-345 1001" },
  { id: "T002", name: "Ustazah Salmah binti Yusof", role: "guruKelas", phone: "+6012-345 1002" },
  { id: "T003", name: "Ustaz Mohd Ridhuan bin Taib", role: "warden", phone: "+6012-345 1003" },
  { id: "T004", name: "Ustazah Nor Aini binti Othman", role: "guruKelas", phone: "+6012-345 1004" },
  { id: "T005", name: "Ustaz Hafizuddin bin Roslan", role: "guruBertugas", phone: "+6012-345 1005" },
  { id: "T006", name: "Ustazah Zainab binti Ibrahim", role: "guruBertugas", phone: "+6012-345 1006" },
]

// Admin users (dummy login). passwordHash format: "plain:$PLAINTEXT" (prototaip only)
const users = [
  { id: "U001", username: "superadmin", passwordHash: "plain:superadmin123", role: "superadmin", teacherId: null, name: "Pentadbir UNIT HEM" },
  { id: "U002", username: "guruKananHEM", passwordHash: "plain:hem12345", role: "guruKananHEM", teacherId: "T001", name: "Ustaz Ahmad Faiz (Guru Kanan HEM)" },
  { id: "U003", username: "pengetua", passwordHash: "plain:pengetua123", role: "pengetua", teacherId: "T003", name: "Ustaz Mohd Ridhuan (Pengetua)" },
  { id: "U004", username: "guru", passwordHash: "plain:guru123", role: "guru", teacherId: "T002", name: "Ustazah Salmah (Guru Kelas)" },
  { id: "U005", username: "guruBertugas", passwordHash: "plain:tugas123", role: "guruBertugas", teacherId: "T005", name: "Ustaz Hafizuddin (Guru Bertugas)" },
]

// Merit categories (PRD §12.6 + §12.1–12.3)
const meritCategories = [
  // Merit M01–M15
  { id: "M01", code: "M01", name: "Khatam juzuk / hafazan cemerlang", type: "MERIT", group: "Tahfiz", points: 10 },
  { id: "M02", code: "M02", name: "Lulus ujian tasmik/hafazan dengan cemerlang", type: "MERIT", group: "Tahfiz", points: 5 },
  { id: "M03", code: "M03", name: "Keputusan peperiksaan cemerlang/peningkatan ketara", type: "MERIT", group: "Akademik", points: 5 },
  { id: "M04", code: "M04", name: "Membantu rakan atau guru", type: "MERIT", group: "Akhlak", points: 3 },
  { id: "M05", code: "M05", name: "Akhlak dan adab terpuji (dipuji guru)", type: "MERIT", group: "Akhlak", points: 3 },
  { id: "M06", code: "M06", name: "Jujur dan amanah (memulangkan barang)", type: "MERIT", group: "Akhlak", points: 5 },
  { id: "M07", code: "M07", name: "Solat berjemaah dan ibadah konsisten sepanjang bulan", type: "MERIT", group: "Ibadah", points: 5 },
  { id: "M08", code: "M08", name: "Kebersihan diri, kelas atau asrama terbaik", type: "MERIT", group: "Kebersihan", points: 3 },
  { id: "M09", code: "M09", name: "Kedatangan penuh sepanjang bulan", type: "MERIT", group: "Kedatangan", points: 5 },
  { id: "M10", code: "M10", name: "Memegang jawatan/tanggungjawab dengan baik", type: "MERIT", group: "Kepimpinan", points: 5 },
  { id: "M11", code: "M11", name: "Menyertai program madrasah", type: "MERIT", group: "Program", points: 3 },
  { id: "M12", code: "M12", name: "Menjadi AJK atau petugas program", type: "MERIT", group: "Program", points: 5 },
  { id: "M13", code: "M13", name: "Mewakili madrasah dalam pertandingan", type: "MERIT", group: "Pertandingan", points: 10 },
  { id: "M14", code: "M14", name: "Johan atau naib johan pertandingan", type: "MERIT", group: "Pertandingan", points: 15 },
  { id: "M15", code: "M15", name: "Menyumbang idea atau inisiatif positif", type: "MERIT", group: "Inisiatif", points: 3 },
  // Demerit Ringan R01–R15
  { id: "R01", code: "R01", name: "Lewat masuk kelas", type: "DEMERIT", severity: "RINGAN", points: -2 },
  { id: "R02", code: "R02", name: "Lewat hadir ke sekolah", type: "DEMERIT", severity: "RINGAN", points: -2 },
  { id: "R03", code: "R03", name: "Tidak membawa buku/peralatan pembelajaran", type: "DEMERIT", severity: "RINGAN", points: -2 },
  { id: "R04", code: "R04", name: "Tidak memakai pakaian yang ditetapkan dengan lengkap", type: "DEMERIT", severity: "RINGAN", points: -2 },
  { id: "R05", code: "R05", name: "Tidak memakai tag nama/lencana", type: "DEMERIT", severity: "RINGAN", points: -2 },
  { id: "R06", code: "R06", name: "Rambut tidak mengikut peraturan", type: "DEMERIT", severity: "RINGAN", points: -2 },
  { id: "R07", code: "R07", name: "Tidak menjaga kebersihan diri", type: "DEMERIT", severity: "RINGAN", points: -2 },
  { id: "R08", code: "R08", name: "Kelas/meja tidak kemas", type: "DEMERIT", severity: "RINGAN", points: -2 },
  { id: "R09", code: "R09", name: "Makan atau minum dalam kelas tanpa kebenaran", type: "DEMERIT", severity: "RINGAN", points: -2 },
  { id: "R10", code: "R10", name: "Bercakap ketika guru mengajar", type: "DEMERIT", severity: "RINGAN", points: -2 },
  { id: "R11", code: "R11", name: "Mengganggu rakan", type: "DEMERIT", severity: "RINGAN", points: -2 },
  { id: "R12", code: "R12", name: "Tidak membuat tugasan", type: "DEMERIT", severity: "RINGAN", points: -2 },
  { id: "R13", code: "R13", name: "Tidur di dalam kelas", type: "DEMERIT", severity: "RINGAN", points: -2 },
  { id: "R14", code: "R14", name: "Menukar tempat duduk tanpa kebenaran", type: "DEMERIT", severity: "RINGAN", points: -2 },
  { id: "R15", code: "R15", name: "Tidak mematuhi arahan guru", type: "DEMERIT", severity: "RINGAN", points: -2 },
  // Demerit Sederhana S01–S14
  { id: "S01", code: "S01", name: "Ponteng kelas", type: "DEMERIT", severity: "SEDERHANA", points: -5 },
  { id: "S02", code: "S02", name: "Keluar kelas tanpa kebenaran", type: "DEMERIT", severity: "SEDERHANA", points: -5 },
  { id: "S03", code: "S03", name: "Keluar kawasan sekolah tanpa kebenaran", type: "DEMERIT", severity: "SEDERHANA", points: -5 },
  { id: "S04", code: "S04", name: "Berulang kali melakukan kesalahan ringan", type: "DEMERIT", severity: "SEDERHANA", points: -5 },
  { id: "S05", code: "S05", name: "Ingkar arahan guru", type: "DEMERIT", severity: "SEDERHANA", points: -5 },
  { id: "S06", code: "S06", name: "Bahasa yang kurang sopan terhadap guru/rakan", type: "DEMERIT", severity: "SEDERHANA", points: -5 },
  { id: "S07", code: "S07", name: "Mengganggu atau membuli secara verbal", type: "DEMERIT", severity: "SEDERHANA", points: -5 },
  { id: "S08", code: "S08", name: "Mengejek atau memalukan rakan", type: "DEMERIT", severity: "SEDERHANA", points: -5 },
  { id: "S09", code: "S09", name: "Pergaduhan kecil (mulut)", type: "DEMERIT", severity: "SEDERHANA", points: -5 },
  { id: "S10", code: "S10", name: "Merosakkan harta benda secara sengaja", type: "DEMERIT", severity: "SEDERHANA", points: -5 },
  { id: "S11", code: "S11", name: "Membawa barang yang dilarang", type: "DEMERIT", severity: "SEDERHANA", points: -5 },
  { id: "S12", code: "S12", name: "Menipu atau memberikan maklumat palsu", type: "DEMERIT", severity: "SEDERHANA", points: -5 },
  { id: "S13", code: "S13", name: "Meniru dalam tugasan/ujian", type: "DEMERIT", severity: "SEDERHANA", points: -5 },
  { id: "S14", code: "S14", name: "Mengambil barang rakan tanpa izin", type: "DEMERIT", severity: "SEDERHANA", points: -5 },
  // Demerit Berat B01–B15
  { id: "B01", code: "B01", name: "Buli fizikal yang serius", type: "DEMERIT", severity: "BERAT", points: -15 },
  { id: "B02", code: "B02", name: "Pergaduhan serius", type: "DEMERIT", severity: "BERAT", points: -15 },
  { id: "B03", code: "B03", name: "Mencederakan pelajar atau guru", type: "DEMERIT", severity: "BERAT", points: -15 },
  { id: "B04", code: "B04", name: "Mengugut atau memeras ugut", type: "DEMERIT", severity: "BERAT", points: -15 },
  { id: "B05", code: "B05", name: "Gangguan seksual", type: "DEMERIT", severity: "BERAT", points: -15 },
  { id: "B06", code: "B06", name: "Membawa senjata atau benda berbahaya", type: "DEMERIT", severity: "BERAT", points: -15 },
  { id: "B07", code: "B07", name: "Mencuri", type: "DEMERIT", severity: "BERAT", points: -15 },
  { id: "B08", code: "B08", name: "Vandalisme serius", type: "DEMERIT", severity: "BERAT", points: -15 },
  { id: "B09", code: "B09", name: "Membawa atau menggunakan dadah", type: "DEMERIT", severity: "BERAT", points: -15 },
  { id: "B10", code: "B10", name: "Membawa atau menggunakan bahan terlarang", type: "DEMERIT", severity: "BERAT", points: -15 },
  { id: "B11", code: "B11", name: "Merokok/vape", type: "DEMERIT", severity: "BERAT", points: -15 },
  { id: "B12", code: "B12", name: "Membawa bahan lucah", type: "DEMERIT", severity: "BERAT", points: -15 },
  { id: "B13", code: "B13", name: "Menyebarkan kandungan lucah", type: "DEMERIT", severity: "BERAT", points: -15 },
  { id: "B14", code: "B14", name: "Gangguan atau ancaman serius melalui media sosial", type: "DEMERIT", severity: "BERAT", points: -15 },
  { id: "B15", code: "B15", name: "Kesalahan berulang yang serius", type: "DEMERIT", severity: "BERAT", points: -15 },
]

// 30 students with Malaysian dummy names & ICs
const studentSeed: Array<[string, string, string, string, number, string, string]> = [
  // [name, ic, classId, gender, year, guardianName, guardianPhone]
  ["MUHAMMAD AIMAN BIN AHMAD", "130412101234", "C2A", "L", 2, "AHMAD BIN HASSAN", "+6012-234 1101"],
  ["AHMAD ZIKRI BIN AZMAN", "130505085612", "C2A", "L", 2, "AZMAN BIN DAUD", "+6012-234 1102"],
  ["NUR AISHAH BINTI FARID", "131208047123", "C2A", "P", 2, "FARID BIN RAZALI", "+6012-234 1103"],
  ["SITI KHADIJAH BINTI RAMLI", "130901086534", "C2A", "P", 2, "RAMLI BIN SALLEH", "+6012-234 1104"],
  ["MOHAMAD HAZIQ BIN ROSLI", "130714051278", "C2A", "L", 2, "ROSLI BIN OMAR", "+6012-234 1105"],
  ["NUR HUSNA BINTI ZAHARI", "131115042391", "C2A", "P", 2, "ZAHARI BIN IDRIS", "+6012-234 1106"],
  ["ABDUL RAHMAN BIN SUFFIAN", "120320103345", "C3A", "L", 3, "SUFFIAN BIN ABDUL", "+6012-234 1107"],
  ["AISYAH BINTI MAHMUD", "120512084567", "C3A", "P", 3, "MAHMUD BIN YUSOF", "+6012-234 1108"],
  ["YUSUF BIN ABDULLAH", "120615093212", "C3A", "L", 3, "ABDULLAH BIN ALI", "+6012-234 1109"],
  ["FATIMAH BINTI ZULKIFLI", "120801043678", "C3A", "P", 3, "ZULKIFLI BIN HASSAN", "+6012-234 1110"],
  ["MUHAMMAD IQBAL BIN HAFIZ", "120910071239", "C3A", "L", 3, "HAFIZ BIN SAID", "+6012-234 1111"],
  ["ZAYYAD BIN KAMARUL", "121204054321", "C3A", "L", 3, "KAMARUL BIN ISMAIL", "+6012-234 1112"],
  ["UMAR BIN ABDUL WAHAB", "110305092234", "C4A", "L", 4, "ABDUL WAHAB BIN NGAH", "+6012-234 1113"],
  ["KHADIJAH BINTI ABDUL AZIZ", "110507043215", "C4A", "P", 4, "ABDUL AZIZ BIN DAUD", "+6012-234 1114"],
  ["IBRAHIM BIN SALLEH", "110712071198", "C4A", "L", 4, "SALLEH BIN MAHMUD", "+6012-234 1115"],
  ["MARYAM BINTI HASSAN", "110921055432", "C4A", "P", 4, "HASSAN BIN AHMAD", "+6012-234 1116"],
  ["YAHYA BIN ZULKARNAIN", "111115039876", "C4A", "L", 4, "ZULKARNAIN BIN OTHMAN", "+6012-234 1117"],
  ["SAFIYYAH BINTI AZHAR", "120112044567", "C4A", "P", 4, "AZHAR BIN RAMLI", "+6012-234 1118"],
  ["ALI BIN HUSSAIN", "150101051234", "C1A", "L", 1, "HUSSAIN BIN MAT", "+6012-234 1119"],
  ["HANAN BINTI SOLAHUDDIN", "150215046789", "C1A", "P", 1, "SOLAHUDDIN BIN ALI", "+6012-234 1120"],
  ["HAMZAH BIN ABDUL RAUF", "150305071234", "C1A", "L", 1, "ABDUL RAUF BIN SALLEH", "+6012-234 1121"],
  ["ZAINAB BINTI ABDUL HAMID", "150412042345", "C1A", "P", 1, "ABDUL HAMID BIN RAHIM", "+6012-234 1122"],
  ["BILAL BIN AHMAD ZAHID", "150520055678", "C1A", "L", 1, "AHMAD ZAHID BIN ALI", "+6012-234 1123"],
  ["RABI'AH BINTI ADNAN", "150612036789", "C1A", "P", 1, "ADNAN BIN SALAHUDDIN", "+6012-234 1124"],
  ["MUSA BIN ABDUL HADI", "150701078901", "C1A", "L", 1, "ABDUL HADI BIN OTHMAN", "+6012-234 1125"],
  ["ASMA' BINTI HAFIZUDDIN", "150815043456", "C1A", "P", 1, "HAFIZUDDIN BIN ABU", "+6012-234 1126"],
  ["ISMAIL BIN MOHD SAID", "150912055678", "C1A", "L", 1, "MOHD SAID BIN YAAKOB", "+6012-234 1127"],
  ["SUMAYYAH BINTI ABDUL LATIF", "151020044321", "C1A", "P", 1, "ABDUL LATIF BIN IBRAHIM", "+6012-234 1128"],
  ["IDRIS BIN MUHAMMAD", "151115063456", "C1A", "L", 1, "MUHAMMAD BIN IDRIS", "+6012-234 1129"],
  ["RUQAYYAH BINTI MUSTAFA", "151205042987", "C1A", "P", 1, "MUSTAFA BIN ABDUL", "+6012-234 1130"],
]

// Programs (6)
const programImages = (slug: string, count: number) =>
  Array.from({ length: count }, (_, i) => `/images/programs/${slug}-${i + 1}.svg`)

const programs = [
  {
    id: "P001",
    title: "Majlis Khatam Al-Quran",
    category: "TAHFIZ",
    date: "2026-10-25",
    location: "Dewan Madrasah, MTAF",
    description:
      "Majlis Khatam Al-Quran tahunan disertai oleh seluruh pelajar tahfiz dan ibu bapa. Pelajar yang telah menghafaz 30 juzuk dimasyhurkan dalam majlis ini.",
    objectives:
      "Meraikan pencapaian hafazan pelajar; memberi motivasi kepada pelajar lain; mengukuhkan hubungan madrasah dengan ibu bapa.",
    outcome:
      "10 orang pelajar sahut khatam; majlis berjalan dengan khidmat dan tertib; ibu bapa menyatakan kebanggaan terhadap kemajuan anak.",
    coverImage: "/images/programs/p001-1.svg",
    gallery: JSON.stringify(programImages("p001", 12)),
    published: true,
  },
  {
    id: "P002",
    title: "Khemah Ibadah & Mutabaah Amal",
    category: "SAHSIAH",
    date: "2026-09-18",
    location: "Tapak Khemah, MTAF",
    description:
      "Program 3 hari 2 malam bagi membina sahsiah pelajar melalui tazkirah, qiyamullail, dan latihan kepimpinan.",
    objectives:
      "Membina disiplin ibadah; memperkukuh sahsiah Rabbani; melatih kerjasama kumpulan.",
    outcome:
      "85% pelajar menunjukkan peningkatan konsistensi solat berjemaah selepas program.",
    coverImage: "/images/programs/p002-1.svg",
    gallery: JSON.stringify(programImages("p002", 11)),
    published: true,
  },
  {
    id: "P003",
    title: "Hari Sukan Madrasah",
    category: "SUKAN",
    date: "2026-08-12",
    location: "Padang MTAF",
    description:
      "Sukan tahunan merangkumi acara olahraga, tarik tali, dan permainan tradisional. Ibu bapa dijemput menyaksikan.",
    objectives: "Membina jasmani; memupuk semangat kesukanan dan kerjasama.",
    outcome: "Empat rumah sukan bertanding; pemenang diberi sijil dan mata merit.",
    coverImage: "/images/programs/p003-1.svg",
    gallery: JSON.stringify(programImages("p003", 10)),
    published: true,
  },
  {
    id: "P004",
    title: "Lawatan Belajar ke Muzium Islam",
    category: "LAWATAN",
    date: "2026-07-22",
    location: "Muzium Islam Kuala Lumpur",
    description:
      "Lawatan pendidikan bagi mendalami sejarah tamadun Islam dan khazanah al-Quran.",
    objectives:
      "Memperluas pengetahuan sejarah Islam; menghayati warisan penulisan dan mushaf al-Quran.",
    outcome:
      "Pelajar menghasilkan refleksi bertulis; 28 pelajar menyertai lawatan ini.",
    coverImage: "/images/programs/p004-1.svg",
    gallery: JSON.stringify(programImages("p004", 10)),
    published: true,
  },
  {
    id: "P005",
    title: "Program Cinta Masjid",
    category: "KEMASYARAKATAN",
    date: "2026-06-15",
    location: "Masjid Al-Furqan, Kajang",
    description:
      "Pelajar menyertai kerja kemasyarakatan: bersih masjid, bantu warga emas solat Jumaat, dan tadabbur al-Quran bersama imam.",
    objectives:
      "Menanam sifat suka membantu; menghormati tempat ibadah; mengeratkan hubungan dengan masyarakat setempat.",
    outcome: "Lebih 40 warga masjid terbantu; pelajar mendapat maklum balas positif.",
    coverImage: "/images/programs/p005-1.svg",
    gallery: JSON.stringify(programImages("p005", 11)),
    published: true,
  },
  {
    id: "P006",
    title: "Pertandingan Hafazan Antar Tingkatan",
    category: "TAHFIZ",
    date: "2026-11-08",
    location: "Dewan Utama MTAF",
    description:
      "Pertandingan hafazan antara kelas bagi menggalakkan semangat persaingan yang sihat dalam hafazan al-Quran.",
    objectives: "Memupuk semangat hafazan; mengenal pelajar berpotensi mewakili madrasah.",
    outcome:
      "Tiga pelajar terbaik dipilih untuk mewakili MTAF di pertandingan negeri.",
    coverImage: "/images/programs/p006-1.svg",
    gallery: JSON.stringify(programImages("p006", 12)),
    published: true,
  },
]

// ---------- Helper generation logic ----------

function pseudoRandom(seed: number) {
  let x = seed
  return () => {
    x = (x * 9301 + 49297) % 233280
    return x / 233280
  }
}

function pad(n: number, len = 4) {
  return n.toString().padStart(len, "0")
}

function gradeFromAvg(avg: number) {
  if (avg >= 4.5) return "CEMERLANG"
  if (avg >= 3.5) return "BAIK"
  if (avg >= 2.5) return "MEMUASKAN"
  return "PERLU_BIMBINGAN"
}

// Generate 3 months of attendance (Sept, Oct, Nov 2026) for each student
function generateAttendance(studentId: string, classId: string, seedNum: number) {
  const rand = pseudoRandom(seedNum * 31 + 17)
  const records: any[] = []
  // School days Mon-Fri from 2026-09-01 to 2026-11-21
  const start = new Date("2026-09-01")
  const end = new Date("2026-11-21")
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay()
    if (dow === 0 || dow === 6) continue // skip weekends
    const iso = d.toISOString().slice(0, 10)
    // Most days present
    const r = rand()
    let status = "HADIR"
    let timeIn = "07:25"
    let note: string | null = null
    if (r < 0.86) {
      status = "HADIR"
      timeIn = `07:${20 + Math.floor(rand() * 10)}`
    } else if (r < 0.93) {
      status = "LEWAT"
      timeIn = `07:${45 + Math.floor(rand() * 15)}`
      note = "Lewat masuk kelas"
    } else if (r < 0.97) {
      status = "TH_BERSEBAB"
      timeIn = null
      note = rand() < 0.5 ? "Sakit (MC)" : "Urusan keluarga"
    } else if (r < 0.99) {
      status = "TH_TANPA_SEBAB"
      timeIn = null
      note = "Tiada keterangan"
    } else {
      status = "CUTI"
      timeIn = null
      note = "Cuti sekolah"
    }
    records.push({
      studentId,
      date: iso,
      status,
      timeIn,
      note,
      recordedBy: "T002",
    })
  }
  return records
}

// Three monthly character assessments per student
function generateCharacter(studentId: string, seedNum: number) {
  const rand = pseudoRandom(seedNum * 53 + 23)
  const periods = ["2026-09", "2026-10", "2026-11"]
  const comments = [
    "Beradab dan rajin membantu rakan. Teruskan usaha menjaga masa.",
    "Solat berjemaah konsisten. Tingkatkan usaha dalam kerjasama kumpulan.",
    "Cemerlang dalam ibadah dan kebersihan. Perlu bimbingan dalam tanggungjawab tugasan.",
    "Akhlak terpuji dan jujur. Tingkatkan inisiatif dalam kepimpinan.",
    "Kerap menunjukkan sifat positif. Galakkan teruskan usaha menjaga kebersihan bilik.",
    "Menunjukkan peningkatan ketara bulan ini. Teruskan usaha menghafaz.",
    "Amanah dan bertanggungjawab. Tingkatkan keyakinan menyampa idea.",
    "Aktif dalam program. Perlu peringatan dalam adab bertutur dengan rakan.",
  ]
  return periods.map((period, i) => {
    const base = 3 + Math.floor(rand() * 3) // 3-5
    const scores = {
      akhlak: Math.min(5, base + (rand() > 0.5 ? 1 : 0)),
      ibadah: Math.min(5, base + (rand() > 0.6 ? 1 : 0)),
      tanggungjawab: Math.max(1, base - (rand() > 0.7 ? 1 : 0)),
      kebersihan: Math.min(5, base),
      kerjasama: Math.min(5, base + (rand() > 0.6 ? 1 : 0)),
    }
    const avg =
      (scores.akhlak + scores.ibadah + scores.tanggungjawab + scores.kebersihan + scores.kerjasama) /
      5
    return {
      studentId,
      period,
      ...scores,
      average: Math.round(avg * 100) / 100,
      grade: gradeFromAvg(avg),
      comment: comments[(seedNum + i) % comments.length],
      assessedBy: "T002",
    }
  })
}

// Generate ~100+ merit/demerit records across students
function generateMeritRecords(studentIds: string[]) {
  const rand = pseudoRandom(99)
  const records: any[] = []
  const meritPool = meritCategories.filter((c) => c.type === "MERIT")
  const demeritRingan = meritCategories.filter((c) => c.type === "DEMERIT" && c.severity === "RINGAN")
  const demeritSederhana = meritCategories.filter(
    (c) => c.type === "DEMERIT" && c.severity === "SEDERHANA"
  )
  const demeritBerat = meritCategories.filter((c) => c.type === "DEMERIT" && c.severity === "BERAT")

  // Each student gets 3-5 records
  studentIds.forEach((sid, idx) => {
    const numRecords = 3 + Math.floor(rand() * 3) // 3-5
    for (let i = 0; i < numRecords; i++) {
      const roll = rand()
      let cat
      if (roll < 0.55) cat = demeritRingan[Math.floor(rand() * demeritRingan.length)]
      else if (roll < 0.85) cat = demeritSederhana[Math.floor(rand() * demeritSederhana.length)]
      else if (roll < 0.93) cat = meritPool[Math.floor(rand() * meritPool.length)]
      else cat = demeritRingan[Math.floor(rand() * demeritRingan.length)]
      // 1 heavy case for a few students (recorded by Guru Kanan HEM)
      if (idx % 11 === 0 && i === 2) {
        cat = demeritBerat[Math.floor(rand() * demeritBerat.length)]
      }
      const day = 1 + Math.floor(rand() * 27)
      const month = 9 + Math.floor(rand() * 3)
      const dateStr = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      // Severity override reason: ~15% of demerits
      const isOverride =
        cat.type === "DEMERIT" && rand() < 0.15 && cat.severity !== "BERAT"
      let severity = cat.severity
      let severityReason: string | null = null
      if (isOverride) {
        // bump up severity
        severity = cat.severity === "RINGAN" ? "SEDERHANA" : "BERAT"
        severityReason = `Kes berulang kali kali ini (${cat.code}); dinaikkan tahap kepada ${severity}.`
      }
      records.push({
        studentId: sid,
        categoryId: cat.id,
        date: dateStr,
        points: cat.points,
        severity,
        severityReason,
        note:
          cat.type === "MERIT"
            ? `Pencapaian: ${cat.name}`
            : `Kes direkod semasa sesi (${cat.code}).`,
        recordedBy:
          cat.severity === "BERAT" ? "T001" : idx % 2 === 0 ? "T002" : "T003",
        voided: false,
        voidReason: null,
        voidedBy: null,
        voidedAt: null,
      })
    }
  })
  return records
}

// 8 weekly duty reports (weeks Sept-Nov 2026)
function generateDutyReports() {
  const weeks: Array<[number, string, string, string, string]> = [
    // [weekNo, startDate, endDate, teacherId, status]
    [1, "2026-09-07", "2026-09-11", "T005", "DITERBITKAN"],
    [2, "2026-09-14", "2026-09-18", "T006", "DITERBITKAN"],
    [3, "2026-09-21", "2026-09-25", "T005", "DITERBITKAN"],
    [4, "2026-09-28", "2026-10-02", "T006", "DITERBITKAN"],
    [5, "2026-10-05", "2026-10-09", "T005", "DITERBITKAN"],
    [6, "2026-10-12", "2026-10-16", "T006", "DITERBITKAN"],
    [7, "2026-11-02", "2026-11-06", "T005", "DITERBITKAN"],
    [8, "2026-11-09", "2026-11-13", "T006", "MENUNGGU"],
  ]
  return weeks.map(([weekNo, startDate, endDate, teacherId, status], i) => ({
    weekNo,
    startDate,
    endDate,
    teacherId,
    attendanceSummary:
      "Kedatangan keseluruhan minggu ini adalah cemerlang dengan 92% pelajar hadir penuh. Beberapa kes lewat direkodkan pada hari Isnin.",
    disciplineSummary:
      "Disiplin umum baik. Tiada kes berat dilaporkan. Beberapa kes ringan dirujuk kepada guru kelas untuk nasihat.",
    cleanliness:
      "Kebersihan kelas dan dewan terjaga. Asrama lelaki memerlukan penambahbaikan dalam susunan barang peribadi.",
    safety:
      "Pintu pagar utama dikunci mengikut jadual. Sistem kebersihan dapur dan stor makanan berjalan lancar.",
    positives: JSON.stringify([
      "Pelajar tingkatan 2 membantu mengemas dewan selepas majlis.",
      "Solat berjemaah Subuh dan Maghib penuh sepanjang minggu.",
      "Tiada kes ponteng kelas pada hari Selasa hingga Khamis.",
    ]),
    improvements: JSON.stringify([
      "Kekerapan lewat masuk kelas pagi perlu dikurangkan.",
      "Beberapa pelajar perlu diperingatkan tentang adab di dalam dewan makan.",
    ]),
    noticeToParents:
      "Ibu bapa dijemput menghadiri Majlis Khatam Al-Quran pada 25 Oktober 2026. Sila pastikan anak hadir 30 minit sebelum majlis.",
    status,
    approvedBy: status === "DITERBITKAN" ? "U002" : null,
    approvedAt: status === "DITERBITKAN" ? new Date("2026-11-15T08:00:00Z") : null,
    reviewNote: status === "DITERBITKAN" ? "Laporan lengkap, diluluskan untuk diterbitkan." : "",
  }))
}

// ---------- Main seed function ----------

async function main() {
  console.log("Clearing existing data...")
  // Wipe tables
  await db.programParticipant.deleteMany()
  await db.program.deleteMany()
  await db.dutyReport.deleteMany()
  await db.meritRecord.deleteMany()
  await db.meritCategory.deleteMany()
  await db.characterAssessment.deleteMany()
  await db.attendance.deleteMany()
  await db.student.deleteMany()
  await db.user.deleteMany()
  await db.teacher.deleteMany()
  await db.classRoom.deleteMany()
  await db.schoolInfo.deleteMany()
  await db.auditLog.deleteMany()

  console.log("Inserting schoolInfo, teachers, classes, users, categories...")
  await db.schoolInfo.upsert({
    where: { id: "singleton" },
    update: schoolInfo,
    create: schoolInfo,
  })
  await db.teacher.createMany({ data: teachers })
  await db.classRoom.createMany({ data: classes })
  await db.user.createMany({ data: users })
  await db.meritCategory.createMany({ data: meritCategories })

  console.log("Inserting 30 students...")
  const students = studentSeed.map(
    ([name, ic, classId, gender, year, guardianName, guardianPhone]) => ({
      id: name.split(" ")[0] === "MUHAMMAD" || name.split(" ")[0] === "AHMAD"
        ? "S" + pad(studentSeed.indexOf(studentSeed.find((s) => s[0] === name)!) + 1)
        : "S" + pad(studentSeed.findIndex((s) => s[0] === name) + 1),
      name,
      ic,
      classId,
      gender,
      year,
      guardianName,
      guardianPhone,
      photoConsent: true,
      photoConsentDate: new Date("2026-01-15"),
      active: true,
    })
  )
  // Reset id with proper sequential ids
  students.forEach((s, i) => {
    s.id = "S" + pad(i + 1)
  })
  await db.student.createMany({ data: students })

  console.log("Generating attendance (3 months for 30 students)...")
  let attCount = 0
  for (let i = 0; i < students.length; i++) {
    const recs = generateAttendance(students[i].id, students[i].classId, i + 1)
    // Insert in chunks of 100 to avoid SQLite limits
    for (let j = 0; j < recs.length; j += 100) {
      await db.attendance.createMany({ data: recs.slice(j, j + 100) })
    }
    attCount += recs.length
  }
  console.log(`  inserted ${attCount} attendance records`)

  console.log("Generating character assessments (3 per student)...")
  let charCount = 0
  for (let i = 0; i < students.length; i++) {
    const recs = generateCharacter(students[i].id, i + 1)
    await db.characterAssessment.createMany({ data: recs })
    charCount += recs.length
  }
  console.log(`  inserted ${charCount} character assessments`)

  console.log("Generating merit/demerit records...")
  const meritRecs = generateMeritRecords(students.map((s) => s.id))
  await db.meritRecord.createMany({ data: meritRecs })
  console.log(`  inserted ${meritRecs.length} merit/demerit records`)

  console.log("Generating 8 duty reports...")
  const dutyReports = generateDutyReports()
  await db.dutyReport.createMany({ data: dutyReports })

  console.log("Generating 6 programs with participants...")
  await db.program.createMany({ data: programs })
  // Assign random participants to programs
  const rand = pseudoRandom(7)
  const participantRows: any[] = []
  programs.forEach((p, pi) => {
    // ~15-25 participants per program
    const num = 15 + Math.floor(rand() * 10)
    const chosen = new Set<number>()
    for (let i = 0; i < num; i++) {
      const idx = Math.floor(rand() * students.length)
      if (chosen.has(idx)) continue
      chosen.add(idx)
      participantRows.push({
        programId: p.id,
        studentId: students[idx].id,
      })
    }
  })
  await db.programParticipant.createMany({ data: participantRows })
  console.log(`  inserted ${participantRows.length} program participants`)

  // Initial audit log entry
  await db.auditLog.create({
    data: {
      userId: "U001",
      username: "superadmin",
      action: "SEED_DATA",
      entity: "system",
      entityId: "seed",
      detail: "Pangkalan data dummy dimulakan semula dengan data PRD v1.2.",
    },
  })

  console.log("Seed complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
