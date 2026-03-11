/**
 * store.js
 * State management layer with Supabase backend and localStorage fallback/cache.
 */

import { supabase } from './supabase.js';

const STORAGE_KEY = 'ng_state';

/** Default state shape for new users */
function createDefaultState() {
    return {
        user: {
            id: null,
            name: '',
            email: '',
            avatar_url: null
        },
        currentCourseId: 'course-w1',
        progress: {},
        coinBalance: 0,
        coinLedger: [],
        redeemedRewards: [],
        journalEntries: [],
        streakData: {
            currentStreak: 0,
            lastCompletedDate: null,
            longestStreak: 0
        },
        onboardingComplete: false,
        weekStartDate: null
    };
}

class Store {
    constructor() {
        this._state = createDefaultState();
        this._listeners = {};
        this._taskMap = {}; // mapping courseSlug_day -> taskId
        this._courseMap = {}; // mapping courseSlug -> courseId
        this._rewardMap = {}; // mapping rewardSlug -> rewardId
    }

    /* ------------------------------------------------------------------ */
    /*  Event Emitter (for reactive UI updates across modules)             */
    /* ------------------------------------------------------------------ */

    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(fn => fn !== callback);
    }

    emit(event, data) {
        if (!this._listeners[event]) return;
        for (const fn of this._listeners[event]) {
            try { fn(data); } catch (e) { console.error(`[Store] Event listener error (${event}):`, e); }
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Initialisation                                                     */
    /* ------------------------------------------------------------------ */

    /** Load state from Supabase into memory */
    async init(userId) {
        this._state.user.id = userId;

        try {
            // 1. Load mapping data for DB foreign keys
            const [
                { data: courses },
                { data: tasks },
                { data: rewards }
            ] = await Promise.all([
                supabase.from('courses').select('id, slug'),
                supabase.from('daily_tasks').select('id, day_number, course_id, courses(slug)'),
                supabase.from('rewards').select('id, slug')
            ]);
            
            courses?.forEach(c => this._courseMap[c.slug] = c.id);
            tasks?.forEach(t => this._taskMap[`${t.courses.slug}_${t.day_number}`] = t.id);
            rewards?.forEach(r => this._rewardMap[r.slug] = r.id);

            // 2. Load user's data
            const [
                { data: progress },
                { data: ledger },
                { data: userRewards },
                { data: journal }
            ] = await Promise.all([
                supabase.from('user_progress').select('*, daily_tasks(day_number), courses(slug)').eq('user_id', userId),
                supabase.from('coin_ledger').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
                supabase.from('user_rewards').select('*, rewards(slug)').eq('user_id', userId),
                supabase.from('journal_entries').select('*, courses(slug)').eq('user_id', userId)
            ]);

            // Rebuild Progress tree
            this._state.progress = {};
            progress?.forEach(p => {
                const cSlug = p.courses.slug;
                const dayStr = p.daily_tasks.day_number.toString();
                if (!this._state.progress[cSlug]) this._state.progress[cSlug] = {};
                this._state.progress[cSlug][dayStr] = {
                    status: p.status,
                    score: p.quiz_score,
                    attempts: p.attempts,
                    completedAt: p.completed_at
                };
            });

            // Rebuild Ledger
            this._state.coinLedger = (ledger || []).map(l => ({
                id: l.id,
                amount: l.amount,
                type: l.transaction_type,
                description: l.description,
                createdAt: l.created_at,
                _doubled: l.is_doubled
            }));
            this._state.coinBalance = this._state.coinLedger.reduce((sum, txn) => sum + txn.amount, 0);

            // Rebuild Rewards
            this._state.redeemedRewards = (userRewards || []).map(ur => ({
                rewardId: ur.rewards.slug,
                redeemedAt: ur.redeemed_at
            }));

            // Rebuild Journal
            this._state.journalEntries = (journal || []).map(j => ({
                id: j.id,
                courseId: j.courses.slug,
                dayNumber: j.day_number,
                lessonTitle: j.lesson_title,
                body: j.body,
                createdAt: j.created_at
            }));

            // Optional: fallback missing preferences from localStorage if needed,
            // but for NetGains core data is now sourced from Supabase.
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const localState = JSON.parse(raw);
                this._state.currentCourseId = localState.currentCourseId || 'course-w1';
                this._state.onboardingComplete = localState.onboardingComplete || false;
                this._state.streakData = localState.streakData || this._state.streakData;
            }

        } catch (error) {
            console.error('[Store] Failed to initialize from Supabase:', error);
            // Fallback to local
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) this._state = JSON.parse(raw);
        }

        this._persistLocal();
        return this._state;
    }

    /** Write current state to localStorage for offline cache */
    _persistLocal() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
        } catch (e) {
            console.error('[Store] Failed to persist state:', e);
        }
    }

    /* ------------------------------------------------------------------ */
    /*  User                                                               */
    /* ------------------------------------------------------------------ */

    getUser() {
        return { ...this._state.user };
    }

    async updateUser(data) {
        this._state.user = { ...this._state.user, ...data };
        this._persistLocal();
        
        if (this._state.user.id) {
            await supabase.from('users').update({
                name: this._state.user.name,
                email: this._state.user.email
            }).eq('id', this._state.user.id);
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Progress                                                           */
    /* ------------------------------------------------------------------ */

    /**
     * Get progress for a specific day within a course.
     * Returns null if no progress recorded yet.
     */
    getProgress(courseId, dayNumber) {
        const courseProgress = this._state.progress[courseId];
        if (!courseProgress) return null;
        return courseProgress[dayNumber] || null;
    }

    /**
     * Update (or create) progress for a specific day.
     * @param {string} courseId
     * @param {number} dayNumber 1-7
     * @param {object} data  { status, score, attempts, completedAt }
     */
    async updateProgress(courseId, dayNumber, data) {
        if (!this._state.progress[courseId]) {
            this._state.progress[courseId] = {};
        }
        const existing = this._state.progress[courseId][dayNumber] || {};
        const merged = { ...existing, ...data };
        this._state.progress[courseId][dayNumber] = merged;
        this._persistLocal();
        this.emit('progress:updated', { courseId, dayNumber, data: merged });

        // Sync to Supabase
        const taskId = this._taskMap[`${courseId}_${dayNumber}`];
        const cId = this._courseMap[courseId];
        if (this._state.user.id && taskId && cId) {
            const row = {
                user_id: this._state.user.id,
                task_id: taskId,
                course_id: cId,
                status: merged.status || 'not_started',
                quiz_score: merged.score || null,
                attempts: merged.attempts || 0,
                completed_at: merged.completedAt || null
            };
            
            // Supabase upsert requires knowing the primary key or unique constraint.
            // user_progress has a UNIQUE (user_id, task_id)
            await supabase.from('user_progress').upsert(row, { onConflict: 'user_id,task_id' });
        }
    }

    /**
     * Returns an array of 7 day-progress objects for a course.
     * Each element is the progress object or null.
     */
    getWeeklyProgress(courseId) {
        const result = [];
        for (let d = 1; d <= 7; d++) {
            result.push(this.getProgress(courseId, d));
        }
        return result;
    }

    /* ------------------------------------------------------------------ */
    /*  Coins                                                              */
    /* ------------------------------------------------------------------ */

    getCoinBalance() {
        return this._state.coinBalance;
    }

    /**
     * Award coins and record a ledger entry.
     * @param {number} amount
     * @param {string} type   e.g. 'task', 'streak_bonus', 'weekly_reward'
     * @param {string} description  human-readable
     */
    async awardCoins(amount, type, description) {
        const entry = {
            id: 'txn-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            amount,
            type,
            description,
            createdAt: new Date().toISOString()
        };
        this._state.coinLedger.push(entry);
        this._state.coinBalance += amount;
        this._persistLocal();
        this.emit('coins:changed', { balance: this._state.coinBalance, entry });

        if (this._state.user.id) {
            await supabase.from('coin_ledger').insert({
                user_id: this._state.user.id,
                amount: amount,
                transaction_type: type,
                description: description,
                is_doubled: false
            });
        }
        return entry;
    }

    /**
     * Get total coins earned from the ledger for a specific course.
     * Includes task coins and streak bonuses, excludes redemptions.
     * @param {string} courseId
     * @returns {number}
     */
    getWeeklyCoinsFromLedger(courseId) {
        let total = 0;
        for (const entry of this._state.coinLedger) {
            if (
                (entry.type === 'task' || entry.type === 'streak_bonus') &&
                entry.description &&
                entry.description.includes(courseId)
            ) {
                total += entry.amount;
            }
        }
        return total;
    }

    getCoinLedger() {
        return [...this._state.coinLedger];
    }

    /* ------------------------------------------------------------------ */
    /*  Weekly evaluation                                                  */
    /* ------------------------------------------------------------------ */

    /**
     * Evaluate a week's progress for a course.
     * @returns {{ daysCompleted: number, weeklyRewardUnlocked: boolean, perfectWeek: boolean }}
     */
    evaluateWeek(courseId) {
        const weekly = this.getWeeklyProgress(courseId);
        let daysCompleted = 0;
        for (const day of weekly) {
            if (day && day.status === 'completed') daysCompleted++;
        }
        return {
            daysCompleted,
            weeklyRewardUnlocked: daysCompleted >= 6,
            perfectWeek: daysCompleted === 7
        };
    }

    /**
     * Apply x2 streak bonus to all task-type ledger entries for the given course
     * that have not already been doubled.
     */
    async applyStreakBonus(courseId) {
        let bonusTotal = 0;
        for (const entry of this._state.coinLedger) {
            if (
                entry.type === 'task' &&
                entry.description &&
                entry.description.includes(courseId) &&
                !entry._doubled
            ) {
                bonusTotal += entry.amount;
                entry._doubled = true;
            }
        }
        if (bonusTotal > 0) {
            await this.awardCoins(bonusTotal, 'streak_bonus', `Perfect week x2 bonus for ${courseId}`);
            
            // Also update the existing rows in Supabase to be marked as doubled
            if (this._state.user.id) {
                // To keep it simple, we just update all 'task' transactions for this user
                // where description like '%courseId%'.
                await supabase.from('coin_ledger')
                    .update({ is_doubled: true })
                    .eq('user_id', this._state.user.id)
                    .eq('transaction_type', 'task')
                    .like('description', `%${courseId}%`);
            }
        }
        this._persistLocal();
        return bonusTotal;
    }

    /**
     * Finalize a week: evaluate progress, apply bonuses, transition courses.
     * Should be called after the last task of a week is completed.
     *
     * @param {string} courseId
     * @param {Array} allCourses  — full course list (to find the next course)
     * @returns {{ daysCompleted, weeklyRewardUnlocked, perfectWeek, bonusAwarded, nextCourseId }}
     */
    async finalizeWeek(courseId, allCourses) {
        const evaluation = this.evaluateWeek(courseId);
        let bonusAwarded = 0;
        let nextCourseId = null;

        // Apply x2 streak bonus if perfect week
        if (evaluation.perfectWeek) {
            bonusAwarded = await this.applyStreakBonus(courseId);
        }

        // Unlock next course if ≥ 6/7 days completed
        if (evaluation.weeklyRewardUnlocked && allCourses) {
            nextCourseId = this.unlockNextCourse(courseId, allCourses);
        }

        const result = {
            ...evaluation,
            bonusAwarded,
            nextCourseId
        };

        this.emit('week:finalized', result);
        return result;
    }

    /**
     * Transition the next course from Locked → Active.
     * @param {string} currentCourseId
     * @param {Array} allCourses
     * @returns {string|null} the next courseId if unlocked, null otherwise
     */
    unlockNextCourse(currentCourseId, allCourses) {
        const currentCourse = allCourses.find(c => c.id === currentCourseId);
        if (!currentCourse) return null;

        const nextCourse = allCourses.find(c => c.order === currentCourse.order + 1);
        if (!nextCourse) return null; // no more courses

        // Only transition if user is still on the current course
        if (this._state.currentCourseId === currentCourseId) {
            this.setCurrentCourseId(nextCourse.id);
        }

        this.emit('course:unlocked', { courseId: nextCourse.id });
        return nextCourse.id;
    }

    /* ------------------------------------------------------------------ */
    /*  Rewards                                                            */
    /* ------------------------------------------------------------------ */

    /**
     * Redeem a reward: deduct coins and record the redemption.
     * @returns {boolean} true if successful, false if insufficient funds
     */
    async redeemReward(rewardId, cost) {
        if (this._state.coinBalance < cost) return false;
        
        const timestamp = new Date().toISOString();
        this._state.coinBalance -= cost;
        this._state.coinLedger.push({
            id: 'txn-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            amount: -cost,
            type: 'redemption',
            description: `Redeemed reward: ${rewardId}`,
            createdAt: timestamp
        });
        
        this._state.redeemedRewards.push({
            rewardId,
            redeemedAt: timestamp
        });
        this._persistLocal();
        
        if (this._state.user.id) {
            // Write to both coin_ledger and user_rewards
            await Promise.all([
                supabase.from('coin_ledger').insert({
                    user_id: this._state.user.id,
                    amount: -Math.abs(cost),
                    transaction_type: 'redemption',
                    description: `Redeemed reward: ${rewardId}`
                }),
                supabase.from('user_rewards').insert({
                    user_id: this._state.user.id,
                    reward_id: this._rewardMap[rewardId]
                })
            ]);
        }
        
        return true;
    }

    getRedeemedRewards() {
        return [...this._state.redeemedRewards];
    }

    isRewardRedeemed(rewardId) {
        return this._state.redeemedRewards.some(r => r.rewardId === rewardId);
    }

    /* ------------------------------------------------------------------ */
    /*  Streak                                                             */
    /* ------------------------------------------------------------------ */

    getStreak() {
        return { ...this._state.streakData };
    }

    /**
     * Update streak based on a task completion today.
     * Call after completing a daily task.
     */
    updateStreak() {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const streak = this._state.streakData;
        const last = streak.lastCompletedDate;

        if (last === today) {
            // Already updated today
            return streak;
        }

        // Check if yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (last === yesterdayStr) {
            streak.currentStreak += 1;
        } else {
            // Streak broken (or first time)
            streak.currentStreak = 1;
        }

        streak.lastCompletedDate = today;
        if (streak.currentStreak > streak.longestStreak) {
            streak.longestStreak = streak.currentStreak;
        }

        this._persistLocal();
        return { ...streak };
    }

    /* ------------------------------------------------------------------ */
    /*  Journal                                                            */
    /* ------------------------------------------------------------------ */

    /**
     * Save a journal entry.
     * @param {{ courseId: string, dayNumber: number, lessonTitle: string, body: string }} entry
     */
    async saveJournalEntry({ courseId, dayNumber, lessonTitle, body }) {
        const journalEntry = {
            id: 'j-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            courseId,
            dayNumber,
            lessonTitle,
            body,
            createdAt: new Date().toISOString()
        };
        this._state.journalEntries.push(journalEntry);
        this._persistLocal();
        
        if (this._state.user.id && this._courseMap[courseId]) {
            await supabase.from('journal_entries').insert({
                user_id: this._state.user.id,
                course_id: this._courseMap[courseId],
                day_number: dayNumber,
                lesson_title: lessonTitle,
                body: body
            });
        }
        
        return journalEntry;
    }

    /**
     * Get journal entries, optionally filtered by courseId.
     */
    getJournalEntries(courseId) {
        if (courseId) {
            return this._state.journalEntries.filter(e => e.courseId === courseId);
        }
        return [...this._state.journalEntries];
    }

    /* ------------------------------------------------------------------ */
    /*  Onboarding                                                         */
    /* ------------------------------------------------------------------ */

    isOnboardingComplete() {
        return this._state.onboardingComplete === true;
    }

    completeOnboarding() {
        this._state.onboardingComplete = true;
        this._persist();
    }

    /* ------------------------------------------------------------------ */
    /*  Day availability                                                   */
    /* ------------------------------------------------------------------ */

    /**
     * Check if a specific day is available to the user.
     * Day 1 = Monday .. Day 7 = Sunday.
     * A day is available if:
     *   1. The current day-of-week >= dayNumber, AND
     *   2. All previous days in the week are completed or today.
     *
     * For the MVP demo: we treat the current calendar week (Mon-Sun).
     */
    isDayAvailable(courseId, dayNumber) {
        // Convert JS getDay (0=Sun) to our format (1=Mon..7=Sun)
        const jsDay = new Date().getDay();
        const todayNumber = jsDay === 0 ? 7 : jsDay;

        // Future days are locked
        if (dayNumber > todayNumber) return false;

        // Today is always available (even if previous incomplete, for demo flexibility)
        if (dayNumber === todayNumber) return true;

        // Past days are available (they can still be completed retroactively)
        return true;
    }

    /**
     * Check if a task has been completed today (prevents duplicate coins).
     */
    isTaskCompletedToday(courseId, dayNumber) {
        const progress = this.getProgress(courseId, dayNumber);
        if (!progress || progress.status !== 'completed') return false;
        const today = new Date().toISOString().split('T')[0];
        return progress.completedAt && progress.completedAt.startsWith(today);
    }

    /* ------------------------------------------------------------------ */
    /*  Current course                                                     */
    /* ------------------------------------------------------------------ */

    getCurrentCourseId() {
        return this._state.currentCourseId;
    }

    setCurrentCourseId(courseId) {
        this._state.currentCourseId = courseId;
        this._persist();
    }

    /* ------------------------------------------------------------------ */
    /*  Week start tracking                                                */
    /* ------------------------------------------------------------------ */

    getWeekStartDate() {
        return this._state.weekStartDate;
    }

    setWeekStartDate(dateStr) {
        this._state.weekStartDate = dateStr;
        this._persist();
    }

    /* ------------------------------------------------------------------ */
    /*  Reset (for development / testing)                                  */
    /* ------------------------------------------------------------------ */

    resetAll() {
        this._state = createDefaultState();
        this._persist();
    }
}

/** Singleton store instance */
const store = new Store();
export default store;
