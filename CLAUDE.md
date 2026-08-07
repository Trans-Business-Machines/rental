# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

RentManager — a multi-tenant property management platform for rental operators in Kenya, built with Next.js 15 (App Router) and TypeScript. It manages the full booking lifecycle: agent-submitted booking requests → admin approval → guest check-in → checkout inspection → daily reporting, plus properties, units, guests, inventory, and payments.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build         # Production build
npm run lint          # ESLint (next/core-web-vitals + next/typescript)
npm run type-check    # tsc --noEmit
```

Prisma (schema at `prisma/schema.prisma`, client generated to `prisma/generated/client`, NOT `node_modules/.prisma`):

```bash
npx prisma migrate dev --name <description>   # create + apply a migration locally
npx prisma generate                            # regenerate client after schema changes
npx prisma studio                               # browse the DB
```

There is no test runner configured in this repo — verify changes via `type-check`, `lint`, and manual testing through `npm run dev`.

## Architecture

**Layering:** `app/` (routes/pages) → `hooks/` (TanStack Query hooks) → `lib/actions/` (Next.js server actions, `"use server"`) → `prisma` (DB). Client components call hooks, hooks call server actions, server actions talk to Prisma directly. Read-only data for server components is fetched by calling `lib/actions/*` functions directly (no hook needed).

- `app/(auth)/` — login, invite acceptance, password setup/reset. Public routes.
- `app/(dashboard)/` — the authenticated app (properties, units, bookings, booking-requests, guests, checkout, inventory, payments, users, settings). Route folders often colocate page-specific components (e.g. `_components/`) alongside `page.tsx`.
- `app/api/` — REST-style routes used for cases server actions don't fit: better-auth catch-all, property/unit CRUD used by external callers, a public units endpoint, and the checkout-reminder cron (`/api/upcoming-checkouts`, scheduled via `vercel.json`, guarded by a `CRON_SECRET` bearer token).
- `lib/actions/*.ts` — one file per domain (bookings, booking-requests, checkout, guests, properties, units, inventory, payments, pricing, users, settings, dashboard, user-stats). Each exported function is an independent server action, not a REST resource — read, mutate, and stats functions all live together per domain.
- `hooks/*.ts` — one TanStack Query hook file per domain, thin wrappers around the matching `lib/actions` file. Each defines a `xxxKeys` query-key factory and wires `onSuccess`/`onError` toasts (via `sonner`) and cross-domain cache invalidation (e.g. creating a booking invalidates unit details, checkout lists, and guest search).
- `lib/schemas/*.ts` — Zod schemas per domain, used by `react-hook-form` via `@hookform/resolvers`.
- `lib/types/types.ts` — central type file. Most domain types are *derived* from action return types (`Awaited<ReturnType<typeof getX>>`) rather than redeclared — follow this pattern instead of hand-writing duplicate interfaces.
- `lib/emails/` — React Email templates, sent via Resend (`lib/emailClient.ts` / `lib/services/email.ts`).
- `lib/services/MediaService.ts` (server) and `lib/services/clientMediaService.ts` (client, `ClientMediaService`) — image upload/compression to **Supabase Storage** (buckets: `property_images`, `unit_images`, `guest-documents`). Despite a `public/uploads/` directory and a migration named "local file storage", Supabase remains the actual media backend — don't assume local disk storage.

### Auth & permissions

- Auth is [better-auth](lib/auth.ts) with the admin plugin, backed by Prisma. Roles: `user`, `admin`, `superAdmin`, `agent` (see [lib/permissions.ts](lib/permissions.ts) for the full access-control statement/role matrix — e.g. only `superAdmin` can delete/restore or manage settings).
- `middleware.ts` gates all non-API routes on the session cookie; `/login`, `/invite`, `/setup`, `/forgot-password`, `/reset-password` are the public exceptions.
- Inside server actions, call `requirePermission(resource, action)` or `requireRole([...])` from [lib/check-permissions.ts](lib/check-permissions.ts) — it throws `"Unauthorized: Insufficent permissions."` (note the existing typo — hooks match on this exact string for toast messages, so preserve it rather than "fixing" it). Use `getServerSession()` from the same file to read the current user.
- Agents (`role === "agent"`) are scoped to their own data throughout — most `get*` actions filter `requestedById: user.id` when the caller is an agent. Preserve this scoping when adding new queries.
- PII (phone, email, ID number) is masked for non-`superAdmin` roles via `maskPhone`/`maskEmail`/`maskIdNumber` in [lib/utils.ts](lib/utils.ts).

### Data model conventions (see [prisma/schema.prisma](prisma/schema.prisma))

- Soft delete via nullable `deletedAt` on Property, Unit, Guest, Booking — always filter `deletedAt: null` in normal queries; there are separate `getSoftDeleted*`/`restore*` actions per domain.
- `Booking` vs `BookingRequest`: agents create a `BookingRequest` (pending/approved/rejected/cancelled) that an admin/superAdmin reviews; approval creates the real `Booking`. Direct bookings by admins skip the request step and go straight to `Booking`.
- Booking/unit status are kept in sync: changing a booking's status updates the related `Unit.status` via `evaluateUnitStatus()` and adjusts `Property.occupied`, always inside a `prisma.$transaction` (see [lib/actions/bookings.ts](lib/actions/bookings.ts)) — replicate this pattern (transaction + unit status + occupancy count) for any new booking-status mutation.
- Checkout dates are normalized to 10:00 EAT via `normalizeCheckOutTo10amEAT()`; the cron job and date math elsewhere assume `Africa/Nairobi` (`date-fns-tz`).
- Pricing: `PriceDuration` is `one_night | weekly | monthly | custom`; use the `getDuration*`/`calculate*` helpers in [lib/utils.ts](lib/utils.ts) (nights, discounted price, total, VAT at `KENYA_VAT_RATE`) rather than recalculating inline.
- `paymentCode` (M-Pesa code) must be unique across both `Booking` and pending/approved `BookingRequest` — check both tables when validating new codes.

### Conventions

- Server actions return `{ success, message }` or `{ success, result }` objects on failure paths but often `throw` on hard failures (e.g. `updateBooking`) — check the specific action before assuming its error-handling shape.
- Path/tag revalidation (`revalidatePath`, `revalidateTag`) is called explicitly after mutations inside the action, in addition to query-client invalidation in the hook — update both sides when adding a new mutation.
- UI: shadcn/ui ("new-york" style) in `components/ui/`, Tailwind CSS v4, `cn()` from `lib/utils.ts` for class merging. Path alias `@/*` maps to repo root.
- `env.NEXT_PUBLIC_VAT_RATE`, `CRON_SECRET`, `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL`, `DATABASE_URL`, `RESEND_API_KEY`/`EMAIL_FROM`, and Supabase keys are the operative env vars — see `.env` for the full set (not committed).
