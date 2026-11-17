# Laporan UNIT HEM — Madrasah Tahfiz Al Furqan

**Sistem Laporan Disiplin Pelajar** untuk Unit Hal Ehwal Murid (UNIT HEM), Madrasah Tahfiz Al Furqan (MTAF), Malaysia.

Dibina mengikut Dokumen Keperluan Produk (PRD) v1.2 — Fasa 1: Prototaip dengan pangkalan data dummy SQLite.

---

## Ringkasan

Portal web yang membolehkan ibu bapa/penjaga menyemak prestasi disiplin anak mereka di madrasah dengan mudah menggunakan telefon bimbit, serta panel pentadbir UNIT HEM untuk menguruskan semua rekod disiplin pelajar.

### Modul Utama

**Portal Ibu Bapa (Awam)**
- Halaman utama dengan **bento grid** dan kotak carian besar (No. IC atau nama)
- Carian IC 12 digit (auto-format `xxxxxx-xx-xxxx`) → terus buka laporan
- Carian nama → senarai padanan + pengesahan 4 digit akhir IC (kunci selepas 5 percubaan gagal, sesi 15 minit)
- Ringkasan pelajar: profil, peratus kedatangan, gred sahsiah, mata merit/demerit, mata bersih
- 5 tab: Kedatangan (kalendar berwarna + carta Recharts + amaran <85%), Sahsiah (5 aspek + perbandingan), Merit/Demerit (Kes Berat ditopeng), Guru Bertugas, Program
- Laporan guru bertugas mingguan (hanya yang DITERBITKAN)
- Senarai program + galeri gambar (lightbox, lazy-load)
- Halaman Visi & Misi

**Panel Pentadbir UNIT HEM**
- Log masuk dengan kawalan peranan
- Papan pemuka bento grid dengan statistik
- CRUD pelajar, kelas, guru
- Rekod kedatangan harian mengikut kelas
- Borang penilaian sahsiah (5 slider 1-5)
- Rekod merit/demerit (Kes Berat hanya oleh Guru Kanan HEM/Pengetua)
- Aliran laporan bertugas: DRAF → MENUNGGU → DIKEMBALIKAN/DILULUSKAN → DITERBITKAN
- CRUD program + amaran kebenaran gambar ibu bapa
- Jejak audit lengkap

---

## Teknologi

| Lapisan | Teknologi |
|---|---|
| Rangka kerja | Next.js 16 (App Router) |
| Bahasa | TypeScript 5 |
| Gaya | Tailwind CSS 4 + shadcn/ui |
| Pangkalan data | Prisma ORM + PostgreSQL (Supabase) — SQLite fallback untuk prototaip |
| Pengurusan keadaan | Zustand (client), TanStack Query (server) |
| Carta | Recharts |
| Borang | React Hook Form + Zod |
| Ikon | lucide-react |

---

## Persediaan & Penggunaan

### Keperluan
- Node.js 18+ atau Bun
- **Pangkalan data**: Supabase (PostgreSQL) — disyorkan untuk pengeluaran. Lihat [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) untuk panduan lengkap. SQLite juga disokong untuk prototaip pantas.

### Pemasangan (Supabase — disyorkan)

```bash
# Pasang dependencies
bun install

# Salin .env.example ke .env dan tetapkan DATABASE_URL Supabase anda
cp .env.example .env
# Edit .env: DATABASE_URL=postgresql://postgres:[PWD]@db.[REF].supabase.co:5432/postgres

# Cipta skema dalam Supabase
bun run db:push

# Jana Prisma Client
bun run db:generate

# Isi pangkalan data dengan data dummy PRD
bun run seed
```

> Jika port 5432 disekat di rangkaian anda, gunakan **Session pooler** (lihat `.env.example`) atau jalankan `prisma/migrations/0001_init.sql` terus di **Supabase SQL Editor**. Butiran penuh di [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).

### Pemasangan (SQLite — prototaip pantas)

```bash
bun install
# Tukar provider dalam prisma/schema.prisma kepada "sqlite"
# Tetapkan DATABASE_URL=file:./db/custom.db dalam .env
bun run db:push
bun run seed
```

### Menjalankan pembangunan

```bash
bun run dev
```

Buka `http://localhost:3000` dalam pelayar.

### Skrip berguna

```bash
bun run lint       # semakan kualiti kod
bun run db:push    # push skema ke pangkalan data
bun run db:generate # jana Prisma Client
bun run seed       # isi data dummy
```

---

## Akaun Demo Pentadbir

