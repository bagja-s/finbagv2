# FinBag - Personal Finance Tracker

A modern, multi-user personal finance application built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

## Features

- 💰 **Transaction Management** - Track income, expenses, and transfers
- 🏦 **Multi-Wallet Support** - Cash, bank accounts, e-wallets, credit cards
- 📊 **Categories & Budgets** - Custom categories with budget tracking and alerts
- 🔄 **Recurring Transactions** - Automate regular income/expenses
- 📈 **Reports & Analytics** - Visual charts, trends, and export capabilities
- 🌍 **Multi-Currency** - Support for 14+ currencies with real-time exchange rates
- 🌐 **Internationalization** - Indonesian and English support
- 📱 **PWA Ready** - Installable, offline-capable progressive web app
- 🔐 **Secure Auth** - Email/password + OAuth (Google, GitHub) via Supabase
- 🎨 **Modern UI** - Built with Radix UI + Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database/Auth**: Supabase (PostgreSQL + Auth + Realtime)
- **Styling**: Tailwind CSS + Radix UI
- **Charts**: Chart.js + react-chartjs-2
- **Forms**: React Hook Form + Zod
- **i18n**: next-intl
- **PWA**: next-pwa (Workbox)
- **Testing**: Vitest + Playwright
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd finbag
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Run database migrations in Supabase SQL Editor:
   - Copy contents of `supabase/schema.sql`
   - Run in Supabase Dashboard > SQL Editor

5. Start development server:
```bash
pnpm dev
```

Visit `http://localhost:3000` - you'll be redirected to `/id` (Indonesian) or `/en` (English).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── [locale]/          # i18n routing
│   ├── globals.css        # Global styles + Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home redirect
├── components/
│   ├── ui/                # Base UI components (Button, Input, Card, etc.)
│   ├── charts/            # Chart components
│   ├── forms/             # Form components
│   └── layout/            # Layout components (Header, Sidebar, etc.)
├── hooks/                 # Custom React hooks
├── lib/
│   ├── supabase/          # Supabase client (browser, server, middleware)
│   ├── utils/             # Utility functions (currency, date, helpers)
│   ├── validations/       # Zod validation schemas
│   ├── hooks/             # Data fetching hooks
│   └── i18n.ts            # i18n configuration
├── messages/              # Translation files (id.json, en.json)
├── styles/                # Additional styles
└── types/                 # TypeScript types
```

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checking
pnpm test         # Run unit tests (Vitest)
pnpm test:ui      # Run tests with UI
pnpm test:e2e     # Run E2E tests (Playwright)
pnpm format       # Format code with Prettier
```

## Database Schema

The database includes tables for:
- **profiles** - User preferences (currency, timezone, language, theme)
- **wallets** - Multiple wallets per user (cash, bank, e-wallet, etc.)
- **categories** - Hierarchical categories for income/expense
- **transactions** - All financial transactions with relations
- **budgets** - Budget limits per category with alert thresholds
- **recurring_transactions** - Automated recurring transactions
- **exchange_rates** - Cached exchange rates

Row Level Security (RLS) ensures users only access their own data.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Supabase Setup

1. Create new Supabase project
2. Run `supabase/schema.sql` in SQL Editor
3. Enable Email/Password and OAuth providers in Authentication settings
4. Add redirect URLs for OAuth callbacks

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default locale (id/en) | No |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Default currency | No |
| `FRANKFURTER_API_BASE` | Exchange rate API base URL | No |

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please open a GitHub issue.