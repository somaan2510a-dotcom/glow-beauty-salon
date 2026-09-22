import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

const SERVICES = [
  { name: "Haircut & Styling", description: "Precision cut, wash and a style tailored to your face shape.", price: 1500, duration: 45, icon: "scissors", category: "Hair", sort_order: 1 },
  { name: "Hair Color & Highlights", description: "Full colour, balayage and highlights with premium products.", price: 4500, duration: 120, icon: "palette", category: "Hair", sort_order: 2 },
  { name: "Hair Spa & Treatment", description: "Deep-nourishing spa to repair and restore healthy shine.", price: 2000, duration: 45, icon: "droplets", category: "Hair", sort_order: 3 },
  { name: "Bridal Makeup", description: "Complete bridal look with trial, HD makeup and styling.", price: 15000, duration: 180, icon: "sparkles", category: "Makeup", sort_order: 4 },
  { name: "Party Makeup", description: "Glamorous look for events, dinners and celebrations.", price: 6000, duration: 90, icon: "brush", category: "Makeup", sort_order: 5 },
  { name: "Facial & Skin Care", description: "Customised facial for glow, hydration and clear skin.", price: 3000, duration: 60, icon: "flower", category: "Skin", sort_order: 6 },
  { name: "Manicure & Pedicure", description: "Nail care, shaping, polish and relaxing hand massage.", price: 2500, duration: 60, icon: "hand", category: "Nails", sort_order: 7 },
  { name: "Men's Grooming", description: "Haircut, beard trim and styling for the modern man.", price: 1200, duration: 40, icon: "razor", category: "Men", sort_order: 8 },
];

const TEAM = [
  { name: "Somaan", role: "Creative Director", bio: "Sets the vision behind every look and keeps the salon ahead of trends.", photo: "https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MDYwMzJ8MHwxfHNlYXJjaHwzfHxtYW4lMjBiYXJiZXIlMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwwfHx8fDE3OTAwNTM3Nzh8MA&ixlib=rb-4.1.0&q=80&w=800", sort_order: 1 },
  { name: "Buhra", role: "Senior Hair Stylist", bio: "Specialist in cuts, colour and styling that match your personality.", photo: "https://images.unsplash.com/photo-1630939687530-241d630735df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MDYwMzJ8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHN0eWxpc3QlMjBwb3J0cmFpdCUyMHNtaWxpbmclMjBzYWxvbnxlbnwwfHx8fDE3OTAwNTM3Nzh8MA&ixlib=rb-4.1.0&q=80&w=800", sort_order: 2 },
  { name: "Laiba", role: "Bridal Makeup Artist", bio: "Creates flawless bridal looks that last from ceremony to celebration.", photo: "https://images.unsplash.com/photo-1586448127354-6017a26ce03c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MDYwMzJ8MHwxfHNlYXJjaHw0fHx3b21hbiUyMHN0eWxpc3QlMjBwb3J0cmFpdCUyMHNtaWxpbmclMjBzYWxvbnxlbnwwfHx8fDE3OTAwNTM3Nzh8MA&ixlib=rb-4.1.0&q=80&w=800", sort_order: 3 },
  { name: "Noor", role: "Beauty & Skin Therapist", bio: "Focused on skin health, facials and a naturally radiant glow.", photo: "https://images.pexels.com/photos/3993303/pexels-photo-3993303.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", sort_order: 4 },
  { name: "Ahsan", role: "Barber / Men's Grooming", bio: "Sharp fades and clean beard work for a crisp, confident finish.", photo: "https://images.pexels.com/photos/20302331/pexels-photo-20302331.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", sort_order: 5 },
  { name: "Ammar", role: "Hair Color Specialist", bio: "Balayage and colour transformations with a careful, artistic eye.", photo: "https://images.unsplash.com/photo-1553521041-d168abd31de3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MDYwMzJ8MHwxfHNlYXJjaHw0fHxtYW4lMjBiYXJiZXIlMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwwfHx8fDE3OTAwNTM3Nzh8MA&ixlib=rb-4.1.0&q=80&w=800", sort_order: 6 },
];

