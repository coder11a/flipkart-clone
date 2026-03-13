# Flipkart Clone

Replica of Flipkart's core browsing, catalog, and account flows built with Next.js App Router, serverless Postgres via Neon, and cookie-based JWT authentication. Use this document to get your environment running quickly.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19 and TypeScript 5
- **Styling**: Tailwind CSS 4 + Next.js PostCSS pipeline
- **Database**: Postgres hosted on Neon via `@neondatabase/serverless`
- **Auth**: JWT sessions stored in HTTP-only cookies (`jsonwebtoken`, `bcryptjs`)
- **Tooling**: ESLint 9, Node.js ≥ 18, npm (default via `package-lock.json`)

## Getting Started

### 1. Prerequisites

- Node.js 18 or later (aligns with Next.js 16 requirements)
- npm 9+ (or another package manager, but commands below use npm)
- A Neon (or compatible Postgres) database; grab the connection string with `sslmode=require`

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```bash
NEON_DATABASE_URL=postgres://user:password@host/db?sslmode=require
AUTH_SECRET=long-random-string
```

- `NEON_DATABASE_URL` is required by `src/lib/neon.ts` at boot.
- `AUTH_SECRET` signs and verifies JWT cookies in `src/lib/auth.ts`.

### 4. Provision and seed the database

Run the provided SQL to create tables and seed sample products. The helper script targets Neon directly via `psql`:

```bash
npm run db:seed
```

> The script expects `psql` to be available locally and uses the `NEON_DATABASE_URL` env var. If you need to apply additional schemas (e.g., `sql/cart.sql`, `sql/orders.sql`), execute those files manually in your Postgres client of choice.

### 5. Start the development server

```bash
npm run dev
```

Visit `http://localhost:3000` to browse the storefront. Use `npm run build && npm run start` for production builds and `npm run lint` to run ESLint.

## Assumptions

1. **Database schema parity**: Your Neon Postgres instance is created using the SQL files in `/sql`, so queries issued from the app match the expected tables and columns.
2. **Accessible serverless Postgres**: The app connects over the public internet via Neon; no VPC tunneling or SSH bastions are required.
3. **Single auth secret**: A single `AUTH_SECRET` suffices for JWT signing/verification across all deployments; rotate manually if needed.
4. **Email uniqueness**: Signup routes assume the `users.email` column has a unique constraint (enforced in the provided SQL).
5. **Browser clients only**: The UI is optimized for modern evergreen browsers; no legacy browsers are officially supported.

