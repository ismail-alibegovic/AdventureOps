# AdventureOps

**A booking engine and operations dashboard for a rafting company on the Neretva river (Konjic, Bosnia and Herzegovina).** Guests book a trip online; the team plans departures, assigns boats and guides, takes payments and handles cancellations from one admin.

> **Status:** working prototype. Data is stored in a JSON file on the server with demo departures generated on a rolling 30-day window, so it is suitable for demonstrating the workflow, not for production use. Moving storage to PostgreSQL is the next step.

**Demo:** [adventure-ops.vercel.app](https://adventure-ops.vercel.app)

---

## What it does

**Public site**
- Multi-step booking wizard: trip package → date and guests → details → confirmation pass
- Live per-day availability calendar based on departure capacity
- Package, safety, meeting-point and route sections; Bosnian and English interface

**Operations admin**
- Daily board and dashboard for the day's departures
- **Boat planner:** assign boats and guides to a departure and allocate each booking's guests across boats, with guards against over-allocation
- Bookings list and detail drawer, manual bookings, customers
- Payments, cancellations with reasons, reports and an audit log
- Content editor for the public site
- Role-based permissions on the server (owner, admin, dispatcher, guide)

## Architecture

```text
React + Vite SPA (public site and admin)
        │  REST, ~45 endpoints under /api
        ▼
Express server (TypeScript)
  routes/api.ts ──► services: availability · booking · allocation · departure
                              payment · cancellation · report · cms · notification · auth
        │
        ▼
JSON data store with an async write lock (prototype persistence)
```

Business rules live in service classes rather than route handlers, so they can be exercised by the built-in test suite (`server/tests/suite.ts`) and moved to a database-backed implementation without touching the UI.

## Tech stack

React · TypeScript · Vite · Tailwind CSS · Motion · Express · esbuild · Vercel

## Running locally

```bash
npm install
cp .env.example .env     # optional: e-mail settings
npm run dev              # starts the Express server with the Vite app
npm run lint             # TypeScript check
```

## Author

Built by [Ismail Alibegović](https://github.com/ismail-alibegovic) with AI-assisted development — Sarajevo, Bosnia and Herzegovina.
