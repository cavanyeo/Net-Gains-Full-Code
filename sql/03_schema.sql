-- ============================================================
-- 03_fix_schema.sql
-- Run this in the Supabase SQL Editor INSTEAD of
-- 01_create_tables.sql (which was written before we knew
-- your existing schema).
--
-- What this does:
--   • Drops the 5 content tables that had the wrong structure
--     (courses, daily_tasks, quiz_questions, challenges, rewards)
--     and the 2 tables that depend on them (user_progress,
--     user_rewards). These are all empty so no data is lost.
--   • Leaves the 3 user tables untouched:
--     users, coin_ledger, journal_entries.
--   • Recreates all 7 tables with the correct structure.
-- ============================================================


-- ── Step 1: Drop dependent tables first (they have FKs into content tables) ──

DROP TABLE IF EXISTS public.user_progress  CASCADE;
DROP TABLE IF EXISTS public.user_rewards   CASCADE;

-- ── Step 2: Drop content tables ───────────────────────────────────────────────

DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.challenges     CASCADE;
DROP TABLE IF EXISTS public.daily_tasks    CASCADE;
DROP TABLE IF EXISTS public.rewards        CASCADE;
DROP TABLE IF EXISTS public.courses        CASCADE;


-- ── Step 3: Recreate content tables ──────────────────────────────────────────

-- 3a. Courses (3 rows: Budgeting Basics, Smart Saving, Scam Awareness)
CREATE TABLE public.courses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug        TEXT UNIQUE NOT NULL,   -- 'course-w1' / 'course-w2' / 'course-w3'
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    week_number INT  NOT NULL,
    sort_order  INT  NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3b. Daily tasks — these are LESSON CONTENT (7 per course = 21 total)
--     Not to be confused with user to-do tasks
CREATE TABLE public.daily_tasks (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug           TEXT UNIQUE NOT NULL,   -- 'w1d1', 'w1d2', …, 'w3d7'
    course_id      UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    day_number     INT  NOT NULL,
    title          TEXT NOT NULL,
    video_url      TEXT NOT NULL,
    video_duration INT  NOT NULL,          -- seconds
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3c. Quiz questions (5 per daily task = 105 total)
CREATE TABLE public.quiz_questions (
    id             UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug           TEXT  UNIQUE NOT NULL,  -- 'w1d1q1', 'w1d1q2', …
    task_id        UUID  NOT NULL REFERENCES public.daily_tasks(id) ON DELETE CASCADE,
    question       TEXT  NOT NULL,
    options        JSONB NOT NULL,         -- array of 4 answer strings
    correct_answer INT   NOT NULL,         -- 0-indexed
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3d. Challenges (1 per daily task = 21 total)
CREATE TABLE public.challenges (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug        TEXT UNIQUE NOT NULL,  -- 'w1d1c', 'w1d2c', …
    task_id     UUID NOT NULL REFERENCES public.daily_tasks(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,         -- 'action' | 'reflection' | 'research'
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    criteria    TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3e. Rewards (9 total, unlocked with coins)
CREATE TABLE public.rewards (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug        TEXT    UNIQUE NOT NULL,  -- 'reward-b1', 'reward-s1', …
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL,
    icon        TEXT    NOT NULL,         -- Phosphor icon class, e.g. 'ph-duotone ph-trophy'
    cost        INT     NOT NULL,
    tier        TEXT    NOT NULL,         -- 'bronze' | 'silver' | 'gold'
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── Step 4: Recreate the two dependent tables ─────────────────────────────────

-- Tracks which tasks a user has completed and their quiz scores
CREATE TABLE public.user_progress (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES public.users(id)       ON DELETE CASCADE,
    task_id      UUID NOT NULL REFERENCES public.daily_tasks(id) ON DELETE CASCADE,
    course_id    UUID NOT NULL REFERENCES public.courses(id)     ON DELETE CASCADE,
    status       TEXT NOT NULL DEFAULT 'not_started'
                 CHECK (status IN ('not_started', 'in_progress', 'completed')),
    quiz_score   INT,                    -- 0–100
    attempts     INT  NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, task_id)            -- one progress row per user per task
);

-- Tracks which rewards a user has redeemed
CREATE TABLE public.user_rewards (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES public.users(id)   ON DELETE CASCADE,
    reward_id   UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, reward_id)          -- can't redeem the same reward twice
);
