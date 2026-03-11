# Net Gains — Implementation Tasks

**Deadline: 13 March 2026**

## Planning
- [x] Read and understand the PRD
- [x] Create implementation plan
- [/] Get user approval on updated plan

## Phase 1 — Project Scaffolding & Design System (1–2 Mar)
- [x] Initialise project structure (folders, `index.html`, CSS, JS entry)
- [x] Set up design system tokens (colors, typography, spacing, shadows)
- [x] Create `index.css` with global resets, variables, and utility classes
- [x] Add Google Fonts (Inter) and Phosphor Icons (duotone)
- [x] Build bottom navigation bar component
- [x] Create tab-switching logic (Home / Quests / Rewards)

## Phase 2 — Data Layer & Content (1–2 Mar)
- [x] Create `courses.json` with 3 weeks of course data (YouTube financial literacy video URLs per lesson)
- [x] Create `rewards.json` with tiered reward items
- [ ] Generate reward images (cartoon-style, professional, government-appropriate)
- [x] Build local-storage–based state manager (user profile, progress, coin ledger, rewards, journal entries)

## Phase 3 — Dashboard / Home Screen (3–4 Mar)
- [x] Build circular progress bar (SVG ring, coin count centre)
- [x] Build 7-node roadmap with day states (completed / active / upcoming / locked)
- [x] Build greeting header with name + streak count
- [x] Build task detail modal (video + quiz + challenge info)
- [x] Wire dashboard to state manager for real-time updates

## Phase 4 — Daily Task Loop (3–4 Mar)
- [x] Build video player with ≥ 90% watch gate
- [x] Build quiz component (5 MCQ questions, scoring)
- [x] Build practical challenge component (checkbox / self-report)
- [x] Build journal / reflection component (text area, tagged by lesson + day, saved to account)
- [ ] Build "My Journal" view (browse all past entries)
- [x] Implement pass/fail logic (≥ 80% combined)
- [x] Implement coin award with diminishing retries (100 → 75 → 50 → 25)
- [x] Implement retry loop (encouraging message → rewatch → reattempt)
- [x] Implement daily lock (prevent future-day tasks)

## Phase 5 — Quests & Courses Screen (5–6 Mar)
- [x] Build active course card (title, week, mini progress bar)
- [x] Build locked course cards (reduced opacity, lock icon)
- [x] Implement course unlock logic (≥ 6/7 days completed)
- [x] Build completed course card with review button

## Phase 6 — Rewards Center Screen (5–6 Mar)
- [x] Build coin balance header
- [x] Build reward card grid (2-column, tier badges)
- [x] Implement afford/disabled states
- [x] Implement redemption flow (deduct coins, confirmation animation)
- [x] Build "My Rewards" tab with redeemed items

## Phase 7 — Onboarding Carousel (7 Mar)
- [x] Build 3-screen onboarding overlay (weekly sprint model, daily task cap, coins/rewards)
- [x] Show on first visit only (localStorage flag)
- [x] Skip / dismiss button, dot indicators

## Phase 8 — Weekly Evaluation, Streak & Polish (7–8 Mar)
- [ ] Implement end-of-week evaluation (6/7 → reward, 7/7 → ×2 bonus)
- [ ] Implement streak counter and persistence
- [ ] Implement course transition (Locked → Active)
- [ ] Add micro-animations (node pulse, progress fill, confetti on pass)
- [ ] Add tab crossfade transitions (≤ 300 ms)
- [ ] Responsiveness audit (mobile-first, 375 px–768 px–1024 px)
- [ ] Create PWA manifest + service worker (video caching, offline quiz queue)

## Phase 9 — Local Server Testing (9–10 Mar)
- [ ] Start local dev server (`npx serve .`)
- [ ] Test onboarding flow (first visit vs return visit)
- [ ] Walkthrough all user stories (US-01 through US-17, + US-08c/08d)
- [ ] Test daily task loop end-to-end (watch → quiz → challenge → journal → coins)
- [ ] Test fail/retry loop with diminishing rewards
- [ ] Test weekly evaluation (6/7, 7/7, <6 scenarios)
- [ ] Test reward redemption + balance updates
- [ ] Test "My Journal" browsing
- [ ] Cross-browser check (Chrome, Safari, Edge)
- [ ] Fix any bugs found

## Phase 10 — Supabase Integration (11–12 Mar)
- [ ] Create Supabase project and configure Auth providers (Google, Apple, Facebook)
- [ ] Create database tables (users, courses, daily_tasks, quiz_questions, challenges, user_progress, coin_ledger, rewards, user_rewards, journal_entries)
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create `js/supabase.js` — client init + auth module
- [ ] Replace localStorage calls with Supabase queries in `store.js`
- [ ] Test auth flow (sign in → profile created)
- [ ] Test data sync (progress, coins, journal entries persisted to DB)
- [ ] Test RLS (user cannot access other users' data)

## Phase 11 — Vercel Deployment (13 Mar)
- [ ] Create `vercel.json` with SPA rewrite rules
- [ ] Set environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)
- [ ] Deploy to Vercel (`vercel --prod`)
- [ ] Verify production URL works end-to-end

## Phase 12 — Final Verification (13 Mar)
- [ ] Full walkthrough on production URL
- [ ] PWA install test (Chrome, mobile)
- [ ] Visual / UX final review on mobile viewport
- [ ] Cross-browser production check (Chrome, Safari, Edge)
