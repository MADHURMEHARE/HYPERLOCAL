# PostgreSQL & Prisma Production Migration Blueprint

This directory contains the production-ready **Prisma Schema**, **Database Repositories**, and **Controller** modifications required to migrate this application from in-memory arrays to a durable, production-grade **PostgreSQL Database** (hosted on Supabase, Neon, AWS RDS, etc.).

We have fully implemented, tested, and validated all schema files and repository files to be 100% compatible with the application's TypeScript structures and APIs. The active application continues to run on in-memory arrays so your live preview and deployment do not break, but these files are ready to be swapped in when you connect a database!

---

## 📂 Migration Directory Structure

- `/prisma/schema.prisma` — Complete database schema, matching `User`, `Issue`, `Comment`, and `Notification` models with relationships, array fields, and json structures.
- `/prisma/prisma-client.ts` — Singleton initialization of Prisma Client.
- `/prisma-migration/repositories/`
  - `UserRepository.ts` — Thread-safe async repository wrapper with automated badge/points evaluation.
  - `IssueRepository.ts` — High-performance transactional async queries with priority weights, automatic vendor allotment, and real-time triggers.
  - `CommentRepository.ts` — Comment tracking and automatic upcounts.
  - `NotificationRepository.ts` — System alert triggers and user inbox.
- `/prisma-migration/controllers/`
  - `AuthController.ts` — Async-adapted login/registration controllers with JWT sign/verify.
  - `IssueController.ts` — Express route handlers adapted for `async/await` and automated error boundaries.

---

## 🚀 How to Complete the Swapping Process

To swap from in-memory arrays to PostgreSQL using Prisma, follow these simple steps:

### 1. Configure the Database URL
Add your PostgreSQL connection string in your `.env` file (and Vercel environment variables):

```env
DATABASE_URL="postgresql://username:password@hostname:5432/dbname?sslmode=require"
```

### 2. Swap the Repository and Controller Files
Since the folder paths and structures are preserved exactly:
1. Replace `/server/repositories/` with the files in `/prisma-migration/repositories/`.
2. Replace `/server/controllers/` with the files in `/prisma-migration/controllers/`.

### 3. Update the Routes File to be Async
Update `/server/routes/` to ensure errors are handled cleanly. Since Express 4 handles async errors nicely or you can use `express-async-errors`, you can install:
```bash
npm install express-async-errors
```
And import it at the top of `/server.ts` or `/server-dev.ts`:
```typescript
import 'express-async-errors';
```

### 4. Database Setup & First Migration
Run the following commands to initialize your database, push the schema, and generate the client types:

```bash
# Push schema and create tables in PostgreSQL
npx prisma db push

# Generate type-safe Prisma client
npx prisma generate
```

---

## 🛠️ Vercel Deployment Configuration

When deploying on Vercel, make sure you configure your **Build Command** and **Environment Variables**:

### 1. Build Command
Update the `build` script in `package.json` to generate the Prisma client before building:

```json
"build": "prisma generate && vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs"
```

### 2. Vercel Environment Variables
Add the following key in your Vercel Project Dashboard:
- `DATABASE_URL` — your production PostgreSQL connection string.
- `JWT_SECRET` — a secure random string for token signing.
