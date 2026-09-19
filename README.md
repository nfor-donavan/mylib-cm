# MyLib CM — Multi-Tenant Library Management System

A SaaS library platform for schools in Cameroon: one backend, many schools
(tenants), each with strict data isolation. The catalog covers curriculum
textbooks, past papers, fiction, reference works, periodicals, religious
texts, career guidance, biographies and children's books — not just
school-assigned reading.

## Structure

```
backend/               Node.js / Express API + MongoDB (Mongoose)
frontend-librarian/    React (Vite) desktop app for librarians — barcode
                        checkout, catalog management, offline PWA support
frontend-student/      React (Vite) mobile-responsive student/teacher portal
```

## Backend setup

```bash
cd backend
npm install
cp .env.example .env      # fill in your own MONGODB_URI and JWT_SECRET
npm run dev                 # starts on http://localhost:4000
```

No demo data is created automatically. To bootstrap your first real
account:

```bash
# 1. Create your own SuperAdmin login (one-time, real credentials)
node scripts/create-superadmin.js --email you@example.com --password "a-strong-password" --name "Your Name"

# 2. Log in as SuperAdmin (POST /api/auth/login with { email, password }, no subdomain)
#    then use that token to onboard your first school:
#    POST /api/tenants           { schoolName, subdomain, educationSystem }
#    POST /api/auth/register-librarian   { tenantId, matricule, fullName, phoneNumber, password }
#
# 3. Log in as that librarian (POST /api/auth/login with { subdomain, matricule, password })
#    and use the librarian panel's "Add student" screen, or POST /api/auth/register-student,
#    to add students/teachers, then start adding books via POST /api/books.
```

## Librarian panel setup

```bash
cd frontend-librarian
npm install
npm run dev     # http://localhost:5173
```

Uses a USB barcode scanner (behaves as rapid keystrokes + Enter) for
checkout/return. Works offline: catalog and student data are cached in
IndexedDB, checkouts made offline are queued and auto-synced to
`POST /api/sync` the moment the connection returns.

## Student portal setup

```bash
cd frontend-student
npm install
npm run dev     # http://localhost:5174 (set a different port if running both apps)
```

Mobile-first PWA: view active loans and due dates, browse/search the full
catalog, and open digital PDFs (past papers, textbooks, periodicals).

## Key design decisions

- **Tenant isolation**: every collection carries `tenantId`; the
  `middleware/tenantScope.js` helper makes it structurally hard for a
  controller to write an unscoped (cross-school) query.
- **Bilingual by default**: every UI string lives in `src/i18n/en.json` /
  `fr.json` on both frontends, matching Cameroon's Anglophone/Francophone
  school systems.
- **Offline-first checkout**: the librarian panel is a PWA (service worker +
  IndexedDB) so checkouts keep working through a power cut; the sync route
  is idempotent via a per-checkout `clientSyncId`.
- **SMS reminders**: a daily cron job (`node-cron`, 8:00 AM) finds overdue
  loans and texts the borrower via a pluggable local SMS provider
  (`utils/sms.js` — wire in MTN Zigi, Orange SMS API, or BulkSMS).

## What's stubbed vs. production-ready

This is a working skeleton, not a finished product. Solid and ready to
extend: schemas, auth, tenant isolation, the barcode/offline/sync flow, and
i18n. Left for you to fill in before going live: real SMS provider
credentials, file storage for PDF uploads (currently just a URL field),
student self-registration/password reset, reservations, fines/payment
tracking, and a Super Admin dashboard UI (the API routes exist in
`tenantRoutes.js`, but there's no frontend for it yet).