| Peranan | Nama Pengguna | Kata Laluan |
|---|---|---|
| Super Admin UNIT HEM | `superadmin` | `superadmin123` |
| Guru Kanan HEM | `guruKananHEM` | `hem12345` |
| Pengetua | `pengetua` | `pengetua123` |
| Guru | `guru` | `guru123` |
| Guru Bertugas | `guruBertugas` | `tugas123` |

> Notis: Kata laluan disimpan sebagai `plain:PASSWORD` dalam pangkalan data dummy (prototaip Fasa 1 sahaja). Pada Fasa 2, kata laluan akan di-hash dengan bcrypt/argon2 mengikut PRD §8.2.

## Pelajar Demo

| No. IC | Nama |
|---|---|
| `130412101234` | MUHAMMAD AIMAN BIN AHMAD (S0001) |

Carian nama `aiman` → sahkan dengan 4 digit akhir `1234`.

---

## Struktur Data Dummy

- **30 pelajar** (nama Melayu rekaan, IC 12 digit rekaan)
- **4 kelas** (1-4 tahun)
- **6 guru** + **5 pengguna pentadbir**
- **~1,500 rekod kedatangan** (Sept–Nov 2026)
- **90 penilaian sahsiah** (3 bulan setiap pelajar)
- **119 rekod merit/demerit** (termasuk Kes Berat)
- **8 laporan guru bertugas mingguan**
- **6 program** dengan 66 gambar galeri placeholder SVG

---

## Identiti Visual (PRD §9.2)

| Elemen | Spesifikasi |
|---|---|
| Warna utama | Teal `#0E7C8F`, cyan `#00B4CC` |
| Warna aksen | Kuning `#FFE600` |
| Warna neutral | Hitam `#1F2937`, latar `#F3F4F6` |
| Status | Hijau `#16A34A`, Kuning `#F59E0B`, Merah `#DC2626`, Biru `#2563EB`, Jingga `#EA580C` |
| Fon | Geist Sans (Poppins/Inter alternatif) |

---

## Privasi & PDPA (PRD §8)

- IC dipaparkan separa (contoh: `xxxxxx-xx-**34`)
- Pengesahan 4 digit akhir IC untuk carian nama
- Had percubaan + kunci sementara selepas 5 kegagalan
- Kes Berat ditopeng kepada ibu bapa (hanya kategori umum + tahap)
- Laporan umum tidak menyebut nama pelajar lain
- Notis privasi pada pengaki setiap halaman

---

## Seni Bina

```
src/
├── app/
│   ├── api/              # 29 REST endpoints (parent + admin)
│   ├── layout.tsx        # Root layout + metadata + Providers
│   └── page.tsx          # Single route, renders <AppShell />
├── components/
│   ├── mtaf/             # MTAF-specific (layout, parent, admin)
│   └── ui/               # shadcn/ui primitives
├── lib/
│   ├── db.ts             # Prisma client
│   ├── auth.ts           # Admin session helpers
│   ├── audit.ts          # Audit log helper
│   ├── api.ts            # Fetch wrapper
│   ├── store.ts          # Zustand view-state navigation
│   ├── format.ts         # IC masking, date formatting
│   └── roles.ts          # Role permission helpers
prisma/
├── schema.prisma         # 12 models
└── seed.ts               # PRD-compliant dummy data
```

---

## Pematuhan PRD

Dibina mengikut PRD v1.2 (UNIT HEM MTAF):
- 6 modul fungsian (A–H) + Panel Pentadbir (I)
- Penyorokan data sensitif (Kes Berat, IC, telefon penjaga)
- Aliran kelulusan laporan bertugas oleh Guru Kanan HEM/Pengetua
- Mata demerit lalai: Ringan -2, Sederhana -5, Berat -15
- Tahap tindakan: 0-14 Hijau, 15-29 Kuning, 30-49 Jingga, 50+ Merah
- Kedatangan: TH_BERSEBAB dikira hadir
- Sahsiah: 5 aspek (akhlak, ibadah, tanggungjawab, kebersihan, kerjasama), skala 1-5
- 15 kategori merit + 15 Ringan + 14 Sederhana + 15 Berat

---

## Lesen

Hak cipta © UNIT HEM, Madrasah Tahfiz Al Furqan. Untuk kegunaan dalaman madrasah.

## Status

**Fasa 1: Prototaip** — data dummy SQLite. Fasa 2 akan menggunakan pangkalan data sebenar (PostgreSQL/Supabase) dan API pelayan.
