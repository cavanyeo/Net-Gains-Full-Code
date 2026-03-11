# Net Gains — Implementation Plan

**Target:** Fully functional MVP by **13 March 2026**

Build the **Net Gains** gamified financial literacy web app as a mobile-first, single-page application using vanilla HTML / CSS / JavaScript. Development follows a **three-stage approach**: (1) build with localStorage, (2) test on a local server, (3) integrate Supabase + deploy to Vercel.

---

## Development Timeline

| Dates | Phase | Focus |
|---|---|---|
| 1–2 Mar | 1–2 | Scaffolding, design system, data layer |
| 3–4 Mar | 3–4 | Dashboard + daily task loop |
| 5–6 Mar | 5–6 | Quests, Rewards, weekly eval |
| 7 Mar | 7 | Onboarding carousel |
| 8 Mar | 8 | Polish, animations, PWA |
| 9–10 Mar | 9 | Local server testing + bug fixes |
| 11–12 Mar | 10 | Supabase auth + database integration |
| 13 Mar | 11–12 | Vercel deployment + final verification |

---

## User Review Required

1. **Video content** — Placeholder YouTube embeds of general financial literacy videos relevant to each lesson topic will be used (not MoneySense-specific). Swap URLs once final videos are hosted.
2. **Rewards images** — Generated via Gemini image tool using a **cartoon-like, professional style** suitable for a government setting, catering to students (children through tertiary) and the elderly. Must not look AI-generated.

---

## Proposed Changes

### Design System & Scaffolding

#### [NEW] [index.html](file:///c:/Users/cavan/OneDrive/Documents/Net%20Gains%20(Antigravity)/index.html)
- Single HTML file with three `<section>` containers (home, quests, rewards)
- `<nav>` bottom bar with three tabs
- PWA `<meta>` tags, viewport, Inter font, Phosphor Icons CDN
- Onboarding overlay (3-screen carousel) shown on first visit

#### [NEW] [index.css](file:///c:/Users/cavan/OneDrive/Documents/Net%20Gains%20(Antigravity)/index.css)
- CSS custom properties matching design tokens (Taupe, Sage, Pearl, Beige, Dutch White)
- Typography scale (Inter, 14/20/24/28 px, weights 400/600/700)
- Corner radii, elevation shadows, transitions
- Global reset and mobile-first responsive layout
- Component styles: progress ring, roadmap nodes, cards, modals, nav bar, quiz, reward grid, journal

---

### Data Layer

#### [NEW] [data/courses.json](file:///c:/Users/cavan/OneDrive/Documents/Net%20Gains%20(Antigravity)/data/courses.json)
- 3 course objects (Week 1–3), each with title, description, week_number
- 7 daily tasks per course, each with: video URL, video duration, quiz questions (5 MCQ each), challenge info

#### [NEW] [data/rewards.json](file:///c:/Users/cavan/OneDrive/Documents/Net%20Gains%20(Antigravity)/data/rewards.json)
- Array of ~8 reward items across Bronze / Silver / Gold tiers
- Fields: id, title, description, image, cost, tier

#### [NEW] [js/store.js](file:///c:/Users/cavan/OneDrive/Documents/Net%20Gains%20(Antigravity)/js/store.js)
- `Store` class wrapping `localStorage` (designed for easy swap to Supabase client later)
- Methods: `getUser()`, `updateProgress()`, `awardCoins()`, `getWeeklyProgress()`, `redeemReward()`, `getStreak()`, `evaluateWeek()`, `saveJournalEntry()`, `getJournalEntries()`
- Handles coin ledger, user progress, redeemed rewards, journal entries

---

### Application Logic

#### [NEW] [js/main.js](file:///c:/Users/cavan/OneDrive/Documents/Net%20Gains%20(Antigravity)/js/main.js)
- Bootstrap + tab router (Home / Quests / Rewards), crossfade transitions ≤ 300 ms
- Onboarding carousel logic (show once, skip on return visit)
- Event delegation for all interactive elements

#### [NEW] [js/dashboard.js](file:///c:/Users/cavan/OneDrive/Documents/Net%20Gains%20(Antigravity)/js/dashboard.js)
- `renderDashboard()` — builds greeting, circular SVG progress ring, 7-node roadmap
- Roadmap node tap → task detail modal
- Locked node tap → "unlocks on [Day]" disabled modal
- Real-time update on task completion

#### [NEW] [js/task.js](file:///c:/Users/cavan/OneDrive/Documents/Net%20Gains%20(Antigravity)/js/task.js)
- Video player component with 90% watch-time gate
- Quiz component (5 MCQs, radio inputs, score calculation)
- Challenge component (self-report checkbox or short input)
- **Journal / Reflection component** — text area where users write paragraphs about their work logs and reflections on what they learned. Entries are tagged with the lesson title and day number, saved to the user's account, and accessible anytime via a "My Journal" view
- Combined score evaluation (≥ 80% pass)
- Coin award with diminishing retries (100 / 75 / 50 / 25)
- Fail → encouraging message → rewatch → retry loop
- Daily lock enforcement (compare `Date()` to task day)

