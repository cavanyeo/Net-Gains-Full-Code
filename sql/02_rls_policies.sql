-- ============================================================
-- 02_rls_policies.sql
-- Run this AFTER seeding data (after running scripts/seed.js).
--
-- Content tables (courses, daily_tasks, quiz_questions,
-- challenges, rewards) → public read, no public write.
--
-- User tables (users, user_progress, coin_ledger,
-- user_rewards, journal_entries) → users can only read/write
-- their own rows.
-- ============================================================


-- ── Content tables: enable RLS ────────────────────────────────────────────────

ALTER TABLE public.courses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards        ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can read course content
CREATE POLICY "Public read" ON public.courses        FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.daily_tasks    FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.challenges     FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.rewards        FOR SELECT USING (true);


-- ── User tables: enable RLS ───────────────────────────────────────────────────

ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_ledger     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Each user can only read and write their own rows
-- auth.uid() is the UUID Supabase Auth assigns to the logged-in user

CREATE POLICY "Own row" ON public.users
    FOR ALL USING (auth_id = auth.uid());

CREATE POLICY "Own row" ON public.user_progress
    FOR ALL USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Own row" ON public.coin_ledger
    FOR ALL USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Own row" ON public.user_rewards
    FOR ALL USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Own row" ON public.journal_entries
    FOR ALL USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));
