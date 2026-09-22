import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { pool, initDb } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "glow-salon-dev-secret";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "glow1234";

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Login required" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== "admin") throw new Error("bad role");
    next();
  } catch {
    return res.status(401).json({ error: "Invalid session" });
  }
}

// ---------- Public ----------
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/services", async (_req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM services ORDER BY sort_order, id");
    res.json(rows);
  } catch (e) { next(e); }
});

app.get("/api/team", async (_req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM team ORDER BY sort_order, id");
    res.json(rows);
  } catch (e) { next(e); }
});

app.get("/api/gallery", async (_req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM gallery ORDER BY sort_order, id");
    res.json(rows);
  } catch (e) { next(e); }
});

app.get("/api/settings", async (_req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT key, value FROM settings");
    const settings = {};
    for (const r of rows) settings[r.key] = r.value;
    res.json(settings);
  } catch (e) { next(e); }
});

app.post("/api/bookings", async (req, res, next) => {
  try {
    const { name, phone, email, serviceId, serviceName, date, time, notes } = req.body || {};
    if (!name || !phone || !date || !time) {
      return res.status(400).json({ error: "Name, phone, date and time are required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO bookings (name, phone, email, service_id, service_name, date, time, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, phone, email || null, serviceId || null, serviceName || null, date, time, notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

app.post("/api/messages", async (req, res, next) => {
  try {
    const { name, phone, email, message } = req.body || {};
    if (!name || !message) return res.status(400).json({ error: "Name and message are required" });
    const { rows } = await pool.query(
      `INSERT INTO messages (name, phone, email, message) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, phone || null, email || null, message]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

// ---------- Admin auth ----------
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Wrong password" });
  }
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

app.get("/api/admin/verify", requireAdmin, (_req, res) => res.json({ ok: true }));

// ---------- Admin: bookings ----------
app.get("/api/bookings", requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM bookings ORDER BY created_at DESC");
    res.json(rows);
  } catch (e) { next(e); }
});

app.patch("/api/bookings/:id", requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body || {};
    const valid = ["pending", "confirmed", "cancelled"];
    if (!valid.includes(status)) return res.status(400).json({ error: "Invalid status" });
    const { rows } = await pool.query(
      "UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *",
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

app.delete("/api/bookings/:id", requireAdmin, async (req, res, next) => {
  try {
    await pool.query("DELETE FROM bookings WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Admin: services ----------
app.post("/api/services", requireAdmin, async (req, res, next) => {
  try {
    const { name, description, price, duration, icon, category, sort_order } = req.body || {};
    if (!name) return res.status(400).json({ error: "Name is required" });
    const { rows } = await pool.query(
      `INSERT INTO services (name, description, price, duration, icon, category, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, description || null, price || 0, duration || 30, icon || "sparkles", category || null, sort_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

app.put("/api/services/:id", requireAdmin, async (req, res, next) => {
  try {
    const { name, description, price, duration, icon, category, sort_order } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE services SET name=$1, description=$2, price=$3, duration=$4, icon=$5, category=$6, sort_order=$7
       WHERE id=$8 RETURNING *`,
      [name, description || null, price || 0, duration || 30, icon || "sparkles", category || null, sort_order || 0, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

app.delete("/api/services/:id", requireAdmin, async (req, res, next) => {
  try {
    await pool.query("DELETE FROM services WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Admin: team ----------
app.post("/api/team", requireAdmin, async (req, res, next) => {
  try {
    const { name, role, bio, photo, sort_order } = req.body || {};
    if (!name) return res.status(400).json({ error: "Name is required" });
    const { rows } = await pool.query(
      `INSERT INTO team (name, role, bio, photo, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, role || null, bio || null, photo || null, sort_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

app.put("/api/team/:id", requireAdmin, async (req, res, next) => {
  try {
    const { name, role, bio, photo, sort_order } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE team SET name=$1, role=$2, bio=$3, photo=$4, sort_order=$5 WHERE id=$6 RETURNING *`,
      [name, role || null, bio || null, photo || null, sort_order || 0, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

app.delete("/api/team/:id", requireAdmin, async (req, res, next) => {
  try {
    await pool.query("DELETE FROM team WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Admin: gallery ----------
app.post("/api/gallery", requireAdmin, async (req, res, next) => {
  try {
    const { title, category, image, sort_order } = req.body || {};
    if (!image) return res.status(400).json({ error: "Image URL is required" });
    const { rows } = await pool.query(
      `INSERT INTO gallery (title, category, image, sort_order) VALUES ($1,$2,$3,$4) RETURNING *`,
      [title || null, category || null, image, sort_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

app.put("/api/gallery/:id", requireAdmin, async (req, res, next) => {
  try {
    const { title, category, image, sort_order } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE gallery SET title=$1, category=$2, image=$3, sort_order=$4 WHERE id=$5 RETURNING *`,
      [title || null, category || null, image, sort_order || 0, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

app.delete("/api/gallery/:id", requireAdmin, async (req, res, next) => {
  try {
    await pool.query("DELETE FROM gallery WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Admin: messages ----------
app.get("/api/messages", requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM messages ORDER BY created_at DESC");
    res.json(rows);
  } catch (e) { next(e); }
});

app.delete("/api/messages/:id", requireAdmin, async (req, res, next) => {
  try {
    await pool.query("DELETE FROM messages WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Admin: settings ----------
app.put("/api/settings", requireAdmin, async (req, res, next) => {
  try {
    const entries = Object.entries(req.body || {});
    for (const [key, value] of entries) {
      if (typeof value === "string") {
        await pool.query(
          `INSERT INTO settings (key, value) VALUES ($1,$2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [key, value]
        );
      }
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Error handler ----------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 3001;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Salon API running on port ${PORT}`));
  })
  .catch((e) => {
    console.error("Failed to initialise database", e);
    process.exit(1);
  });
