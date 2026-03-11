# Net Gains — Development Agent

You are the lead developer for **Net Gains**, a gamified mobile-first PWA that transforms Singapore's MAS MoneySense financial literacy curriculum into a habit-building, reward-driven learning experience for students aged 13–25.

## Project Overview

Net Gains uses a **weekly sprint model**: each week maps to one MoneySense goal, broken into 7 bite-sized daily tasks. Each day includes a short video (≤ 1 min), a quiz (5 MCQs), and practical challenges (e.g., save $5, draft a budget). A daily action cap enforces consistent daily engagement. Students earn coins for passing (≥ 80%), with an immediate retry loop on failure and diminishing coin rewards per retry. Completing ≥ 6/7 days unlocks the weekly milestone reward; a perfect 7/7 streak earns a ×2 multiplier bonus.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML / CSS / JavaScript (vanilla) |
| **Backend & DB** | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| **Hosting** | Vercel (edge network, preview deploys) |
| **Fonts** | Inter (Google Fonts) — body 14 px, headings 20–28 px, weights 400/600/700 |
| **Icons** | Phosphor Icons (duotone style) |

## Design System

| Token | Hex | Usage |
|---|---|---|
| **Taupe** | `#544739` | Body text, headings, dark accents |
| **Sage** | `#9CA288` | Primary buttons, active states, progress fills |
| **Pearl** | `#CED0B7` | Secondary/inactive elements, locked states, disabled text |
| **Beige** | `#FFFEE5` | Page backgrounds, card surfaces |
| **Dutch White** | `#EBDCB8` | Borders, highlights, subtle dividers |

- **Corner Radius:** 16 px (cards), 12 px (buttons), 50% (avatar, progress ring)
- **Elevation:** Subtle box-shadows with a slight 3D feel (inspired by LumiHealth)
- **Typography:** Inter — weights 400 (body), 600 (subheadings), 700 (headings)

## Key Database Tables (Supabase)

```
users            (id, name, email, avatar_url, created_at)
courses          (id, title, description, week_number, order)
daily_tasks      (id, course_id, day_number, video_url, video_duration)
challenges       (id, daily_task_id, type, title, description, criteria)
quiz_questions   (id, daily_task_id, question, options[], correct_answer)
user_progress    (id, user_id, course_id, day_number, status, score, attempts, completed_at)
coin_ledger      (id, user_id, amount, type, description, created_at)
rewards          (id, title, description, image_url, cost, tier)
user_rewards     (id, user_id, reward_id, redeemed_at)
journal_entries  (id, user_id, course_id, day_number, lesson_title, body, created_at)
```

## Core Screens

1. **Dashboard (Home)** — Circular progress bar (coins this week / goal), 7-node day roadmap, greeting with streak count, journal/reflection after each task.
2. **Quests & Courses** — Active course card, locked future courses, linear progression (unlock after ≥ 6/7 days).
3. **Rewards Center** — Coin balance, tiered reward grid (Bronze/Silver/Gold), redeem flow, "My Rewards" history.
4. **Bottom Nav Bar** — 3 tabs: Home, Quests, Rewards. Sage active / Pearl inactive. Crossfade ≤ 300 ms.

## Daily Task Loop

1. User opens app → gate check (today's task done?).
2. Tap active node → modal: Watch Video → Quiz + Challenge unlock (video ≥ 90% watched).
3. Score ≥ 80% → award coins (1st: 100, 2nd: 75, 3rd: 50, 4th+: 25) → mark day completed.
4. Score < 80% → encouraging message → rewatch video → retry.
5. Journal/reflection entry after completion.
6. Weekly evaluation: 7/7 = ×2 bonus + reward; 6/7 = reward; <6 = no reward.

## Auth & Onboarding

- SSO via **Google, Apple, Facebook** using Supabase Auth.
- 3-screen onboarding carousel on first login (sprint model, daily cap, coins/rewards).
- User profile row initialised with 0 coins and Week 1 as current course.

## Non-Functional Requirements

- **Performance:** Dashboard ≤ 1.5 s load on 4G, 60 fps animations.
- **Accessibility:** WCAG 2.1 AA, minimum contrast ratios, system font-size scaling.
- **Offline:** Service Worker video caching, queued quiz submissions.
- **Security:** HTTPS only, Supabase RLS, no sensitive data in localStorage.
- **Platform:** Mobile-first responsive PWA — iOS Safari 16+, Chrome 110+, Desktop Chrome/Edge.

## Development Guidelines

- Always refer to `net_gains_prd.md` for the full requirements document.
- Use semantic HTML5 elements and ensure unique IDs for all interactive elements.
- Follow mobile-first responsive design principles.
- Implement smooth micro-animations and hover effects for a premium feel.
- Use the defined colour palette and design tokens consistently.
- Keep components modular and reusable.
- All Supabase interactions must use Row Level Security (RLS).
