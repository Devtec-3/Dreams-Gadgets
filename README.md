# Dreams Gadgets — Receipt Generator

Internal receipt generator for **Dreams Gadgets** (…Smart gadgets for smarter living).

## Features
- Password-protected single-owner app (hashed password in DB, changeable in Settings)
- Forgot password via 6-digit email reset code (Gmail SMTP)
- Create receipts with device details (IMEI, battery health, carrier, color, storage…)
- Auto receipt numbers (`ORD-YYYYMMDD-XXXXXXXX`), ₦ formatting, QR verification
- Print-to-PDF (browser print dialog)
- History with filters: customer name, location, device type, month, exact date
- Export filtered receipts as CSV (Excel / Google Drive friendly)
- Public QR verification page (`/verify/RECEIPT-NO`)

## Tech
Next.js (App Router) · Tailwind CSS v4 · Prisma · PostgreSQL (Tiger Cloud) · qrcode · nodemailer

## Environment variables (`.env` — never committed)
```
DATABASE_URL=postgres://...          # Postgres connection string
APP_PASSWORD=...                     # first-run password (migrated to DB on first login)
NEXT_PUBLIC_APP_URL=https://...      # public URL used in QR codes
GMAIL_USER=...                       # Gmail address for reset emails (optional)
GMAIL_APP_PASSWORD=...               # Gmail App Password (optional)
```

## Setup
```bash
npm install
npx prisma db push     # create tables
npm run build
npm run start
```

## Security
- scrypt-hashed passwords, timing-safe comparisons
- Sessions invalidated on password change (token bound to password hash)
- Login rate limiting (5 failed attempts → 15 min lockout)
- Reset codes: single-use, 15-min expiry, max 5 verification attempts, deleted on password change
- Security headers (X-Frame-Options DENY, nosniff, referrer policy)
- All API routes require authentication; CSV export has injection protection

## Deployment (Vercel)
1. Push to GitHub → import repo in Vercel
2. Add all env vars in Vercel project settings
3. Set `NEXT_PUBLIC_APP_URL` to the final Vercel domain so QR codes work
