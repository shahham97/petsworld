# PetsWorld.pk

A fast, fully dynamic, Pakistan-only pet e-commerce platform built with Next.js App Router, TiDB Cloud Serverless, Tailwind CSS, and Prisma ORM.

---

## ⚠️ Database Protection & Migration Rules

> [!CRITICAL]
> **Production & Local Database Safety Rules**
> Local development and live Vercel deployments share **ONE single live TiDB database**.
> Strict compliance with the following rules is mandatory:

1. **NEVER run destructive commands**:
   - `prisma migrate reset` is **STRICTLY PROHIBITED**.
   - `prisma db push --force-reset` is **STRICTLY PROHIBITED**.
   - Direct `DROP TABLE`, `TRUNCATE`, or destructive table alter scripts are **PROHIBITED**.
2. **Migrations must be additive only**:
   - Schema alterations must add tables, columns, or non-breaking indexes.
3. **Run migrations manually**:
   ```bash
   npm run db:deploy # Runs: prisma migrate deploy
   ```
   **NEVER** run migrations inside the automated Vercel build command.
4. **Idempotent Seeding**:
   ```bash
   npm run db:seed # Runs: tsx prisma/seed.ts
   ```
   The seed script uses `upsert` and will **never** overwrite or delete any record that the administrator has modified.

---

## 🌍 Infrastructure & Region Pairing

- **Database Provider**: TiDB Cloud Serverless
- **TiDB Host**: `gateway01.ap-northeast-1.prod.aws.tidbcloud.com` (AWS Tokyo / ap-northeast-1)
- **Vercel Recommended Function Region**: Set Vercel deployment region to `hnd1` (Tokyo, Japan) in `vercel.json` to minimize database query latency.

---

## 🛠️ Environment Configuration

Refer to `.env.example` for the complete list of variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | TiDB Cloud MySQL connection string with SSL parameter (`?sslaccept=strict`) |
| `AUTH_SECRET` | 32+ character random secret for admin session tokens |
| `ADMIN_SEED_EMAIL` | Bootstrap admin email (e.g. `admin@petsworld.pk`) |
| `ADMIN_SEED_PASSWORD` | Bootstrap admin password |
| `SITE_URL` | Application base URL (`http://localhost:3000` or production domain) |
| `RESEND_API_KEY` | *(Optional at launch)* Resend API key for transactional emails |
| `EMAIL_FROM` | *(Optional at launch)* Transactional email sender (e.g. `PetsWorld <orders@petsworld.pk>`) |

---

## 🚀 Setup & Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Deploy migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed base data (idempotent)**:
   ```bash
   npx prisma db seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Verify Database Health**:
   Visit [http://localhost:3000/api/health](http://localhost:3000/api/health) to inspect TiDB connectivity and query latency.

---

## 📧 Email Notifications: Going Live with Resend

Transactional emails are built with the Resend SDK and an `EmailLog` audit table. When `RESEND_API_KEY` is omitted, emails are recorded as `SKIPPED_NOT_CONFIGURED` without blocking order flows.

To activate live transactional emails:
1. Create an account on [resend.com](https://resend.com) and add your custom domain (e.g., `petsworld.pk`).
2. Configure the required DNS records (SPF, DKIM, and MX) with your domain provider and verify domain status in Resend.
3. Generate a production API key in Resend dashboard.
4. Set `RESEND_API_KEY` and `EMAIL_FROM` (e.g. `PetsWorld <orders@petsworld.pk>`) in Vercel project environment settings and your local `.env`.
5. Navigate to the Admin Portal under **Store Settings > Email** and click **Send test email** to confirm delivery.