#### [NEW] [js/quests.js](file:///c:/Users/cavan/OneDrive/Documents/Net%20Gains%20(Antigravity)/js/quests.js)
- `renderQuests()` — active course card + locked future cards + completed cards
- Course unlock logic triggered by weekly evaluation (≥ 6/7 days)
- "Review" button on completed courses (replay videos, no coins)

#### [NEW] [js/rewards.js](file:///c:/Users/cavan/OneDrive/Documents/Net%20Gains%20(Antigravity)/js/rewards.js)
- `renderRewards()` — coin balance header + 2-column reward grid
- Afford/disabled card states based on balance
- Redeem flow: deduct coins, update ledger, show confirmation animation
- "My Rewards" sub-tab listing redeemed items + timestamps

---

### Generated Assets

#### [NEW] `assets/` directory
- App logo / icon (generated via image tool)
- Reward tier images (Bronze, Silver, Gold — cartoon-like, professional, government-appropriate)

---

### PWA & Polish

#### [NEW] [manifest.json](file:///c:/Users/cavan/OneDrive/Documents/Net%20Gains%20(Antigravity)/manifest.json)
- PWA manifest with app name, icons, theme colour, display: standalone

#### [NEW] [sw.js](file:///c:/Users/cavan/OneDrive/Documents/Net%20Gains%20(Antigravity)/sw.js)
- Service worker: cache-first for static assets, network-first for data
- Offline video cache + offline quiz submission queue

---

### Supabase Integration (Phase 10)

#### [NEW] [js/supabase.js](file:///c:/Users/cavan/OneDrive/Documents/Net%20Gains%20(Antigravity)/js/supabase.js)
- Initialise Supabase client with project URL + anon key
- Auth module: Google SSO, Apple Sign-In, Facebook Login via `supabase.auth.signInWithOAuth()`
- Auth state listener → create/load user profile
- Replace localStorage calls in `store.js` with Supabase queries:
  - `user_progress` → `supabase.from('user_progress').select/upsert()`
  - `coin_ledger` → `supabase.from('coin_ledger').insert()`
  - `user_rewards` → `supabase.from('user_rewards').insert()`
  - `journal_entries` → `supabase.from('journal_entries').insert/select()`
- Row Level Security (RLS) policies: users can only read/write their own data

---

### Vercel Deployment (Phase 11–12)

#### [NEW] [vercel.json](file:///c:/Users/cavan/OneDrive/Documents/Net%20Gains%20(Antigravity)/vercel.json)
- Vercel config for static site deployment
- Rewrite rules for SPA routing
- Environment variables for Supabase URL + anon key

**Deployment steps:**
1. Install Vercel CLI (`npm i -g vercel`)
2. Run `vercel` from project root
3. Set environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)
4. Verify preview deploy, then promote to production

---

## File Summary

| File | Purpose |
|---|---|
| `index.html` | Single-page shell, all sections + modals + onboarding |
| `index.css` | Full design system + component styles |
| `js/main.js` | Router, tab switching, onboarding |
| `js/store.js` | localStorage data layer (Supabase-swappable) |
| `js/dashboard.js` | Home screen rendering |
| `js/task.js` | Daily task loop (video + quiz + challenge + journal) |
| `js/quests.js` | Quests & courses screen |
| `js/rewards.js` | Rewards center screen |
| `js/supabase.js` | Supabase client, auth, DB queries |
| `data/courses.json` | 3 weeks of course + task content |
| `data/rewards.json` | Reward catalog |
| `manifest.json` | PWA manifest |
| `vercel.json` | Vercel deployment config |
| `sw.js` | Service worker |

---

## Verification Plan

### Phase 9 — Local Server Testing

All tests run against a local dev server (`npx serve .` or Python `http.server`):

1. **Onboarding** — Fresh visit shows 3-screen carousel. Dismiss, refresh — carousel does not reappear.
2. **Tab navigation** — Click each bottom-nav tab, verify correct section visible and active icon colour is Sage.
3. **Roadmap states** — Day 1 node is active (pulsing), Days 2–7 are locked. Click Day 1, confirm modal opens.
4. **Daily task loop** — Play video (simulate 90%), submit quiz with all correct answers, complete challenge, write journal entry, verify coins = 100, node turns ✅, progress ring updates.
5. **Fail & retry** — Submit quiz with <80% score, verify encouraging message, redirect to rewatch, second-attempt coins = 75.
6. **Journal** — Open "My Journal" view, verify entries are tagged and browsable.
7. **Weekly evaluation** — Simulate 6/7 days → reward unlocked + next course unlocked. Simulate 7/7 → ×2 multiplier applied.
8. **Reward redemption** — Click affordable reward, verify balance deduction and "My Rewards" list update.

### Phase 10 — Supabase Integration Testing

1. **Auth flow** — Sign in with Google, verify user profile row created in Supabase.
2. **Data sync** — Complete a daily task, verify `user_progress`, `coin_ledger`, `journal_entries` rows created in Supabase dashboard.
3. **RLS** — Confirm a user cannot read/write another user's data.

### Phase 11–12 — Vercel Deployment Verification

1. **Deploy** — Run `vercel --prod`, verify build succeeds.
2. **Live check** — Open production URL, walk through full user flow.
3. **PWA install** — Verify "Install App" prompt and standalone mode.
4. **Cross-browser** — Chrome, Safari, Edge on mobile + desktop viewports.
