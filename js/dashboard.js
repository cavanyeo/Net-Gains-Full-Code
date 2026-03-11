/**
 * dashboard.js
 * Renders the Home / Dashboard view with greeting, progress ring,
 * weekly roadmap, and task detail modals.
 */

import store from './store.js';
import { openTaskModal, renderJournalView } from './task.js';
import { signOut } from './supabase.js';
import { fetchCourses } from './data.js';

/** Load courses JSON (cached after first fetch) */
async function loadCourses() {
    return await fetchCourses();
}

/**
 * Main render function for the dashboard.
 * Fully rebuilds the view-home content.
 */
export async function renderDashboard() {
    const container = document.querySelector('#view-home .view-body');
    if (!container) return;

    const courses = await loadCourses();
    const courseId = store.getCurrentCourseId();
    const course = courses.find(c => c.id === courseId) || courses[0];
    const user = store.getUser();
    const streak = store.getStreak();
    const weeklyProgress = store.getWeeklyProgress(courseId);
    const evaluation = store.evaluateWeek(courseId);
    const balance = store.getCoinBalance();

    // Calculate weekly coins earned from ledger (more accurate than progress.coinsEarned)
    const weeklyGoal = 700;
    const weeklyCoins = store.getWeeklyCoinsFromLedger(courseId);
    const progressPercent = Math.min((weeklyCoins / weeklyGoal) * 100, 100);

    container.innerHTML = `
        <div class="dashboard-top-bar" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-lg);">
            <div class="dashboard-greeting" style="margin-bottom: 0;">
                <h2 class="greeting-text">Hey ${escapeHtml(user.name)}!</h2>
                <div class="streak-badge">
                    <i class="ph-duotone ph-fire"></i>
                    <span>${streak.currentStreak}-day streak</span>
                </div>
            </div>
            <button class="btn-logout" id="btn-logout" aria-label="Sign Out" style="background: none; border: none; font-size: 24px; color: var(--clr-taupe); cursor: pointer; padding: 4px; border-radius: 4px; opacity: 0.7; transition: opacity 0.2s;">
                <i class="ph-bold ph-sign-out"></i>
            </button>
        </div>

        <div class="progress-ring-container">
            <svg class="progress-ring" viewBox="0 0 180 180" width="180" height="180">
                <circle class="progress-ring-bg"
                    cx="90" cy="90" r="78"
                    fill="none" stroke="var(--clr-pearl)" stroke-width="12" />
                <circle class="progress-ring-fill"
                    cx="90" cy="90" r="78"
                    fill="none" stroke="var(--clr-sage)" stroke-width="12"
                    stroke-linecap="round"
                    stroke-dasharray="${2 * Math.PI * 78}"
                    stroke-dashoffset="${2 * Math.PI * 78 * (1 - progressPercent / 100)}"
                    transform="rotate(-90 90 90)" />
            </svg>
            <div class="progress-ring-label">
                <span class="progress-coins">${weeklyCoins}</span>
                <span class="progress-divider">/ ${weeklyGoal}</span>
                <span class="progress-unit">coins</span>
            </div>
        </div>

        <div class="week-label">
            Week ${course.week_number} &middot; ${escapeHtml(course.title)}
        </div>

        <div class="roadmap-scroll">
            <div class="roadmap-track">
                ${buildRoadmapNodes(course, weeklyProgress, courseId)}
            </div>
        </div>

        ${evaluation.weeklyRewardUnlocked ? `
        <div class="weekly-reward-banner card">
            <i class="ph-duotone ph-confetti"></i>
            <div>
                <strong>Weekly Reward Unlocked!</strong>
                <p>${evaluation.perfectWeek
                ? 'Perfect week! x2 coin multiplier applied.'
                : 'Great job completing 6 out of 7 days!'}</p>
            </div>
        </div>` : ''}

        <button class="btn-secondary journal-access-btn" id="btn-my-journal">
            <i class="ph-duotone ph-notebook"></i>
            My Journal
        </button>
    `;

    // Bind logout helper
    const btnLogout = document.getElementById('btn-logout');
    if(btnLogout) {
        btnLogout.addEventListener('click', async () => {
            await signOut();
        });
    }

    // Bind roadmap node click handlers
    container.querySelectorAll('.roadmap-node').forEach(node => {
        node.addEventListener('click', () => {
            const day = parseInt(node.dataset.day, 10);
            const status = node.dataset.status;
            handleNodeClick(courseId, day, status, course);
        });
    });

    // Bind journal button
    document.getElementById('btn-my-journal')?.addEventListener('click', () => {
        renderJournalView();
    });
}

