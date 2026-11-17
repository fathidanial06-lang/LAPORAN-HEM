import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/mtaf/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Laporan UNIT HEM | Madrasah Tahfiz Al Furqan",
  description:
    "Laporan UNIT HEM Madrasah Tahfiz Al Furqan - pantau kedatangan, sahsiah, merit/demerit dan program anak anda.",
  keywords: [
    "Madrasah Tahfiz Al Furqan",
    "MTAF",
    "UNIT HEM",
    "laporan disiplin",
    "HEM",
    "laporan",
  ],
  authors: [{ name: "UNIT HEM MTAF" }],
  icons: {
    icon: "/logo-mtaf.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
