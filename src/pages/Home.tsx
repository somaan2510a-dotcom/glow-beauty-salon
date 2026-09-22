import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Scissors,
  Palette,
  Droplets,
  Sparkles,
  Brush,
  Flower,
  Hand,
  Gem,
  Menu,
  X,
  Phone,
  MapPin,
  Clock,
  Mail,
  Instagram,
  Facebook,
  Check,
  ArrowRight,
  CalendarCheck,
  Heart,
} from "lucide-react";
import { api, formatPrice, type Service, type TeamMember, type GalleryItem, type Settings } from "../lib/api";

const ICONS: Record<string, typeof Scissors> = {
  scissors: Scissors,
  palette: Palette,
  droplets: Droplets,
  sparkles: Sparkles,
  brush: Brush,
  flower: Flower,
  hand: Hand,
  gem: Gem,
  razor: Scissors,
};

function ServiceIcon({ name }: { name: string }) {
  const Cmp = ICONS[name] || Sparkles;
  return <Cmp className="h-6 w-6" strokeWidth={1.7} />;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM",
  "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM",
];

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=1800&q=80";
const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1200&q=80";

function useSiteData() {
  const [services, setServices] = useState<Service[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getServices(), api.getTeam(), api.getGallery(), api.getSettings()])
      .then(([s, t, g, st]) => {
        setServices(s);
        setTeam(t);
        setGallery(g);
        setSettings(st);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return { services, team, gallery, settings, loading };
}

export default function Home() {
  const { services, team, gallery, settings, loading } = useSiteData();
  const name = settings.salon_name || "Glow Beauty Lounge";
  const tagline = settings.tagline || "Where beauty meets elegance";

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Navbar name={name} />
      <Hero tagline={tagline} />
      <Services services={services} loading={loading} />
      <About />
      <Team team={team} loading={loading} />
      <Gallery gallery={gallery} loading={loading} />
      <Booking services={services} settings={settings} />
      <Contact settings={settings} />
      <Footer name={name} />
    </div>
  );
}

