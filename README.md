# Glow Beauty Lounge 💄

A modern, elegant salon & spa website with online booking and a full admin panel.

## ✨ Features

- Beautiful responsive landing page — hero, services, about, team, gallery, booking and contact
- **Online booking** that saves appointments to a database
- **Contact form** that saves messages
- **Admin panel** to manage bookings, services, team, gallery, messages and salon details
- Everything (services, prices, team, gallery, contact info) is editable from the admin panel — no code changes needed

## 🧰 Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |

## 📁 Project structure

```
.
├── index.html
├── package.json          # frontend dependencies & scripts
├── vite.config.ts        # dev server (proxies /api to the backend)
├── src/                  # React app
│   ├── pages/Home.tsx    # landing page
│   ├── pages/Admin.tsx   # admin panel
│   ├── lib/api.ts        # API client + types
│   └── ...
├── server/               # Express API + database schema/seed
│   ├── index.js
│   ├── db.js
│   └── package.json
└── Dockerfile            # production container for the API
```

## 🚀 Running locally

1. Install frontend dependencies:

   ```bash
   npm install
   ```

2. Install backend dependencies:

   ```bash
   npm --prefix server install
   ```

3. Set the database connection string (the API expects PostgreSQL):

   ```bash
   export DATABASE_URL=postgres://user:password@host:5432/dbname
   ```

4. Start the backend (port 3001):

   ```bash
   node server/index.js
   ```

5. Start the frontend (port 5173):

   ```bash
   npm run dev
   ```

The dev server proxies `/api` requests to `http://localhost:3001` automatically.

## 🔑 Admin access

- Open the site and go to `#/admin` (or click the "Admin" link in the footer)
- Default password: `glow1234`

To change the admin password, set the `ADMIN_PASSWORD` environment variable.

## 🌍 Environment variables (backend)

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ADMIN_PASSWORD` | No | Admin login password (default `glow1234`) |
| `JWT_SECRET` | No | Secret used to sign login tokens |
| `PORT` | No | API port (default `3001`) |
