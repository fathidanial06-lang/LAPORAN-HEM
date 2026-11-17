// API client helpers used by client components.
// Reads admin username from localStorage for admin endpoints.

export type AdminUser = {
  id: string;
  username: string;
  role: string;
  teacherId: string | null;
  name: string;
};

const LS_KEY = "mtafAdminUsername";

export function setAdminUsername(username: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, username);
}

export function clearAdminUsername() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LS_KEY);
}

export function getAdminUsername(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LS_KEY);
}

export function adminHeaders(): HeadersInit {
  const u = getAdminUsername();
  return u ? { "x-admin-username": u } : {};
}

export async function api<T = unknown>(
  url: string,
  opts: RequestInit = {},
): Promise<T> {
  const headers = new Headers(opts.headers);
  const u = getAdminUsername();
  if (u) headers.set("x-admin-username", u);
  if (opts.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) {
    let msg = `Ralat ${res.status}`;
    try {
      const j = await res.json();
      msg = j.error || j.message || msg;
    } catch {
      // ignore
    }
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function apiPost<T = unknown>(
  url: string,
  body: unknown,
  opts: RequestInit = {},
): Promise<T> {
  return api<T>(url, {
    ...opts,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiPut<T = unknown>(
  url: string,
  body: unknown,
  opts: RequestInit = {},
): Promise<T> {
  return api<T>(url, {
    ...opts,
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T = unknown>(url: string): Promise<T> {
  return api<T>(url, { method: "DELETE" });
}
