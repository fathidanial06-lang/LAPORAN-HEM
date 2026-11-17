"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { apiPost, setAdminUsername } from "@/lib/api";
import { BentoCard } from "@/components/mtaf/bento";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  ArrowLeft,
  KeyRound,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";

const DEMO = [
  { username: "superadmin", password: "superadmin123", role: "Pentadbir Sistem" },
  { username: "guruKananHEM", password: "hem12345", role: "Guru Kanan HEM" },
  { username: "pengetua", password: "pengetua123", role: "Pengetua" },
  { username: "guru", password: "guru123", role: "Guru" },
  { username: "guruBertugas", password: "tugas123", role: "Guru Bertugas" },
];

export function AdminLoginView() {
  const { setAdminUser, setView } = useStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Sila masukkan nama pengguna dan kata laluan");
      return;
    }
    setLoading(true);
    try {
      const r = await apiPost<{ user: { id: string; username: string; role: string; teacherId: string | null; name: string } }>(
        "/api/admin/login",
        { username, password },
      );
      setAdminUsername(r.user.username);
      setAdminUser(r.user);
      toast.success(`Selamat datang, ${r.user.name}`);
      setView("admin-dashboard");
    } catch (err) {
      toast.error((err as Error).message || "Log masuk gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Button variant="ghost" size="sm" onClick={() => setView("home")} className="mb-4 h-10">
        <ArrowLeft className="size-4" />
        Laman Utama
      </Button>
      <BentoCard>
        <div className="flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Shield className="size-7" />
          </span>
          <h2 className="mt-3 text-xl font-bold">Log Masuk Pentadbir</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Untuk guru dan pentadbir Madrasah Tahfiz Al Furqan.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="username">Nama Pengguna</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Kata Laluan</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="h-11"
            />
          </div>
          <Button type="submit" disabled={loading} size="lg" className="w-full h-11">
            <LogIn className="size-4" />
            {loading ? "Sedang log masuk..." : "Log Masuk"}
          </Button>
        </form>
      </BentoCard>

      <Card className="mt-4 bg-muted/30">
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center gap-2">
            <KeyRound className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Akaun Demo</h3>
          </div>
          <ul className="space-y-1.5 text-xs">
            {DEMO.map((d) => (
              <li
                key={d.username}
                className="flex items-center justify-between gap-2 rounded-md bg-card px-2.5 py-1.5"
              >
                <span>
                  <span className="font-mono">{d.username}</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="font-mono">{d.password}</span>
                </span>
                <span className="text-muted-foreground">{d.role}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