/**
 * Build HTML for the 7-node roadmap row.
 */
function buildRoadmapNodes(course, weeklyProgress, courseId) {
    const jsDay = new Date().getDay();
    const todayNumber = jsDay === 0 ? 7 : jsDay;
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    let html = '';
    for (let d = 1; d <= 7; d++) {
        const dayProgress = weeklyProgress[d - 1];
        const isCompleted = dayProgress && dayProgress.status === 'completed';
        const isToday = d === todayNumber;
        const isAvailable = store.isDayAvailable(courseId, d);
        const isLocked = !isAvailable && !isCompleted;

        let statusClass = 'upcoming';
        let iconHtml = `<span class="roadmap-day-num">${d}</span>`;

        if (isCompleted) {
            statusClass = 'completed';
            iconHtml = '<i class="ph-duotone ph-check"></i>';
        } else if (isToday && isAvailable) {
            statusClass = 'active';
        } else if (isLocked) {
            statusClass = 'locked';
            iconHtml = '<i class="ph-duotone ph-lock-simple"></i>';
        }

        html += `
            <div class="roadmap-node roadmap-node--${statusClass}"
                 data-day="${d}" data-status="${statusClass}"
                 role="button" tabindex="0"
                 aria-label="Day ${d}, ${dayNames[d - 1]}, ${statusClass}">
                <div class="roadmap-circle">${iconHtml}</div>
                <span class="roadmap-day-label">${dayNames[d - 1]}</span>
            </div>
        `;
    }
    return html;
}

/**
 * Handle tapping on a roadmap node.
 */
function handleNodeClick(courseId, dayNumber, status, course) {
    if (status === 'locked') {
        showLockedModal(dayNumber);
        return;
    }
    if (status === 'completed') {
        showTaskDetailModal(courseId, dayNumber, course);
        return;
    }
    // Active or upcoming (past available day)
    openTaskModal(courseId, dayNumber);
}

/**
 * Show a small modal for locked days.
 */
function showLockedModal(dayNumber) {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const modal = document.getElementById('info-modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="info-modal-content card">
            <i class="ph-duotone ph-lock-simple info-modal-icon"></i>
            <h3>Locked</h3>
            <p>This task unlocks on ${dayNames[dayNumber - 1]}.</p>
            <button class="btn-primary info-modal-close">Got it</button>
        </div>
    `;
    modal.classList.add('active');
    modal.querySelector('.info-modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    }, { once: true });
}

/**
 * Show detail modal for a completed day.
 */
function showTaskDetailModal(courseId, dayNumber, course) {
    const task = course.daily_tasks.find(t => t.day_number === dayNumber);
    if (!task) return;
    const progress = store.getProgress(courseId, dayNumber);
    const modal = document.getElementById('info-modal');
    if (!modal) return;

    const coinsEarned = progress && progress.coinsEarned ? progress.coinsEarned : 0;
    const score = progress && progress.score != null ? progress.score : '---';

    modal.innerHTML = `
        <div class="info-modal-content card">
            <div class="task-detail-header">
                <span class="task-detail-badge task-detail-badge--completed">
                    <i class="ph-duotone ph-check-circle"></i> Completed
                </span>
            </div>
            <h3>${escapeHtml(task.title)}</h3>
            <div class="task-detail-stats">
                <div class="task-detail-stat">
                    <i class="ph-duotone ph-video"></i>
                    <span>Video watched</span>
                </div>
                <div class="task-detail-stat">
                    <i class="ph-duotone ph-exam"></i>
                    <span>Quiz score: ${score}%</span>
                </div>
                <div class="task-detail-stat">
                    <i class="ph-duotone ph-coin"></i>
                    <span>${coinsEarned} coins earned</span>
                </div>
            </div>
            <button class="btn-primary info-modal-close" style="width:100%; margin-top: var(--space-md);">Close</button>
        </div>
    `;
    modal.classList.add('active');
    modal.querySelector('.info-modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    }, { once: true });
}

/** Utility: escape HTML to prevent XSS */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
