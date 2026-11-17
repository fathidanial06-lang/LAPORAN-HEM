// Zustand store for view-state navigation
"use client";

import { create } from "zustand";
import type { AdminUser } from "@/lib/api";
import { getAdminUsername } from "@/lib/api";

export type View =
  | "home"
  | "select-student"
  | "student-summary"
  | "student-attendance"
  | "student-character"
  | "student-merit"
  | "duty-reports"
  | "duty-report-detail"
  | "programs"
  | "program-detail"
  | "visi-misi"
  | "admin-login"
  | "admin-dashboard"
  | "admin-students"
  | "admin-attendance"
  | "admin-character"
  | "admin-merit"
  | "admin-duty-reports"
  | "admin-programs"
  | "admin-audit";

type ParentSession = {
  studentId: string;
  expiry: number; // epoch ms
};

type State = {
  view: View;
  selectedStudentId: string | null;
  selectedProgramId: string | null;
  selectedDutyReportId: string | null;
  parentSession: ParentSession | null;
  adminUser: AdminUser | null;
  setView: (v: View) => void;
  goStudent: (id: string) => void;
  goProgram: (id: string) => void;
  goDutyReport: (id: string) => void;
  setParentSession: (studentId: string) => void;
  clearParentSession: () => void;
  setAdminUser: (u: AdminUser | null) => void;
  logout: () => void;
  initAdmin: () => void;
};

const SESSION_MS = 15 * 60 * 1000; // 15 minutes

export const useStore = create<State>((set, get) => ({
  view: "home",
  selectedStudentId: null,
  selectedProgramId: null,
  selectedDutyReportId: null,
  parentSession: null,
  adminUser: null,
  setView: (v) => set({ view: v }),
  goStudent: (id) =>
    set({
      selectedStudentId: id,
      view: "student-summary",
    }),
  goProgram: (id) =>
    set({
      selectedProgramId: id,
      view: "program-detail",
    }),
  goDutyReport: (id) =>
    set({
      selectedDutyReportId: id,
      view: "duty-report-detail",
    }),
  setParentSession: (studentId) =>
    set({ parentSession: { studentId, expiry: Date.now() + SESSION_MS } }),
  clearParentSession: () => set({ parentSession: null }),
  setAdminUser: (u) => set({ adminUser: u }),
  logout: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("mtafAdminUsername");
    }
    set({ adminUser: null, view: "home" });
  },
  initAdmin: () => {
    if (typeof window === "undefined") return;
    const u = getAdminUsername();
    if (u) {
      // Avoid clobbering an already-validated user (idempotent — prevents render loop)
      const current = get().adminUser;
      if (current && current.username === u && current.id) return;
      if (current && current.username === u && !current.id) return;
      // We'll validate via /api/admin/me in the component
      set({ adminUser: { id: "", username: u, role: "", teacherId: null, name: u } });
    }
  },
}));
