# Smart Money Manager

Smart Money Manager is a personal finance dashboard for tracking income, expenses, budgets, savings goals, debts, and daily financial activity. The app is built with a Next.js client and an Express API backed by MongoDB through Prisma.

## Features

- User registration, login, OTP verification, password reset, and cookie-based authentication
- Dashboard overview for financial summaries
- Income and expense tracking with categories
- Daily and monthly budget management
- Savings goals with contribution tracking
- Debt tracking for money given or taken, including pending, paid, and overdue states
- Today update page for quick financial activity review
- Category management with default seeded categories

## Tech Stack

### Client

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui and Radix UI
- React Hook Form
- Zod
- TanStack Table
- Recharts
- Axios

### Server

- Node.js
- Express
- TypeScript
- Prisma ORM
- MongoDB
- JWT authentication
- Bcrypt
- Nodemailer
- Firebase Admin
- Zod validation

## Repository Structure

```txt
project/
├── smart-money-manager-client/   # Next.js frontend
│   ├── src/app/                  # App Router pages and layouts
│   ├── src/components/           # Shared and module components
│   ├── src/services/             # API service functions
│   ├── src/types/                # Frontend TypeScript types
│   ├── src/validations/          # Zod validation schemas
│   └── src/proxy.ts              # Route protection proxy
└── smart-money-manager-server/   # Express backend
    ├── prisma/schema.prisma      # Prisma MongoDB schema
    ├── src/app/modules/          # Feature modules
    ├── src/routes/               # API route registration
    ├── src/configs/              # Environment config
    └── src/server.ts             # Server entry point
```

## Prerequisites

- Node.js 20 or later
- npm
- MongoDB database URL
- SMTP credentials for email/OTP flows
- Firebase service credentials if push notification features are enabled

## Repository Clone

Clone `smart-money-manager-client`:

```env
git clone https://github.com/MehediMehad/smart-money-manager-client.git
```

Clone `smart-money-manager-server`:

```env
git clone https://github.com/MehediMehad/smart-money-manager-server.git
```

## Environment Variables

Create a `.env.local` file inside `smart-money-manager-client`:

```env
NEXT_PUBLIC_BASE_API=http://localhost:5000/api/v1
```

Create a `.env` file inside `smart-money-manager-server`:

```env
APP_NAME=Smart Money Manager
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb+srv://USER:PASSWORD@HOST/DATABASE

CLIENT_ORIGIN=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

SUPPER_ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password

JWT_ACCESS_SECRET=change-this-access-secret
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_SECRET=change-this-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d
JWT_RESET_PASS_SECRET=change-this-reset-secret
JWT_RESET_PASS_EXPIRES_IN=10m
BCRYPT_SALT_ROUNDS=12
access_cookie_max_age=7
REFRESH_COOKIE_MAX_AGE=30

```

## Installation

Install client dependencies:

```bash
cd smart-money-manager-client
npm install
```

Install server dependencies:

```bash
cd ../smart-money-manager-server
npm install
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

## Run Locally

Start the API server:

```bash
cd smart-money-manager-server
npm run dev
```

Start the Next.js client in another terminal:

```bash
cd smart-money-manager-client
npm run dev
```

Open the app at:

```txt
http://localhost:3000
```

The API health check is available at:

```txt
http://localhost:5000
```

## Available Scripts

Client scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run lint:fix
```

Server scripts:

```bash
npm run dev
npm run build
npm run start
npm run worker
npm run worker:start
npm run prisma:generate
npm run prisma:studio
npm run lint
npm run lint:fix
npm run format
npm run check-format
```

## Main API Routes

All server routes are prefixed with `/api/v1`.

- `/auth` - register, login, OTP verification, password reset, refresh token, profile, change password
- `/dashboard` - dashboard summary data
- `/today` - today's financial activity
- `/categories` - category management
- `/incomes` - income records
- `/expenses` - expense records
- `/budgets` - budget records
- `/savings-goals` - savings goals and savings transactions
- `/debts` - debt records

## Dashboard Modules

- `dashboard` - financial overview
- `income` - add, edit, view, and filter income
- `expense` - add, edit, view, and filter expenses
- `budget` - manage budgets
- `savings` - create goals and add saved amounts
- `debts` - manage given and taken debts
- `categories` - manage income and expense categories
- `today-update` - daily snapshot and updates

## Build

Build the server:

```bash
cd smart-money-manager-server
npm run build
```

Build the client:

```bash
cd smart-money-manager-client
npm run build
```

## Notes

- The server seeds a super admin and default categories when it starts.
- The backend uses MongoDB, so Prisma migrations are not used in the same way as SQL databases. Use `npm run prisma:generate` after schema changes.
- Keep `NEXT_PUBLIC_BASE_API` aligned with the server `PORT` and `/api/v1` prefix.
