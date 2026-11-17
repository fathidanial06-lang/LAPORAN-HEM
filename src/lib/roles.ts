// Shared role constants - safe to import in both server and client code.
export const APPROVAL_ROLES = ["superadmin", "guruKananHEM", "pengetua"];
export const BERAT_ROLES = ["superadmin", "guruKananHEM", "pengetua"];

export const ROLE_LABELS: Record<string, string> = {
  superadmin: "Pentadbir Sistem",
  guruKananHEM: "Guru Kanan HEM",
  pengetua: "Pengetua",
  guru: "Guru",
  guruBertugas: "Guru Bertugas",
};
