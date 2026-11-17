// Generate SVG placeholder images for MTAF logo and program gallery
import fs from "fs"
import path from "path"

const outDir = path.join(process.cwd(), "public", "images", "programs")
fs.mkdirSync(outDir, { recursive: true })

const palettes = [
  ["#00B4CC", "#0E7C8F"],
  ["#0E7C8F", "#1F2937"],
  ["#00B4CC", "#FFE600"],
  ["#0E7C8F", "#16A34A"],
  ["#1F2937", "#00B4CC"],
  ["#0E7C8F", "#2563EB"],
]

const programTitles: Record<string, string> = {
  p001: "Majlis Khatam Al-Quran",
  p002: "Khemah Ibadah",
  p003: "Hari Sukan",
  p004: "Lawatan Muzium",
  p005: "Cinta Masjid",
  p006: "Pertandingan Hafazan",
}

const counts: Record<string, number> = {
  p001: 12, p002: 11, p003: 10, p004: 10, p005: 11, p006: 12,
}

for (const slug of Object.keys(counts)) {
  const total = counts[slug]
  const [c1, c2] = palettes[parseInt(slug.slice(1)) % palettes.length]
  const title = programTitles[slug]
  for (let i = 1; i <= total; i++) {
    const angle = (i * 37) % 360
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="2.5" fill="rgba(255,255,255,0.18)"/>
    </pattern>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <rect width="800" height="600" fill="url(#dots)"/>
  <circle cx="${150 + i * 40}" cy="${420 - i * 5}" r="${60 + i * 4}" fill="rgba(255,255,255,0.12)"/>
  <circle cx="${620 - i * 25}" cy="${130 + i * 6}" r="${40 + i * 3}" fill="rgba(255,255,255,0.10)"/>
  <g transform="translate(60, 480)">
    <rect width="220" height="6" fill="rgba(255,255,255,0.6)"/>
    <text x="0" y="-12" font-family="Poppins, Inter, sans-serif" font-size="22" font-weight="700" fill="white">${title}</text>
    <text x="0" y="34" font-family="Inter, sans-serif" font-size="14" fill="rgba(255,255,255,0.85)">MTAF - Gambar ${i} / ${total}</text>
  </g>
  <text x="740" y="60" text-anchor="end" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="rgba(255,255,255,0.8)">MTAF</text>
</svg>`
    fs.writeFileSync(path.join(outDir, `${slug}-${i}.svg`), svg)
  }
}

const logoDir = path.join(process.cwd(), "public")
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <defs>
    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#00B4CC"/>
      <stop offset="100%" stop-color="#0E7C8F"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="220" height="220" rx="48" fill="url(#lg)"/>
  <rect x="10" y="10" width="220" height="220" rx="48" fill="none" stroke="#FFE600" stroke-width="3"/>
  <g transform="translate(60, 70)" fill="white">
    <path d="M0 30 Q60 -10 120 30 L120 90 Q60 50 0 90 Z"/>
    <path d="M120 30 Q60 -10 0 30 L0 90 Q60 50 120 90 Z" fill="rgba(255,255,255,0.85)"/>
    <rect x="58" y="20" width="4" height="80" fill="#0E7C8F"/>
  </g>
  <text x="120" y="200" text-anchor="middle" font-family="Poppins, Inter, sans-serif" font-size="22" font-weight="800" fill="white">MTAF</text>
</svg>`
fs.writeFileSync(path.join(logoDir, "logo-mtaf.svg"), logoSvg)

console.log("Generated", Object.keys(counts).reduce((a, k) => a + counts[k], 0), "program images + logo")
