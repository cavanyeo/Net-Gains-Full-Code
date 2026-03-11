/**
 * quests.js
 * Renders the Quests / Courses screen.
 * Shows active, locked, and completed course cards.
 */

import store from './store.js';
import { openTaskModal } from './task.js';
import { fetchCourses } from './data.js';

async function loadCourses() {
    return await fetchCourses();
}

/**
 * Render the Quests view.
 */
export async function renderQuests() {
    const container = document.querySelector('#view-quests .view-body');
    if (!container) return;

    const courses = await loadCourses();
    const currentCourseId = store.getCurrentCourseId();

    let html = '';

    for (const course of courses) {
        const evaluation = store.evaluateWeek(course.id);
        const isActive = course.id === currentCourseId;
        const isCompleted = evaluation.daysCompleted >= 6;
        const isUnlocked = isCourseUnlocked(course, courses);

        // Auto-transition: if current active course is completed,
        // promote the next unlocked course to active
        if (isActive && isCompleted) {
            const nextCourse = courses.find(c => c.order === course.order + 1);
            if (nextCourse && isCourseUnlocked(nextCourse, courses)) {
                store.setCurrentCourseId(nextCourse.id);
            }
        }

        if (isCompleted) {
            html += renderCompletedCourse(course, evaluation);
        } else if (isActive || (isUnlocked && course.id === store.getCurrentCourseId())) {
            html += renderActiveCourse(course, evaluation);
        } else if (isUnlocked) {
            html += renderUnlockedCourse(course);
        } else {
            html += renderLockedCourse(course);
        }
    }

    container.innerHTML = html;

    // Bind "Continue Learning" buttons
    container.querySelectorAll('[data-action="continue"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const courseId = btn.dataset.course;
            const nextDay = findNextAvailableDay(courseId);
            if (nextDay) {
                openTaskModal(courseId, nextDay);
            }
        });
    });

    // Bind "Start Course" buttons for unlocked courses
    container.querySelectorAll('[data-action="start-course"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const courseId = btn.dataset.course;
            store.setCurrentCourseId(courseId);
            renderQuests(); // Re-render
        });
    });

    // Bind "Review" buttons
    container.querySelectorAll('[data-action="review"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const courseId = btn.dataset.course;
            const day = 1; // Start from day 1 for review
            openTaskModal(courseId, day);
        });
    });
}

/**
 * Check if a course is unlocked.
 * Course N unlocks when >= 6/7 days of course N-1 are completed.
 * Course 1 (order 1) is always unlocked.
 */
function isCourseUnlocked(course, allCourses) {
    if (course.order === 1) return true;
    const prevCourse = allCourses.find(c => c.order === course.order - 1);
    if (!prevCourse) return true;
    const prevEval = store.evaluateWeek(prevCourse.id);
    return prevEval.daysCompleted >= 6;
}

/**
 * Find the next available (incomplete) day for a course.
 */
function findNextAvailableDay(courseId) {
    for (let d = 1; d <= 7; d++) {
        const progress = store.getProgress(courseId, d);
        const isComplete = progress && progress.status === 'completed';
        if (!isComplete && store.isDayAvailable(courseId, d)) {
            return d;
        }
    }
    return null;
}

/* ------------------------------------------------------------------ */
/*  Card renderers                                                     */
/* ------------------------------------------------------------------ */

function renderActiveCourse(course, evaluation) {
    const progressPercent = Math.round((evaluation.daysCompleted / 7) * 100);
    return `
        <div class="quest-card quest-card--active card">
            <div class="quest-card-header">
                <span class="quest-week-badge">Week ${course.week_number}</span>
                <span class="quest-status quest-status--active">
                    <i class="ph-duotone ph-play-circle"></i> In Progress
                </span>
            </div>
            <h3 class="quest-card-title">${escapeHtml(course.title)}</h3>
            <p class="quest-card-description">${escapeHtml(course.description)}</p>
            <div class="quest-progress">
                <div class="quest-progress-bar">
                    <div class="quest-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <span class="quest-progress-text">${evaluation.daysCompleted}/7 days</span>
            </div>
            <button class="btn-primary quest-continue-btn"
                data-action="continue" data-course="${course.id}">
                Continue Learning
            </button>
        </div>
    `;
}

function renderCompletedCourse(course, evaluation) {
    // Use ledger-based coins for accuracy
    const totalCoins = store.getWeeklyCoinsFromLedger(course.id);

    // Find the latest completion date from progress
    let lastCompletionDate = null;
    for (let d = 1; d <= 7; d++) {
        const p = store.getProgress(course.id, d);
        if (p && p.completedAt) {
            const dt = new Date(p.completedAt);
            if (!lastCompletionDate || dt > lastCompletionDate) lastCompletionDate = dt;
        }
    }
    const dateStr = lastCompletionDate
        ? lastCompletionDate.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

    return `
        <div class="quest-card quest-card--completed card">
            <div class="quest-card-header">
                <span class="quest-week-badge">Week ${course.week_number}</span>
                <span class="quest-status quest-status--completed">
                    <i class="ph-duotone ph-check-circle"></i> Completed
                </span>
            </div>
            <h3 class="quest-card-title">${escapeHtml(course.title)}</h3>
            <div class="quest-completed-stats">
                <span><i class="ph-duotone ph-coin"></i> ${totalCoins} coins earned</span>
                <span><i class="ph-duotone ph-calendar-check"></i> ${evaluation.daysCompleted}/7 days</span>
                ${dateStr ? `<span><i class="ph-duotone ph-clock"></i> Completed ${dateStr}</span>` : ''}
            </div>
            <button class="btn-secondary quest-review-btn"
                data-action="review" data-course="${course.id}">
                <i class="ph-duotone ph-eye"></i> Review
            </button>
        </div>
    `;
}

function renderUnlockedCourse(course) {
    return `
        <div class="quest-card quest-card--unlocked card">
            <div class="quest-card-header">
                <span class="quest-week-badge">Week ${course.week_number}</span>
                <span class="quest-status quest-status--ready">
                    <i class="ph-duotone ph-sparkle"></i> Ready
                </span>
            </div>
            <h3 class="quest-card-title">${escapeHtml(course.title)}</h3>
            <p class="quest-card-description">${escapeHtml(course.description)}</p>
            <button class="btn-primary quest-start-btn"
                data-action="start-course" data-course="${course.id}">
                Start Course
            </button>
        </div>
    `;
}

function renderLockedCourse(course) {
    return `
        <div class="quest-card quest-card--locked card">
            <div class="quest-locked-overlay">
                <i class="ph-duotone ph-lock-simple"></i>
            </div>
            <div class="quest-card-header">
                <span class="quest-week-badge">Week ${course.week_number}</span>
                <span class="quest-status quest-status--locked">
                    <i class="ph-duotone ph-lock-simple"></i> Locked
                </span>
            </div>
            <h3 class="quest-card-title">${escapeHtml(course.title)}</h3>
            <p class="quest-card-description">${escapeHtml(course.description)}</p>
            <p class="quest-locked-hint">Complete the previous course to unlock.</p>
        </div>
    `;
}

/** Utility: escape HTML */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
