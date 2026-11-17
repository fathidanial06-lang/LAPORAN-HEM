"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { apiPost } from "@/lib/api";
import { BentoCard } from "@/components/mtaf/bento";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ShieldCheck, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const MAX_ATTEMPTS = 5;
const LOCK_MS = 10 * 60 * 1000;

type Pending = {
  id: string;
  name: string;
  className: string;
  icMasked: string;
};

export function SelectStudentView() {
  const { setView, goStudent, setParentSession } = useStore();
  const [pending, setPending] = useState<Pending | null>(null);
  const [lastFour, setLastFour] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("mtafPendingStudent");
    if (raw) {
      try {
        setPending(JSON.parse(raw) as Pending);
      } catch {
        setView("home");
      }
    } else {
      setView("home");
    }
    const lu = sessionStorage.getItem("mtafLockUntil");
    if (lu) {
      const t = parseInt(lu, 10);
      if (t > Date.now()) setLockedUntil(t);
      else sessionStorage.removeItem("mtafLockUntil");
    }
    const att = sessionStorage.getItem("mtafAttempts");
    if (att) setAttempts(parseInt(att, 10));
  }, [setView]);

  if (!pending) return null;

  const isLocked = lockedUntil !== null && lockedUntil > Date.now();

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!pending) return;
    if (isLocked) {
      toast.error("Carian dikunci. Sila cuba lagi kemudian.");
      return;
    }
    const digits = lastFour.replace(/\D/g, "");
    if (digits.length !== 4) {
      toast.error("Sila masukkan 4 digit terakhir IC");
      return;
    }
    try {
      const r = await apiPost<{ verified: boolean }>(
        "/api/students/verify",
        { studentId: pending.id, lastFour: digits },
      );
      if (r.verified) {
        sessionStorage.removeItem("mtafAttempts");
        sessionStorage.removeItem("mtafLockUntil");
        sessionStorage.removeItem("mtafPendingStudent");
        setParentSession(pending.id);
        toast.success("Pengesahan berjaya");
        goStudent(pending.id);
      } else {
        const next = attempts + 1;
        setAttempts(next);
        sessionStorage.setItem("mtafAttempts", String(next));
        if (next >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCK_MS;
          setLockedUntil(until);
          sessionStorage.setItem("mtafLockUntil", String(until));
          toast.error(
            `Carian dikunci selama 10 minit selepas ${MAX_ATTEMPTS} percubaan gagal.`,
          );
        } else {
          toast.error(
            `Pengesahan gagal. Percubaan tinggal: ${MAX_ATTEMPTS - next}`,
          );
        }
      }
    } catch {
      toast.error("Ralat semasa pengesahan");
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView("home")}
        className="mb-4 h-10"
      >
        <ArrowLeft className="size-4" />
        Kembali
      </Button>
      <BentoCard>
        <div className="flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-7" />
          </span>
          <h2 className="mt-3 text-xl font-bold">Pengesahan Identiti</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sila sahkan 4 digit terakhir No. Kad Pengenalan pelajar.
          </p>
        </div>

        <div className="mt-5 rounded-xl bg-muted/40 p-4">
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama</span>
              <span className="font-medium">{pending.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kelas</span>
              <span className="font-medium">{pending.className}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. IC (sebahagian)</span>
              <span className="font-mono font-medium">{pending.icMasked}</span>
            </div>
          </div>
        </div>

        {isLocked ? (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <Lock className="size-5" />
            <div>
              Carian dikunci selepas {MAX_ATTEMPTS} percubaan gagal. Sila cuba
              semula selepas 10 minit atau hubungi UNIT HEM.
            </div>
          </div>
        ) : (
          <form onSubmit={verify} className="mt-5 space-y-3">
            <div>
              <label
                htmlFor="last4"
                className="mb-1.5 block text-sm font-medium"
              >
                4 Digit Terakhir IC
              </label>
              <Input
                id="last4"
                value={lastFour}
                onChange={(e) =>
                  setLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="Contoh: 1234"
                inputMode="numeric"
                maxLength={4}
                className="h-12 text-center text-lg tracking-widest"
                autoFocus
              />
            </div>
            {attempts > 0 && (
              <div className="flex items-center gap-2 text-xs text-status-orange">
                <AlertTriangle className="size-3.5" />
                Percubaan gagal: {attempts}/{MAX_ATTEMPTS}
              </div>
            )}
            <Button type="submit" size="lg" className="w-full h-12">
              <ShieldCheck className="size-4" />
              Sahkan & Lihat Laporan
            </Button>
          </form>
        )}
      </BentoCard>
    </div>
  );
}
