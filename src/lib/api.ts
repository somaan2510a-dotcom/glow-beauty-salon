export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  icon: string;
  category: string;
  sort_order: number;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  photo: string;
  sort_order: number;
}

export interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image: string;
  sort_order: number;
}

export interface Booking {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  service_id: number | null;
  service_name: string | null;
  date: string;
  time: string;
  notes: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

export interface Message {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  created_at: string;
}

export type Settings = Record<string, string>;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Something went wrong");
  }
  return res.json() as Promise<T>;
}

const json = (method: string, body: unknown, token?: string): RequestInit => ({
  method,
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  body: JSON.stringify(body),
});

export const api = {
  getServices: () => request<Service[]>("/api/services"),
  getTeam: () => request<TeamMember[]>("/api/team"),
  getGallery: () => request<GalleryItem[]>("/api/gallery"),
  getSettings: () => request<Settings>("/api/settings"),

  createBooking: (data: Record<string, unknown>) =>
    request<Booking>("/api/bookings", json("POST", data)),
  createMessage: (data: Record<string, unknown>) =>
    request<Message>("/api/messages", json("POST", data)),

  login: (password: string) =>
    request<{ token: string }>("/api/admin/login", json("POST", { password })),
  verify: (token: string) =>
    request<{ ok: boolean }>("/api/admin/verify", { headers: { Authorization: `Bearer ${token}` } }),

  getBookings: (token: string) =>
    request<Booking[]>("/api/bookings", { headers: { Authorization: `Bearer ${token}` } }),
  updateBooking: (token: string, id: number, status: string) =>
    request<Booking>(`/api/bookings/${id}`, json("PATCH", { status }, token)),
  deleteBooking: (token: string, id: number) =>
    request<{ ok: boolean }>(`/api/bookings/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),

  getMessages: (token: string) =>
    request<Message[]>("/api/messages", { headers: { Authorization: `Bearer ${token}` } }),
  deleteMessage: (token: string, id: number) =>
    request<{ ok: boolean }>(`/api/messages/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),

  saveSettings: (token: string, settings: Record<string, string>) =>
    request<{ ok: boolean }>("/api/settings", json("PUT", settings, token)),

  createService: (token: string, data: Record<string, unknown>) =>
    request<Service>("/api/services", json("POST", data, token)),
  updateService: (token: string, id: number, data: Record<string, unknown>) =>
    request<Service>(`/api/services/${id}`, json("PUT", data, token)),
  deleteService: (token: string, id: number) =>
    request<{ ok: boolean }>(`/api/services/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),

  createTeam: (token: string, data: Record<string, unknown>) =>
    request<TeamMember>("/api/team", json("POST", data, token)),
  updateTeam: (token: string, id: number, data: Record<string, unknown>) =>
    request<TeamMember>(`/api/team/${id}`, json("PUT", data, token)),
  deleteTeam: (token: string, id: number) =>
    request<{ ok: boolean }>(`/api/team/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),

  createGallery: (token: string, data: Record<string, unknown>) =>
    request<GalleryItem>("/api/gallery", json("POST", data, token)),
  updateGallery: (token: string, id: number, data: Record<string, unknown>) =>
    request<GalleryItem>(`/api/gallery/${id}`, json("PUT", data, token)),
  deleteGallery: (token: string, id: number) =>
    request<{ ok: boolean }>(`/api/gallery/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),
};

export function formatPrice(n: number): string {
  return `Rs ${(n || 0).toLocaleString("en-PK")}`;
}