/* ------------------------------ Navbar ------------------------------ */
function Navbar({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Home", id: "home" },
    { label: "Services", id: "services" },
    { label: "About", id: "about" },
    { label: "Team", id: "team" },
    { label: "Gallery", id: "gallery" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 shadow-sm backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button onClick={() => scrollTo("home")} className="flex items-center gap-2 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
            <Sparkles className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span className="leading-tight">
            <span className={`block font-display text-lg font-semibold ${scrolled ? "text-ink" : "text-white"}`}>
              {name.split(" ")[0]}
            </span>
            <span className={`block text-[11px] uppercase tracking-[0.2em] ${scrolled ? "text-ink-soft" : "text-white/80"}`}>
              Beauty Lounge
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className={`text-sm font-medium transition-colors ${
                scrolled ? "text-ink hover:text-brand" : "text-white/90 hover:text-white"
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => scrollTo("booking")}
            className="hidden rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-dark sm:block"
          >
            Book Now
          </button>
          <button
            className="rounded-md p-2 text-ink lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className={`h-6 w-6 ${scrolled ? "text-ink" : "text-white"}`} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="bg-white px-4 pb-6 pt-2 shadow-lg lg:hidden">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setOpen(false);
                scrollTo(l.id);
              }}
              className="block w-full border-b border-cream py-3 text-left text-sm font-medium text-ink"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              scrollTo("booking");
            }}
            className="mt-4 w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
          >
            Book Now
          </button>
        </div>
      )}
    </header>
  );
}

/* ------------------------------ Hero ------------------------------ */
function Hero({ tagline }: { tagline: string }) {
  return (
    <section id="home" className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
      <img
        src={HERO_IMAGE}
        alt="Elegant salon interior with styling chairs and mirrors"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink/70" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.35em] text-brand-light sm:text-sm">
          Salon · Spa · Bridal Studio
        </p>
        <h1 className="font-display text-4xl leading-tight sm:text-6xl lg:text-7xl">
          Beauty that begins
          <br />
          <span className="italic text-brand-light">with you</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-white/85 sm:text-lg">{tagline}</p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() => scrollTo("booking")}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-dark sm:w-auto"
          >
            <CalendarCheck className="h-4 w-4" />
            Book an Appointment
          </button>
          <button
            onClick={() => scrollTo("services")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            Explore Services
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70">
        <div className="h-10 w-6 rounded-full border-2 border-white/40 p-1">
          <div className="mx-auto h-2 w-1 rounded-full bg-white/70" />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- SectionHeading ---------------------------- */
function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
      <div className="mx-auto mt-4 h-0.5 w-16 rounded bg-brand" />
      {subtitle && <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">{subtitle}</p>}
    </div>
  );
}

/* ------------------------------ Services ------------------------------ */
function Services({ services, loading }: { services: Service[]; loading: boolean }) {
  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
      <SectionHeading
        eyebrow="Our Services"
        title="Treatments made for you"
        subtitle="From a quick refresh to a full bridal transformation, our artists craft every look with care."
      />

      {loading ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-3xl bg-blush" />
          ))}
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div
              key={s.id}
              className="group relative overflow-hidden rounded-3xl border border-blush bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blush text-brand transition group-hover:bg-brand group-hover:text-white">
                <ServiceIcon name={s.icon} />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-cream pt-4">
                <span className="text-base font-semibold text-brand">{formatPrice(s.price)}</span>
                <span className="text-xs text-ink-soft">{s.duration} min</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------ About ------------------------------ */
function About() {
  const stats = [
    { value: "10+", label: "Years of care" },
    { value: "5000+", label: "Happy clients" },
    { value: "15+", label: "Expert artists" },
  ];
  const points = [
    "Experienced, friendly artists",
    "Premium & gentle products",
    "Calm, relaxing atmosphere",
    "Hygienic tools & fresh linens",
  ];

  return (
    <section id="about" className="bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <div className="relative">
          <img
            src={ABOUT_IMAGE}
            alt="Styling stations with mirrors and beauty products"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-3xl object-cover"
          />
          <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-brand px-7 py-5 text-white shadow-xl sm:block">
            <p className="font-display text-3xl font-semibold">10+</p>
            <p className="text-xs uppercase tracking-widest text-white/80">Years</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Why choose us</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            A little luxury, every visit
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-ink-soft sm:text-base">
            Glow Beauty Lounge is where skill meets warmth. Whether it's a fresh cut, glowing skin or
            your once-in-a-lifetime bridal look, our team listens first and creates a style that feels
            unmistakably you.
          </p>

          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-ink">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blush text-brand">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-9 grid grid-cols-3 gap-4 border-t border-cream pt-7">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl font-semibold text-brand sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-ink-soft">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Team ------------------------------ */
function Team({ team, loading }: { team: TeamMember[]; loading: boolean }) {
  return (
    <section id="team" className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
      <SectionHeading
        eyebrow="Our Team"
        title="Artists behind the glow"
        subtitle="A talented, caring team dedicated to making you look and feel your best."
      />

      {loading ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-3xl bg-blush" />
          ))}
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <div key={m.id} className="group overflow-hidden rounded-3xl border border-blush bg-white">
              <div className="relative overflow-hidden">
                <img
                  src={m.photo}
                  alt={`${m.name} — ${m.role}`}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5 text-center">
                <h3 className="font-display text-lg font-semibold text-ink">{m.name}</h3>
                <p className="mt-1 text-sm text-brand">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------ Gallery ------------------------------ */
function Gallery({ gallery, loading }: { gallery: GalleryItem[]; loading: boolean }) {
  return (
    <section id="gallery" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Gallery"
          title="Our work, your inspiration"
          subtitle="A glimpse of the styles and transformations we love creating."
        />

        {loading ? (
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-blush" />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
            {gallery.map((g) => (
              <div
                key={g.id}
                className="group relative overflow-hidden rounded-2xl"
              >
                <img
                  src={g.image}
                  alt={g.title || "Salon work"}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/60 opacity-0 transition group-hover:opacity-100">
                  <p className="font-display text-lg font-semibold text-white">{g.title}</p>
                  {g.category && (
                    <p className="text-xs uppercase tracking-widest text-brand-light">{g.category}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------ Booking ------------------------------ */
function Booking({ services, settings }: { services: Service[]; settings: Settings }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    serviceId: "",
    date: "",
    time: "",
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.serviceId || !form.date || !form.time) {
      setError("Please fill in name, phone, service, date and time.");
      setStatus("error");
      return;
    }
    const service = services.find((s) => String(s.id) === form.serviceId);
    setStatus("saving");
    setError("");
    try {
      await api.createBooking({
        name: form.name,
        phone: form.phone,
        email: form.email,
        serviceId: service ? service.id : null,
        serviceName: service ? service.name : null,
        date: form.date,
        time: form.time,
        notes: form.notes,
      });
      setStatus("done");
      setForm({ name: "", phone: "", email: "", serviceId: "", date: "", time: "", notes: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not send booking");
    }
  }

  const input =
    "w-full rounded-xl border border-blush bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <section id="booking" className="relative overflow-hidden bg-ink py-20 sm:py-24">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2">
        <div className="text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-light">Book Now</p>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            Reserve your moment of glow
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
            Choose your service, pick a time that suits you, and we'll take care of the rest. We'll
            confirm your appointment shortly.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-brand-light">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/60">Call us</p>
                <p className="text-sm font-medium">{settings.phone || "+92 300 1234567"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-brand-light">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/60">Opening hours</p>
                <p className="text-sm font-medium">{settings.hours || "Mon – Sat · 10:00 AM – 9:00 PM"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-brand-light">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/60">Find us</p>
                <p className="max-w-xs text-sm font-medium">
                  {settings.address || "Shop 12, Main Boulevard, Gulberg, Lahore"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-2xl sm:p-9">
          {status === "done" ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush text-brand">
                <Check className="h-8 w-8" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-ink">Thank you!</h3>
              <p className="mt-2 max-w-xs text-sm text-ink-soft">
                Your appointment request has been received. We'll contact you shortly to confirm.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Make another booking
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-soft">Name *</label>
                  <input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-soft">Phone *</label>
                  <input className={input} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="03xx xxxxxxx" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-soft">Email</label>
                <input type="email" className={input} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-soft">Service *</label>
                  <select className={input} value={form.serviceId} onChange={(e) => set("serviceId", e.target.value)}>
                    <option value="">Select a service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {formatPrice(s.price)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-soft">Time *</label>
                  <select className={input} value={form.time} onChange={(e) => set("time", e.target.value)}>
                    <option value="">Select time</option>
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-soft">Date *</label>
                <input type="date" min={today} className={input} value={form.date} onChange={(e) => set("date", e.target.value)} />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-soft">Notes</label>
                <textarea rows={3} className={input} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Anything we should know?" />
              </div>

              {status === "error" && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={status === "saving"}
                className="w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-dark disabled:opacity-60"
              >
                {status === "saving" ? "Sending…" : "Request Appointment"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Contact ------------------------------ */
function Contact({ settings }: { settings: Settings }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name || !form.message) {
      setError("Please add your name and message.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    setError("");
    try {
      await api.createMessage(form);
      setStatus("done");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not send message");
    }
  }

  const input =
    "w-full rounded-xl border border-blush bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

  const cards = [
    { icon: MapPin, title: "Visit us", value: settings.address || "Shop 12, Main Boulevard, Gulberg, Lahore" },
    { icon: Phone, title: "Call us", value: settings.phone || "+92 300 1234567" },
    { icon: Mail, title: "Email us", value: settings.email || "hello@glowbeautylounge.com" },
    { icon: Clock, title: "Opening hours", value: settings.hours || "Mon – Sat · 10:00 AM – 9:00 PM" },
  ];

  return (
    <section id="contact" className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
      <SectionHeading eyebrow="Contact" title="We'd love to see you" subtitle="Drop by, call, or send a message — we're happy to help with any question." />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.title} className="rounded-3xl border border-blush bg-white p-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blush text-brand">
              <c.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-ink">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-blush bg-white p-7 sm:p-9">
        {status === "done" ? (
          <div className="py-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blush text-brand">
              <Heart className="h-7 w-7" />
            </span>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">Message sent</h3>
            <p className="mt-2 text-sm text-ink-soft">Thanks for reaching out — we'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input className={input} placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={input} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <input type="email" className={input} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <textarea rows={4} className={input} placeholder="Your message *" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            {status === "error" && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={status === "saving"} className="w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
              {status === "saving" ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ------------------------------ Footer ------------------------------ */
function Footer({ name }: { name: string }) {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold">{name}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            A luxury salon & spa dedicated to hair, skin, makeup and bridal artistry.
          </p>
          <div className="mt-5 flex gap-3">
            <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-brand">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-brand">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold">Quick links</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            {["services", "about", "team", "gallery", "booking", "contact"].map((id) => (
              <li key={id}>
                <button onClick={() => scrollTo(id)} className="capitalize transition hover:text-brand-light">
                  {id}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold">Services</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            {["Hair Styling", "Bridal Makeup", "Skin & Facial", "Nails & Spa", "Men's Grooming"].map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-light" />
              Shop 12, Main Boulevard, Gulberg, Lahore
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-light" />
              +92 300 1234567
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-light" />
              hello@glowbeautylounge.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/50">
        <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
        <Link to="/admin" className="mt-1 inline-block text-white/30 transition hover:text-white/60">
          Admin
        </Link>
      </div>
    </footer>
  );
}
