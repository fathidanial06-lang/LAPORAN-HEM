# Setup Pangkalan Data Supabase (PostgreSQL)

Laporan UNIT HEM menyokong Supabase (PostgreSQL) sebagai pangkalan data pengeluaran. Ikuti langkah berikut untuk menggunakan Supabase.

## Langkah 1: Dapatkan maklumat sambungan

Dari **Supabase Dashboard → Project Settings → Database**:
- **Project URL**: `https://[PROJECT_REF].supabase.co`
- **Database password**: kata laluan yang anda tetapkan semasa cipta projek
- **Connection string** (Direct atau Pooler)

## Langkah 2: Konfigurasi `.env`

Salin `.env.example` ke `.env` dan pilih salah satu URL sambungan:

```bash
cp .env.example .env
```

### Pilih jenis sambungan

| Jenis | Bila digunakan | Format URL |
|---|---|---|
| **Direct** (IPv6, port 5432) | Pelayan dengan akses IPv6 keluar | `postgresql://postgres:[PWD]@db.[REF].supabase.co:5432/postgres` |
| **Session pooler** (IPv4, port 5432) | Serverless / Next.js — disyorkan | `postgresql://postgres.[REF]:[PWD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1` |
| **Transaction pooler** (IPv4, port 6543) | Edge functions | `postgresql://postgres.[REF]:[PWD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` |

> Untuk Next.js dev/production, **Session pooler** paling stabil.

## Langkah 3: Cipta skema (dua pilihan)

### Pilihan A — Dengan Prisma (disyorkan)

```bash
bun run db:push     # cipta semua jadual daripada prisma/schema.prisma
bun run db:generate # jana Prisma Client
```

### Pilihan B — Dengan SQL Editor (jika port 5432 disekat)

1. Buka **Supabase Dashboard → SQL Editor → New query**
2. Salin kandungan `prisma/migrations/0001_init.sql` (256 baris DDL)
3. Klik **Run** — semua 12 jadual akan dicipta dalam schema `public`

## Langkah 4: Isi data dummy PRD

```bash
bun run seed
```

Skrip ini akan isi:
- 1 SchoolInfo singleton
- 4 ClassRoom, 6 Teacher, 5 User (pentadbir)
- 30 Student (nama Melayu rekaan + IC 12 digit)
- ~1,500 Attendance (Sept–Nov 2026)
- 90 CharacterAssessment (3 bulan setiap pelajar)
- 119 MeritRecord + 60 MeritCategory
- 8 DutyReport
- 6 Program + 77 ProgramParticipant
- AuditLog permulaan

Untuk set semula data: jalankan `bun run seed` lagi (skrip akan padam + isi semula).

## Langkah 5: Sahkan

```bash
bun run dev
```

Buka http://localhost:3000. Log masuk pentadbir dengan `superadmin / superadmin123` untuk mengesahkan data dimuatkan dengan betul.

Anda juga boleh menyemak data terus di **Supabase Dashboard → Table Editor**.

## Penyelesaian masalah

### `Can't reach database server at ...:5432`
- Rangkaian anda menyekat port 5432. Guna **Session pooler** di port 5432 IPv4 (lihat Langkah 2) ATAU guna SQL Editor (Pilihan B di Langkah 3).
- Jika anda berada di IPv6-only network, pastikan `db.[REF].supabase.co` boleh diakses (ia adalah rekod IPv6).

### `P1001: Can't reach database server`
- Pastikan URL tidak mempunyai aksara khas tanpa pengekodan. Password dengan `_` selalunya OK, tetapi password dengan `@`, `:`, `/`, `#` perlu di-URL-encode.
- Untuk pooler, pastikan `?pgbouncer=true&connection_limit=1` ditambah.

### `relation "Student" does not exist`
- Skema belum dicipta. Jalankan Langkah 3 dahulu.
