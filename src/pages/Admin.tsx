import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  LogOut,
  LayoutDashboard,
  Scissors,
  Users,
  Image as ImageIcon,
  MessageSquare,
  Settings as SettingsIcon,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  RefreshCw,
  Sparkles,
  Phone,
} from "lucide-react";
import {
  api,
  type Booking,
  type Service,
  type TeamMember,
  type GalleryItem,
  type Message,
  type Settings,
} from "../lib/api";

const TOKEN_KEY = "glow_admin_token";

function useList<T>(load: (token: string) => Promise<T[]>, token: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    load(token)
      .then(setItems)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [load, token]);
  useEffect(() => reload(), [reload]);
  return { items, setItems, loading, reload };
}

const inputCls =
  "w-full rounded-lg border border-blush bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
const labelCls = "mb-1 block text-xs font-medium text-ink-soft";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

/* ------------------------------ Login ------------------------------ */
function Login({ onLogin }: { onLogin: (t: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token } = await api.login(password);
      localStorage.setItem(TOKEN_KEY, token);
      onLogin(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wrong password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-3xl border border-blush bg-white p-8 shadow-xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white">
          <Sparkles className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-center font-display text-2xl font-semibold text-ink">Admin Login</h1>
        <p className="mt-1 text-center text-sm text-ink-soft">Sign in to manage your salon</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Password">
            <input
              type="password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
            />
          </Field>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------ Dashboard ------------------------------ */
function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab] = useState("bookings");
  const tabs = [
    { id: "bookings", label: "Bookings", icon: LayoutDashboard },
    { id: "services", label: "Services", icon: Scissors },
    { id: "team", label: "Team", icon: Users },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-blush bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-base font-semibold text-ink">Salon Admin</p>
              <p className="text-[11px] text-ink-soft">Manage your website</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#/"
              className="hidden text-sm text-ink-soft transition hover:text-brand sm:block"
            >
              View site
            </a>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 rounded-full border border-blush px-4 py-2 text-sm font-medium text-ink transition hover:bg-blush"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === t.id ? "bg-brand text-white" : "text-ink-soft hover:bg-blush"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {tab === "bookings" && <Bookings token={token} />}
        {tab === "services" && <Services token={token} />}
        {tab === "team" && <Team token={token} />}
        {tab === "gallery" && <Gallery token={token} />}
        {tab === "messages" && <Messages token={token} />}
        {tab === "settings" && <Settings token={token} />}
      </main>
    </div>
  );
}

/* ------------------------------ Bookings ------------------------------ */
function Bookings({ token }: { token: string }) {
  const { items, loading, reload } = useList<Booking>(api.getBookings, token);

  const counts = {
    total: items.length,
    pending: items.filter((b) => b.status === "pending").length,
    confirmed: items.filter((b) => b.status === "confirmed").length,
  };

  const badge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      confirmed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-600",
    };
    return `inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] || ""}`;
  };

  async function updateStatus(id: number, status: string) {
    await api.updateBooking(token, id, status);
    reload();
  }
  async function remove(id: number) {
    if (!confirm("Delete this booking?")) return;
    await api.deleteBooking(token, id);
    reload();
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="Total" value={counts.total} tone="bg-white" />
        <StatCard label="Pending" value={counts.pending} tone="bg-amber-50 text-amber-700" />
        <StatCard label="Confirmed" value={counts.confirmed} tone="bg-green-50 text-green-700" />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Appointments</h2>
        <button onClick={reload} className="flex items-center gap-2 text-sm text-ink-soft hover:text-brand">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-ink-soft">Loading…</p>
      ) : items.length === 0 ? (
        <Empty text="No bookings yet — they'll appear here when customers book." />
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((b) => (
            <div key={b.id} className="rounded-2xl border border-blush bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink">{b.name}</p>
                    <span className={badge(b.status)}>{b.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {b.service_name || "General visit"} · {b.date} at {b.time}
                  </p>
                  {b.notes && <p className="mt-1 text-xs text-ink-soft">"{b.notes}"</p>}
                </div>
                <div className="text-right text-sm text-ink-soft">
                  <p className="flex items-center justify-end gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {b.phone}
                  </p>
                  {b.email && <p className="mt-0.5 text-xs">{b.email}</p>}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {b.status !== "confirmed" && (
                  <button onClick={() => updateStatus(b.id, "confirmed")} className="btn-sm bg-green-600 text-white hover:bg-green-700">
                    <Check className="h-3.5 w-3.5" /> Confirm
                  </button>
                )}
                {b.status !== "cancelled" && (
                  <button onClick={() => updateStatus(b.id, "cancelled")} className="btn-sm bg-red-100 text-red-600 hover:bg-red-200">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                )}
                <button onClick={() => remove(b.id)} className="btn-sm bg-blush text-ink-soft hover:bg-brand-light/30">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-2xl border border-blush p-5 ${tone}`}>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-soft">{label}</p>
    </div>
  );
}

/* ------------------------------ Services ------------------------------ */
function Services({ token }: { token: string }) {
  const { items, loading, reload } = useList<Service>(api.getServices, token);
  const [editing, setEditing] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const empty = { name: "", description: "", price: "", duration: "", icon: "sparkles", category: "", sort_order: "" };
  const [form, setForm] = useState(empty);

  const icons = ["scissors", "palette", "droplets", "sparkles", "brush", "flower", "hand", "gem"];

  function openNew() {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  }
  function openEdit(s: Service) {
    setEditing(s);
    setForm({ name: s.name, description: s.description, price: String(s.price), duration: String(s.duration), icon: s.icon, category: s.category, sort_order: String(s.sort_order) });
    setShowForm(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price) || 0,
      duration: Number(form.duration) || 30,
      icon: form.icon,
      category: form.category,
      sort_order: Number(form.sort_order) || 0,
    };
    if (editing) await api.updateService(token, editing.id, payload);
    else await api.createService(token, payload);
    setShowForm(false);
    reload();
  }
  async function remove(id: number) {
    if (!confirm("Delete this service?")) return;
    await api.deleteService(token, id);
    reload();
  }

  return (
    <CrudShell
      title="Services"
      onAdd={openNew}
      showForm={showForm}
      onCancel={() => setShowForm(false)}
      onSubmit={save}
      editing={editing?.name}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name *"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Category"><input className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Hair / Makeup / Skin…" /></Field>
        <div className="sm:col-span-2">
          <Field label="Description"><textarea className={inputCls} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        </div>
        <Field label="Price (PKR)"><input type="number" className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
        <Field label="Duration (minutes)"><input type="number" className={inputCls} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></Field>
        <Field label="Icon">
          <select className={inputCls} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
            {icons.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </Field>
        <Field label="Sort order"><input type="number" className={inputCls} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></Field>
      </div>
      <ListArea loading={loading} empty={items.length === 0} emptyText="No services yet">
        <div className="space-y-2">
          {items.map((s) => (
            <Row key={s.id} title={`${s.name} · Rs ${s.price.toLocaleString()}`} subtitle={`${s.duration} min · ${s.category || "—"}`} onEdit={() => openEdit(s)} onDelete={() => remove(s.id)} />
          ))}
        </div>
      </ListArea>
    </CrudShell>
  );
}

/* ------------------------------ Team ------------------------------ */
function Team({ token }: { token: string }) {
  const { items, loading, reload } = useList<TeamMember>(api.getTeam, token);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [showForm, setShowForm] = useState(false);
  const empty = { name: "", role: "", bio: "", photo: "", sort_order: "" };
  const [form, setForm] = useState(empty);

  function openNew() {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  }
  function openEdit(m: TeamMember) {
    setEditing(m);
    setForm({ name: m.name, role: m.role, bio: m.bio, photo: m.photo, sort_order: String(m.sort_order) });
    setShowForm(true);
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    const payload = { name: form.name, role: form.role, bio: form.bio, photo: form.photo, sort_order: Number(form.sort_order) || 0 };
    if (editing) await api.updateTeam(token, editing.id, payload);
    else await api.createTeam(token, payload);
    setShowForm(false);
    reload();
  }
  async function remove(id: number) {
    if (!confirm("Delete this team member?")) return;
    await api.deleteTeam(token, id);
    reload();
  }

  return (
    <CrudShell title="Team members" onAdd={openNew} showForm={showForm} onCancel={() => setShowForm(false)} onSubmit={save} editing={editing?.name}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name *"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Role"><input className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Field>
        <div className="sm:col-span-2">
          <Field label="Bio"><textarea className={inputCls} rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Photo URL"><input className={inputCls} value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="https://…" /></Field>
        </div>
        <Field label="Sort order"><input type="number" className={inputCls} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></Field>
      </div>
      <ListArea loading={loading} empty={items.length === 0} emptyText="No team members yet">
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-blush bg-white p-3">
              <img src={m.photo} alt={m.name} className="h-12 w-12 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{m.name}</p>
                <p className="truncate text-xs text-ink-soft">{m.role}</p>
              </div>
              <IconBtn onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></IconBtn>
              <IconBtn onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></IconBtn>
            </div>
          ))}
        </div>
      </ListArea>
    </CrudShell>
  );
}

/* ------------------------------ Gallery ------------------------------ */
function Gallery({ token }: { token: string }) {
  const { items, loading, reload } = useList<GalleryItem>(api.getGallery, token);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const empty = { title: "", category: "", image: "", sort_order: "" };
  const [form, setForm] = useState(empty);

  function openNew() {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  }
  function openEdit(g: GalleryItem) {
    setEditing(g);
    setForm({ title: g.title, category: g.category, image: g.image, sort_order: String(g.sort_order) });
    setShowForm(true);
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    const payload = { title: form.title, category: form.category, image: form.image, sort_order: Number(form.sort_order) || 0 };
    if (editing) await api.updateGallery(token, editing.id, payload);
    else await api.createGallery(token, payload);
    setShowForm(false);
    reload();
  }
  async function remove(id: number) {
    if (!confirm("Delete this gallery image?")) return;
    await api.deleteGallery(token, id);
    reload();
  }

  return (
    <CrudShell title="Gallery" onAdd={openNew} showForm={showForm} onCancel={() => setShowForm(false)} onSubmit={save} editing={editing?.title}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title"><input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Category"><input className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
        <div className="sm:col-span-2">
          <Field label="Image URL *"><input className={inputCls} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" /></Field>
        </div>
        <Field label="Sort order"><input type="number" className={inputCls} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></Field>
      </div>
      <ListArea loading={loading} empty={items.length === 0} emptyText="No gallery images yet">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((g) => (
            <div key={g.id} className="group relative overflow-hidden rounded-2xl border border-blush">
              <img src={g.image} alt={g.title || "gallery"} className="aspect-[4/3] w-full object-cover" />
              <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-ink/80 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                <p className="text-xs font-medium text-white">{g.title}</p>
                <div className="flex gap-1">
                  <IconBtn onClick={() => openEdit(g)}><Pencil className="h-3.5 w-3.5" /></IconBtn>
                  <IconBtn onClick={() => remove(g.id)}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ListArea>
    </CrudShell>
  );
}

/* ------------------------------ Messages ------------------------------ */
function Messages({ token }: { token: string }) {
  const { items, loading, reload } = useList<Message>(api.getMessages, token);

  async function remove(id: number) {
    if (!confirm("Delete this message?")) return;
    await api.deleteMessage(token, id);
    reload();
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">Messages</h2>
      {loading ? (
        <p className="mt-6 text-sm text-ink-soft">Loading…</p>
      ) : items.length === 0 ? (
        <Empty text="No messages yet." />
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((m) => (
            <div key={m.id} className="rounded-2xl border border-blush bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{m.name}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {m.phone || ""} {m.email ? `· ${m.email}` : ""}
                  </p>
                </div>
                <button onClick={() => remove(m.id)} className="btn-sm bg-blush text-ink-soft hover:bg-brand-light/30">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Settings ------------------------------ */
function Settings({ token }: { token: string }) {
  const [settings, setSettings] = useState<Settings>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  const set = (k: string, v: string) => setSettings((s) => ({ ...s, [k]: v }));

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.saveSettings(token, settings);
      setSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const keys: { key: keyof Settings; label: string }[] = [
    { key: "salon_name", label: "Salon name" },
    { key: "tagline", label: "Tagline" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "hours", label: "Opening hours" },
    { key: "instagram", label: "Instagram URL" },
    { key: "facebook", label: "Facebook URL" },
  ];

  return (
    <form onSubmit={save} className="max-w-2xl">
      <h2 className="font-display text-xl font-semibold text-ink">Salon settings</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {keys.map((k) => (
          <Field key={k.key} label={k.label}>
            <input className={inputCls} value={settings[k.key] || ""} onChange={(e) => set(k.key, e.target.value)} />
          </Field>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved ✓</span>}
      </div>
    </form>
  );
}

/* ------------------------------ Shared UI ------------------------------ */
function CrudShell({
  title,
  onAdd,
  showForm,
  onCancel,
  onSubmit,
  editing,
  children,
}: {
  title: string;
  onAdd: () => void;
  showForm: boolean;
  onCancel: () => void;
  onSubmit: (e: FormEvent) => void;
  editing?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        <button onClick={onAdd} className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="mt-4 rounded-3xl border border-brand-light/50 bg-white p-6">
          <p className="mb-4 text-sm font-medium text-brand">{editing ? `Editing: ${editing}` : "New item"}</p>
          {children}
          <div className="mt-5 flex gap-3">
            <button type="submit" className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark">
              Save
            </button>
            <button type="button" onClick={onCancel} className="rounded-full border border-blush px-6 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-blush">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && <div className="mt-4">{children}</div>}
    </div>
  );
}

function ListArea({
  loading,
  empty,
  emptyText,
  children,
}: {
  loading: boolean;
  empty: boolean;
  emptyText: string;
  children: ReactNode;
}) {
  if (loading) return <p className="mt-6 text-sm text-ink-soft">Loading…</p>;
  if (empty) return <Empty text={emptyText} />;
  return <>{children}</>;
}

function Row({ title, subtitle, onEdit, onDelete }: { title: string; subtitle: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-blush bg-white p-4">
      <div className="min-w-0">
        <p className="truncate font-medium text-ink">{title}</p>
        <p className="truncate text-xs text-ink-soft">{subtitle}</p>
      </div>
      <div className="flex gap-1">
        <IconBtn onClick={onEdit}><Pencil className="h-4 w-4" /></IconBtn>
        <IconBtn onClick={onDelete}><Trash2 className="h-4 w-4" /></IconBtn>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-blush hover:text-brand" aria-label="action">
      {children}
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-brand-light/50 bg-white p-10 text-center text-sm text-ink-soft">
      {text}
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) || "");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      setChecking(false);
      return;
    }
    api
      .verify(t)
      .then(() => setToken(t))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-ink-soft">
        Loading…
      </div>
    );
  }

  if (!token) return <Login onLogin={setToken} />;

  return (
    <Dashboard
      token={token}
      onLogout={() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
      }}
    />
  );
}