const GALLERY = [
  { title: "Signature styling", category: "Hair", image: "https://images.unsplash.com/photo-1634449571017-5fecfd26ad76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MDYwMzJ8MHwxfHNlYXJjaHwyfHxoYWlyJTIwc3R5bGluZyUyMHNhbG9uJTIwc3R5bGlzdHxlbnwwfHx8fDE3OTAwNTM3NzF8MA&ixlib=rb-4.1.0&q=80&w=1080", sort_order: 1 },
  { title: "Elegant bridal", category: "Makeup", image: "https://images.pexels.com/photos/30825617/pexels-photo-30825617.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", sort_order: 2 },
  { title: "Our studio", category: "Salon", image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MDYwMzJ8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzYWxvbiUyMGludGVyaW9yJTIwYmVhdXR5fGVufDB8fHx8MTc5MDA1Mzc3MXww&ixlib=rb-4.1.0&q=80&w=1080", sort_order: 3 },
  { title: "Nail care", category: "Nails", image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MDYwMzJ8MHwxfHNlYXJjaHwxfHxzcGElMjBtYW5pY3VyZSUyMG5haWxzJTIwdHJlYXRtZW50fGVufDB8fHx8MTc5MDA1Mzc3MXww&ixlib=rb-4.1.0&q=80&w=1080", sort_order: 4 },
  { title: "Modern interior", category: "Salon", image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MDYwMzJ8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBzYWxvbiUyMGludGVyaW9yJTIwYmVhdXR5fGVufDB8fHx8MTc5MDA1Mzc3MXww&ixlib=rb-4.1.0&q=80&w=1080", sort_order: 5 },
  { title: "Blow-dry finish", category: "Hair", image: "https://images.pexels.com/photos/696285/pexels-photo-696285.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", sort_order: 6 },
];

const SETTINGS = {
  salon_name: "Glow Beauty Lounge",
  tagline: "Where beauty meets elegance",
  phone: "+92 300 1234567",
  email: "hello@glowbeautylounge.com",
  address: "Shop 12, Main Boulevard, Gulberg, Lahore, Pakistan",
  hours: "Mon – Sat · 10:00 AM – 9:00 PM",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
};

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL DEFAULT 0,
      duration INTEGER NOT NULL DEFAULT 30,
      icon TEXT,
      category TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS team (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      bio TEXT,
      photo TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id SERIAL PRIMARY KEY,
      title TEXT,
      category TEXT,
      image TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      service_id INTEGER,
      service_name TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Seed services
  const { rows: svc } = await pool.query("SELECT COUNT(*)::int AS c FROM services");
  if (svc[0].c === 0) {
    for (const s of SERVICES) {
      await pool.query(
        "INSERT INTO services (name, description, price, duration, icon, category, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [s.name, s.description, s.price, s.duration, s.icon, s.category, s.sort_order]
      );
    }
  }

  // Seed team
  const { rows: tm } = await pool.query("SELECT COUNT(*)::int AS c FROM team");
  if (tm[0].c === 0) {
    for (const t of TEAM) {
      await pool.query(
        "INSERT INTO team (name, role, bio, photo, sort_order) VALUES ($1,$2,$3,$4,$5)",
        [t.name, t.role, t.bio, t.photo, t.sort_order]
      );
    }
  }

  // Seed gallery
  const { rows: gl } = await pool.query("SELECT COUNT(*)::int AS c FROM gallery");
  if (gl[0].c === 0) {
    for (const g of GALLERY) {
      await pool.query(
        "INSERT INTO gallery (title, category, image, sort_order) VALUES ($1,$2,$3,$4)",
        [g.title, g.category, g.image, g.sort_order]
      );
    }
  }

  // Seed settings
  for (const [key, value] of Object.entries(SETTINGS)) {
    await pool.query(
      "INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING",
      [key, value]
    );
  }
}
