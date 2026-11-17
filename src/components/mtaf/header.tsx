"use client";

import Image from "next/image";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Shield,
  Home,
  CalendarCheck,
  LayoutDashboard,
  Users,
  ClipboardList,
  Award,
  FileText,
  FolderKanban,
  ScrollText,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

const adminNavItems = [
  { view: "admin-dashboard", label: "Papan Pemuka", icon: LayoutDashboard },
  { view: "admin-students", label: "Pelajar", icon: Users },
  { view: "admin-attendance", label: "Kedatangan", icon: CalendarCheck },
  { view: "admin-character", label: "Sahsiah", icon: ClipboardList },
  { view: "admin-merit", label: "Merit/Demerit", icon: Award },
  { view: "admin-duty-reports", label: "Laporan Bertugas", icon: FileText },
  { view: "admin-programs", label: "Program", icon: FolderKanban },
  { view: "admin-audit", label: "Log Audit", icon: ScrollText },
] as const;

export function Header() {
  const {
    view,
    setView,
    adminUser,
    logout,
  } = useStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <button
          onClick={() => setView("home")}
          className="flex items-center gap-3 rounded-lg p-1 transition hover:opacity-80"
          aria-label="Laman Utama"
        >
          <Image
            src="/logo-mtaf.svg"
            alt="Logo Madrasah Tahfiz Al Furqan"
            width={44}
            height={44}
            className="shrink-0"
          />
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-sm font-bold text-primary">
              Madrasah Tahfiz Al Furqan
            </div>
            <div className="text-xs text-muted-foreground">
              Sistem Laporan Disiplin Pelajar
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          <Button
            variant={view === "home" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("home")}
            className="h-10"
          >
            <Home className="size-4" />
            <span className="hidden sm:inline">Utama</span>
          </Button>
          <Button
            variant={view === "programs" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("programs")}
            className="h-10"
          >
            <FolderKanban className="size-4" />
            <span className="hidden sm:inline">Program</span>
          </Button>
          <Button
            variant={view === "duty-reports" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("duty-reports")}
            className="h-10"
          >
            <FileText className="size-4" />
            <span className="hidden sm:inline">Guru Bertugas</span>
          </Button>
          <Button
            variant={view === "visi-misi" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("visi-misi")}
            className="h-10"
          >
            <Shield className="size-4" />
            <span className="hidden sm:inline">Visi & Misi</span>
          </Button>

          {adminUser && adminUser.role ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {adminUser.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {adminUser.name || adminUser.username}
                  </span>
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{adminUser.name || adminUser.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {roleLabel(adminUser.role)}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {adminNavItems.map((item) => (
                  <DropdownMenuItem
                    key={item.view}
                    onClick={() => setView(item.view)}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await apiPost("/api/admin/logout", {});
                    } catch {
                      /* ignore */
                    }
                    logout();
                    toast.success("Anda telah log keluar");
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  Log Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => setView("admin-login")}
              className="h-10"
            >
              <Shield className="size-4" />
              <span>Pentadbir</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    superadmin: "Pentadbir Sistem",
    guruKananHEM: "Guru Kanan HEM",
    pengetua: "Pengetua",
    guru: "Guru",
    guruBertugas: "Guru Bertugas",
  };
  return map[role] ?? role;
}
