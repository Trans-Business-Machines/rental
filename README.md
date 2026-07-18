# RentManager — Property Management System

A comprehensive property management platform built for rental property operators in Kenya. RentManager handles the full lifecycle of short-stay and long-stay bookings — from agent-submitted booking requests through admin approval, guest check-in, checkout inspection, and daily reporting.

## Overview

RentManager is a multi-tenant, role-based application that connects property administrators, on-ground users, and booking agents through a shared workflow. Agents submit booking requests with guest documentation. Admins review, approve, and manage the resulting bookings. The system tracks properties, units, guests, inventory, and payments across the entire operation.


## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Better Auth (with admin plugin, RBAC) |
| Object Storage | Supabase Storage |
| UI Components | shadcn/ui, Tailwind CSS |
| Forms & Validation | React Hook Form, Zod |
| Data Fetching | TanStack Query |
| Email | Resend, React Email |
| Hosting | Vercel |

## Features

- Property and unit management with image galleries
- Flexible unit pricing (nightly, weekly, monthly, custom date ranges) with discount rates
- Admin direct bookings and agent booking request workflow
- Booking request approval/rejection with email notifications
- Guest registration with national ID (front & back) or passport verification
- Role-based access control (Super Admin, Admin, User, Agent)
- Inventory tracking and unit assignment
- Checkout inspection reports with damage cost assessment
- M-Pesa paybill payment integration with code validation
- VAT calculation (16% Kenya rate)
- Daily checkout and overstay email reports via Vercel cron
- Dashboard with unit availability, recent bookings, and inventory overview
- Invitation-based user onboarding
- PII masking based on user role
- Client-side image compression and server-side storage management
- Soft-delete and restore for properties, units, guests, and bookings

## Project Structure

```
├── app/
│   ├── (auth)/              # Login, setup, invite acceptance
│   ├── (dashboard)/         # Main app pages (properties, bookings, guests, etc.)
│   └── api/                 # API routes (property CRUD, unit CRUD, cron jobs)
├── components/              # React components (forms, dialogs, tables, galleries)
├── hooks/                   # TanStack Query hooks (useBookings, useGuests, etc.)
├── lib/
│   ├── actions/             # Server actions (guests, bookings, properties, storage)
│   ├── emails/              # React Email templates
│   ├── schemas/             # Zod validation schemas
│   ├── services/            # ClientMediaService, server-side MediaService
│   ├── types/               # TypeScript interfaces and types
│   ├── auth.ts              # Better Auth configuration
│   ├── permissions.ts       # RBAC role definitions
│   ├── prisma.ts            # Prisma client singleton
│   └── utils.ts             # Shared utilities (formatting, pricing calculations)
├── prisma/
│   └── schema.prisma        # Database schema
└── vercel.json              # Cron job configuration
```

## License

Proprietary. All rights reserved.