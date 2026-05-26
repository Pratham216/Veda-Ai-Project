# VedaAI — AI Assessment Creator (Frontend)

Pixel-perfect Next.js implementation of the VedaAI Figma designs for the assessment-creator assignment.

## Stack

- **Next.js 16** with the App Router + **TypeScript**
- **Tailwind CSS v4** for styling
- **Zustand** for client state (form draft + assignments list)
- **lucide-react** for icons
- **Bricolage Grotesque** (via `next/font/google`)

## Running locally

```bash
cd web
npm install
npm run dev
```

The app starts on `http://localhost:3000` (or the next available port). The dev server uses Turbopack.

## Routes

| Route                       | Screen                                                              | Figma frame                  |
| --------------------------- | ------------------------------------------------------------------- | ---------------------------- |
| `/` → `/assignments`        | redirects                                                           | —                            |
| `/assignments` (seeded)     | filled state — grid of assignment cards, search + filter + 3-dot menu | `Filled State`               |
| `/assignments` (cleared)    | empty state — illustration + "Create Your First Assignment" CTA     | `0 State screen`             |
| `/assignments/new`          | create form — file upload, due date, question types, totals, additional info | `Upload Material - Selector` |
| `/assignments/[id]`         | output page — dark banner, question paper with sections, answer key | `Assignment Output`          |

On every page, the layout swaps between:

- Desktop: sidebar (logo, create/toolkit pill, nav with badges, school card) + topbar (back, breadcrumb, bell, John Doe).
- Mobile (`<lg`): white app-bar (logo + bell + avatar + menu), a slim back/breadcrumb row, and a bottom tab nav (Home, Assignments, Library, AI Toolkit) with a floating "+" FAB on the list page.

To see the **empty state**, click `Clear demo data` in the top-right of the assignments page; click `Seed demo data` to bring the demo back.

## Design tokens (extracted from the Figma)

These were pulled from the Figma REST API by walking every node and counting fills/strokes/fonts — they're not guesses:

| Token        | Value                       | Source                                    |
| ------------ | --------------------------- | ----------------------------------------- |
| Background   | `#F6F6F6`                   | page surfaces                             |
| Surface      | `#FFFFFF`                   | cards, dropdowns                          |
| Foreground   | `#181818`                   | primary text                              |
| Muted        | `#5E5E5E`                   | subtitles, captions                       |
| Mute-2       | `#A9A9A9`                   | placeholders                              |
| Border-soft  | `#DADADA`                   | inputs, dividers                          |
| Border-lilac | `#E1DCEB`                   | card / dropdown borders                   |
| Accent       | `#FF5623`                   | logo, "+" buttons, sidebar accents        |
| Dark         | `#181818` / `#2B2B2B`       | bottom nav, dark banner, primary pills    |
| Font family  | Bricolage Grotesque         | 400 / 500 / 600 / 700 / 800               |

The dark "Create Assignment" pill and the question-paper banner both use a radial orange glow over a near-black gradient (defined as `.btn-dark-glow` / `.banner-dark` utility classes in `globals.css`) which matches the Figma rendering.

## Project layout

```
web/src/
  app/
    layout.tsx                — root layout, font + globals
    page.tsx                  — redirect to /assignments
    (app)/
      layout.tsx              — sidebar + mobile topbar shell
      assignments/
        page.tsx              — filled + empty state
        new/page.tsx          — create form
        [id]/page.tsx         — generated paper output
      groups|toolkit|library|settings/page.tsx — stubs
  components/
    Sidebar.tsx               — desktop sidebar
    Topbar.tsx                — top app bar (responsive)
    MobileTopbar.tsx          — mobile-only logo header
    BottomNav.tsx             — mobile tab bar + FAB
    Logo.tsx
  store/
    useAssignmentStore.ts     — Zustand store: draft, assignments, sample result
```

## State management (Zustand)

The store keeps a single `draft` for the create form and a list of `assignments`. The form mutates `draft` via `setDraft`, `updateRow`, `addRow`, `removeRow`. On submit, `submitDraft()` snapshots the draft, attaches a generated result, prepends the assignment to the list, and returns the new id so the page can navigate to `/assignments/[id]`.

For demo purposes, ten sample assignments are seeded on first visit so the filled state matches the Figma. The output page reads the same store; a "Regenerate" button on the output page (desktop) routes back to the create form.

## Validation

The create form validates:

- Due date is required (and is auto-formatted as `DD-MM-YYYY` while typing).
- Each question-type row needs a count > 0 and marks > 0.
- At least one question-type row must exist.

Errors highlight the offending input with a red border. Negative numbers are blocked by the stepper.

## What's intentionally **not** built yet

The full assignment spec asks for a Node/Express backend with MongoDB, Redis, BullMQ, WebSocket updates, and a real LLM. This PR is **only the pixel-perfect frontend** — the LLM call is replaced with a deterministic `sampleResult()` so the output page renders content that matches the Figma. To complete the stack the planned shape is:

1. `POST /api/assignments` → enqueue a BullMQ job, return `{ id, status: "queued" }`.
2. Worker streams progress (`queued → generating → ready`) to the client over a WebSocket room keyed by assignment id.
3. The output page subscribes on mount; when the result lands it replaces the placeholder.

The frontend is already shaped for this — `Assignment.status` and `Assignment.result` are optional fields on the store, so a real worker can hydrate them without UI changes.

## Bonus: PDF export

Clicking **Download as PDF** on the output page calls `window.print()`. The paper article has `print:shadow-none print:border-0 print:max-w-none` so it prints cleanly without the sidebar or banner. A native PDF library (e.g. `@react-pdf/renderer`) would replace this for a fully designed export.

## Reproducing the design fidelity

The Figma file (`nB2HMm1BhTpmHcHrmEslGB`) was read via the Figma REST API:

- `GET /v1/files/{key}?depth=3` to enumerate frames.
- `GET /v1/files/{key}/nodes?ids=...` to pull text content, fills, strokes, font weights and sizes for every node.
- `GET /v1/images/{key}?ids=...&format=png&scale=2` to export each frame at 2x for side-by-side visual comparison while building.

The extraction script lives in `../scripts/extract-tokens.ps1`.
