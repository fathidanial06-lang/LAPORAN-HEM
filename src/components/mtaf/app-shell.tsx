"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Header } from "@/components/mtaf/header";
import { Footer } from "@/components/mtaf/footer";
import { HomeView } from "@/components/mtaf/parent/home-view";
import { SelectStudentView } from "@/components/mtaf/parent/select-student-view";
import { StudentSummaryView } from "@/components/mtaf/parent/student-summary-view";
import { ProgramsView } from "@/components/mtaf/parent/programs-view";
import { ProgramDetailView } from "@/components/mtaf/parent/program-detail-view";
import {
  DutyReportsView,
  DutyReportDetailView,
} from "@/components/mtaf/parent/duty-reports-view";
import { VisiMisiView } from "@/components/mtaf/parent/visi-misi-view";
import { AdminLoginView } from "@/components/mtaf/admin/admin-login-view";
import { AdminDashboardView } from "@/components/mtaf/admin/admin-dashboard-view";
import { AdminStudentsView } from "@/components/mtaf/admin/admin-students-view";
import { AdminAttendanceView } from "@/components/mtaf/admin/admin-attendance-view";
import { AdminCharacterView } from "@/components/mtaf/admin/admin-character-view";
import { AdminMeritView } from "@/components/mtaf/admin/admin-merit-view";
import { AdminDutyReportsView } from "@/components/mtaf/admin/admin-duty-reports-view";
import { AdminProgramsView } from "@/components/mtaf/admin/admin-programs-view";
import { AdminAuditView } from "@/components/mtaf/admin/admin-audit-view";

export function AppShell() {
  const { view, adminUser, setAdminUser, initAdmin, parentSession } = useStore();

  // Restore admin session on mount only (avoid re-render loop)
  useEffect(() => {
    initAdmin();
    const u = localStorage.getItem("mtafAdminUsername");
    if (u && !useStore.getState().adminUser?.role) {
      api<{ user: typeof adminUser } | { user: null }>(
        "/api/admin/me",
      )
        .then((r) => {
          if (r && "user" in r && r.user) {
            setAdminUser(r.user);
          } else {
            localStorage.removeItem("mtafAdminUsername");
          }
        })
        .catch(() => {
          localStorage.removeItem("mtafAdminUsername");
        });
    }
  }, []);

  // Parent session expiry check
  useEffect(() => {
    if (parentSession && parentSession.expiry < Date.now()) {
      useStore.getState().clearParentSession();
    }
  }, [parentSession]);

  const isAdminView = view.startsWith("admin-") && view !== "admin-login";

  // Block admin views if not authenticated
  const renderView = () => {
    if (isAdminView && !adminUser?.role) {
      return <AdminLoginView />;
    }
    switch (view) {
      case "home":
        return <HomeView />;
      case "select-student":
        return <SelectStudentView />;
      case "student-summary":
      case "student-attendance":
      case "student-character":
      case "student-merit":
        // all render the summary view (tabs inside)
        return <StudentSummaryView />;
      case "programs":
        return <ProgramsView />;
      case "program-detail":
        return <ProgramDetailView />;
      case "duty-reports":
        return <DutyReportsView />;
      case "duty-report-detail":
        return <DutyReportDetailView />;
      case "visi-misi":
        return <VisiMisiView />;
      case "admin-login":
        return adminUser?.role ? <AdminDashboardView /> : <AdminLoginView />;
      case "admin-dashboard":
        return <AdminDashboardView />;
      case "admin-students":
        return <AdminStudentsView />;
      case "admin-attendance":
        return <AdminAttendanceView />;
      case "admin-character":
        return <AdminCharacterView />;
      case "admin-merit":
        return <AdminMeritView />;
      case "admin-duty-reports":
        return <AdminDutyReportsView />;
      case "admin-programs":
        return <AdminProgramsView />;
      case "admin-audit":
        return <AdminAuditView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
}
