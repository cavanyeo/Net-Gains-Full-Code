/**
 * task.js
 * Full daily task modal flow: Video -> Quiz -> Challenge -> Pass/Fail
 * Manages YouTube IFrame API, quiz scoring, challenge self-report,
 * coin awards, and journal prompts.
 */

import store from './store.js';
import { fetchCourses } from './data.js';

/** Encouraging messages pool — rotated on each retry */
const ENCOURAGEMENT = [
    "Almost there! Let's review the video and try again.",
    "Don't worry — every expert was once a beginner. Give it another go!",
    "You're building real skills. Rewatch the video and you'll nail it!",
    "Learning takes practice. Let's try once more!",
    "Great effort! A quick review will help it click.",
    "Persistence is a superpower. Watch again and crush it!",
    "You're closer than you think. One more round!",
    "Financial literacy is a journey. Let's keep going!"
];

/** YouTube player instance */
let ytPlayer = null;
let ytPollInterval = null;
let ytApiReady = false;
let ytApiLoading = false;

/** Load courses from Supabase/cache */
async function loadCourses() {
    return await fetchCourses();
}

/**
 * Load the YouTube IFrame API script if not already loaded.
 */
function loadYouTubeApi() {
    return new Promise((resolve) => {
        if (ytApiReady) { resolve(); return; }
        if (ytApiLoading) {
            // Wait for existing load
            const check = setInterval(() => {
                if (ytApiReady) { clearInterval(check); resolve(); }
            }, 100);
            return;
        }
        ytApiLoading = true;

        // Set global callback
        window.onYouTubeIframeAPIReady = () => {
            ytApiReady = true;
            ytApiLoading = false;
            resolve();
        };

        // If YT already exists (e.g. script already loaded)
        if (window.YT && window.YT.Player) {
            ytApiReady = true;
            ytApiLoading = false;
            resolve();
            return;
        }

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    });
}

/**
 * Extract YouTube video ID from embed URL.
 */
function extractVideoId(url) {
    const match = url.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
}

/**
 * Open the full task modal for a given course day.
 * @param {string} courseId
 * @param {number} dayNumber 1-7
 */
export async function openTaskModal(courseId, dayNumber) {
    const courses = await loadCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const task = course.daily_tasks.find(t => t.day_number === dayNumber);
    if (!task) return;

    // Get existing progress to track attempts
    const existingProgress = store.getProgress(courseId, dayNumber);
    const attempts = existingProgress ? (existingProgress.attempts || 0) : 0;

    const modal = document.getElementById('task-modal');
    if (!modal) return;

    // State for this task attempt
    const taskState = {
        courseId,
        dayNumber,
        task,
        course,
        attempts,
        videoWatched: false,
        quizScore: 0,
        challengeCompleted: false,
        currentQuestion: 0,
        answers: [],
        correctCount: 0
    };

    modal.classList.add('active');
    renderVideoStep(modal, taskState);
}

/**
 * Close the task modal and clean up.
 */
function closeTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.innerHTML = '';
    }
    if (ytPlayer) {
        try { ytPlayer.destroy(); } catch { /* ignore */ }
        ytPlayer = null;
    }
    if (ytPollInterval) {
        clearInterval(ytPollInterval);
        ytPollInterval = null;
    }
}

/* ================================================================== */
/*  STEP 1: Video Player                                              */
/* ================================================================== */

async function renderVideoStep(modal, taskState) {
    const { task } = taskState;
    const videoId = extractVideoId(task.video_url);

    modal.innerHTML = `
        <div class="task-modal-content">
            <div class="task-modal-header">
                <h3>Day ${task.day_number}: ${escapeHtml(task.title)}</h3>
                <button class="task-modal-close" aria-label="Close">
                    <i class="ph-duotone ph-x"></i>
                </button>
            </div>
            <div class="task-step-indicator">
                <span class="task-step task-step--active">Video</span>
                <span class="task-step">Quiz</span>
                <span class="task-step">Challenge</span>
            </div>
            <div class="task-video-container">
                <div id="yt-player-wrapper"></div>
            </div>
            <div class="task-video-progress">
                <div class="task-video-progress-bar">
                    <div class="task-video-progress-fill" id="video-progress-fill"></div>
                </div>
                <p class="task-video-hint" id="video-hint">
                    <i class="ph-duotone ph-play-circle"></i>
                    Keep watching to unlock the quiz!
                </p>
            </div>
            <button class="btn-primary task-continue-btn" id="btn-continue-to-quiz" disabled>
                Continue to Quiz
            </button>
        </div>
    `;

    // Bind close button
    modal.querySelector('.task-modal-close').addEventListener('click', closeTaskModal);

    // Load YouTube API and create player
    await loadYouTubeApi();

    ytPlayer = new window.YT.Player('yt-player-wrapper', {
        videoId: videoId,
        width: '100%',
        height: 220,
        playerVars: {
            enablejsapi: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1
        },
        events: {
            onReady: () => startVideoTracking(taskState),
            onStateChange: (event) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                    onVideoThresholdMet(taskState);
                }
            }
        }
    });
}

/**
 * Poll video progress every 2 seconds.
 */
function startVideoTracking(taskState) {
    if (ytPollInterval) clearInterval(ytPollInterval);

    ytPollInterval = setInterval(() => {
        if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;

        const current = ytPlayer.getCurrentTime();
        const duration = ytPlayer.getDuration();
        if (!duration) return;

        const percent = (current / duration) * 100;
        const fill = document.getElementById('video-progress-fill');
        if (fill) fill.style.width = `${Math.min(percent, 100)}%`;

        if (percent >= 90) {
            onVideoThresholdMet(taskState);
        }
    }, 2000);
}

/**
 * Called when >= 90% of the video has been watched.
 */
function onVideoThresholdMet(taskState) {
    if (taskState.videoWatched) return;
    taskState.videoWatched = true;

    if (ytPollInterval) {
        clearInterval(ytPollInterval);
        ytPollInterval = null;
    }

    const fill = document.getElementById('video-progress-fill');
    if (fill) fill.style.width = '100%';

    const hint = document.getElementById('video-hint');
    if (hint) {
        hint.innerHTML = '<i class="ph-duotone ph-check-circle"></i> Video complete! Continue to the quiz.';
        hint.classList.add('task-video-hint--done');
    }

    const btn = document.getElementById('btn-continue-to-quiz');
    if (btn) {
        btn.disabled = false;
        btn.addEventListener('click', () => {
            // Destroy player before moving on
            if (ytPlayer) {
                try { ytPlayer.destroy(); } catch { /* ignore */ }
                ytPlayer = null;
            }
            const modal = document.getElementById('task-modal');
            renderQuizStep(modal, taskState);
        });
    }
}

/* ================================================================== */
/*  STEP 2: Quiz (one question at a time)                             */
/* ================================================================== */

function renderQuizStep(modal, taskState) {
    taskState.currentQuestion = 0;
    taskState.answers = [];
    taskState.correctCount = 0;

    renderQuestion(modal, taskState);
}

function renderQuestion(modal, taskState) {
    const { task, currentQuestion } = taskState;
    const q = task.quiz_questions[currentQuestion];
    const totalQuestions = task.quiz_questions.length;

    modal.innerHTML = `
        <div class="task-modal-content">
            <div class="task-modal-header">
                <h3>Day ${task.day_number}: ${escapeHtml(task.title)}</h3>
                <button class="task-modal-close" aria-label="Close">
                    <i class="ph-duotone ph-x"></i>
                </button>
            </div>
            <div class="task-step-indicator">
                <span class="task-step task-step--done">Video</span>
                <span class="task-step task-step--active">Quiz</span>
                <span class="task-step">Challenge</span>
            </div>
            <div class="quiz-progress-text">
                Question ${currentQuestion + 1} of ${totalQuestions}
            </div>
            <div class="quiz-question-card card">
                <p class="quiz-question-text">${escapeHtml(q.question)}</p>
                <div class="quiz-options">
                    ${q.options.map((opt, i) => `
                        <button class="quiz-option" data-index="${i}">
                            <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
                            <span class="quiz-option-text">${escapeHtml(opt)}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    modal.querySelector('.task-modal-close').addEventListener('click', closeTaskModal);

    // Bind option click handlers
    const options = modal.querySelectorAll('.quiz-option');
    options.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedIndex = parseInt(btn.dataset.index, 10);
            handleQuizAnswer(modal, taskState, selectedIndex, q.correct_answer, options);
        });
    });
}

function handleQuizAnswer(modal, taskState, selectedIndex, correctIndex, optionBtns) {
    const isCorrect = selectedIndex === correctIndex;

    // Disable all buttons and show correct/wrong
    optionBtns.forEach(btn => {
        btn.disabled = true;
        const idx = parseInt(btn.dataset.index, 10);
        if (idx === correctIndex) {
            btn.classList.add('quiz-option--correct');
        } else if (idx === selectedIndex && !isCorrect) {
            btn.classList.add('quiz-option--wrong');
        }
    });

    if (isCorrect) taskState.correctCount++;
    taskState.answers.push({ selected: selectedIndex, correct: correctIndex, isCorrect });

    // Move to next question after a short delay
    setTimeout(() => {
        taskState.currentQuestion++;
        if (taskState.currentQuestion < taskState.task.quiz_questions.length) {
            renderQuestion(modal, taskState);
        } else {
            // Quiz complete, calculate score
            taskState.quizScore = (taskState.correctCount / taskState.task.quiz_questions.length) * 100;
            renderChallengeStep(modal, taskState);
        }
    }, 1000);
}

/* ================================================================== */
/*  STEP 3: Challenge (self-report)                                   */
/* ================================================================== */

function renderChallengeStep(modal, taskState) {
    const { task, quizScore } = taskState;
    const challenge = task.challenge;

    modal.innerHTML = `
        <div class="task-modal-content">
            <div class="task-modal-header">
                <h3>Day ${task.day_number}: ${escapeHtml(task.title)}</h3>
                <button class="task-modal-close" aria-label="Close">
                    <i class="ph-duotone ph-x"></i>
                </button>
            </div>
            <div class="task-step-indicator">
                <span class="task-step task-step--done">Video</span>
                <span class="task-step task-step--done">Quiz</span>
                <span class="task-step task-step--active">Challenge</span>
            </div>
            <div class="quiz-score-summary card">
                <i class="ph-duotone ph-exam"></i>
                <span>Quiz Score: <strong>${Math.round(quizScore)}%</strong> (${taskState.correctCount}/${task.quiz_questions.length} correct)</span>
            </div>
            <div class="challenge-card card">
                <div class="challenge-header">
                    <i class="ph-duotone ph-flag-banner"></i>
                    <h4>${escapeHtml(challenge.title)}</h4>
                </div>
                <p class="challenge-description">${escapeHtml(challenge.description)}</p>
                <label class="challenge-checkbox-label">
                    <input type="checkbox" id="challenge-check" class="challenge-checkbox" />
                    <span>I completed this challenge</span>
                </label>
                <textarea id="challenge-notes" class="challenge-notes"
                    placeholder="Optional: share what you did..."
                    rows="3"></textarea>
            </div>
            <button class="btn-primary task-continue-btn" id="btn-submit-task" style="width:100%;">
                Submit Task
            </button>
        </div>
    `;

    modal.querySelector('.task-modal-close').addEventListener('click', closeTaskModal);

    modal.querySelector('#btn-submit-task').addEventListener('click', () => {
        const checked = document.getElementById('challenge-check').checked;
        taskState.challengeCompleted = checked;
        evaluateTask(modal, taskState);
    });
}

/* ================================================================== */
/*  STEP 4: Pass / Fail                                               */
/* ================================================================== */

function evaluateTask(modal, taskState) {
    const combinedScore = (taskState.quizScore * 0.7) + (taskState.challengeCompleted ? 30 : 0);
    const passed = combinedScore >= 80;
    taskState.attempts += 1;

    if (passed) {
        renderPassFlow(modal, taskState, combinedScore);
    } else {
        renderFailFlow(modal, taskState, combinedScore);
    }
}

/**
 * Pass flow: coin award, journal prompt, completion.
 */
function renderPassFlow(modal, taskState, combinedScore) {
    const { courseId, dayNumber, task, attempts } = taskState;

    // Calculate coins based on attempt count
    let coinsEarned = 25;
    if (attempts === 1) coinsEarned = 100;
    else if (attempts === 2) coinsEarned = 75;
    else if (attempts === 3) coinsEarned = 50;

    modal.innerHTML = `
        <div class="task-modal-content">
            <div class="task-modal-header">
                <h3>Task Complete!</h3>
                <button class="task-modal-close" aria-label="Close">
                    <i class="ph-duotone ph-x"></i>
                </button>
            </div>

            <div class="pass-celebration">
                <div class="coin-award-animation">
                    <i class="ph-duotone ph-coin coin-icon-animated"></i>
                    <span class="coin-amount-animated">+${coinsEarned}</span>
                </div>
                <p class="pass-message">
                    Score: ${Math.round(combinedScore)}% &mdash;
                    ${attempts === 1 ? 'First try! Amazing!' : `Completed on attempt ${attempts}.`}
                </p>
            </div>

            <div class="journal-prompt card">
                <h4><i class="ph-duotone ph-notebook"></i> Journal Reflection</h4>
                <p>Write a short reflection about what you learned today.</p>
                <textarea id="journal-body" class="journal-textarea"
                    placeholder="What did you learn? How will you apply it? (minimum 30 characters)"
                    rows="4"></textarea>
                <p class="journal-char-count" id="journal-char-count">0 / 30 minimum characters</p>
            </div>

            <button class="btn-primary task-continue-btn" id="btn-finish-task"
                style="width:100%;" disabled>
                Save & Finish
            </button>
        </div>
    `;

    modal.querySelector('.task-modal-close').addEventListener('click', closeTaskModal);

    const textarea = document.getElementById('journal-body');
    const charCount = document.getElementById('journal-char-count');
    const finishBtn = document.getElementById('btn-finish-task');

    textarea.addEventListener('input', () => {
        const len = textarea.value.trim().length;
        charCount.textContent = `${len} / 30 minimum characters`;
        finishBtn.disabled = len < 30;
        if (len >= 30) {
            charCount.classList.add('journal-char-count--met');
        } else {
            charCount.classList.remove('journal-char-count--met');
        }
    });

    finishBtn.addEventListener('click', async () => {
        const body = textarea.value.trim();
        if (body.length < 30) return;

        // Run async mutations concurrently
        await Promise.all([
            store.awardCoins(coinsEarned, 'task', `Day ${dayNumber} ${courseId}`),
            store.updateProgress(courseId, dayNumber, {
                status: 'completed',
                score: Math.round(taskState.quizScore),
                attempts,
                coinsEarned,
                completedAt: new Date().toISOString()
            }),
            store.saveJournalEntry({
                courseId,
                dayNumber,
                lessonTitle: task.title,
                body
            })
        ]);

        // Update streak (synchronous computed property)
        store.updateStreak();

        // Check for weekly completion and finalize if needed
        const evaluation = store.evaluateWeek(courseId);
        if (evaluation.daysCompleted >= 6) {
            // Load all courses for the finalization logic
            const allCourses = await loadCourses();
            await store.finalizeWeek(courseId, allCourses);
        }

        closeTaskModal();

        // Trigger dashboard refresh via custom event
        window.dispatchEvent(new CustomEvent('ng:taskCompleted'));
    });
}

/**
 * Fail flow: encouragement and retry option.
 */
function renderFailFlow(modal, taskState, combinedScore) {
    // Pick an encouraging message — rotate based on attempt count
    const msgIndex = (taskState.attempts - 1) % ENCOURAGEMENT.length;
    const encourageMsg = ENCOURAGEMENT[msgIndex];

    // Calculate what the next attempt will earn
    const nextAttempt = taskState.attempts + 1;
    let nextCoins = 25;
    if (nextAttempt === 1) nextCoins = 100;
    else if (nextAttempt === 2) nextCoins = 75;
    else if (nextAttempt === 3) nextCoins = 50;

    modal.innerHTML = `
        <div class="task-modal-content">
            <div class="task-modal-header">
                <h3>Almost There!</h3>
                <button class="task-modal-close" aria-label="Close">
                    <i class="ph-duotone ph-x"></i>
                </button>
            </div>

            <div class="fail-message-container">
                <i class="ph-duotone ph-heart fail-icon"></i>
                <h4>Don't give up!</h4>
                <p class="fail-score">Your score: ${Math.round(combinedScore)}% (need 80% to pass)</p>
                <p class="fail-encouragement">${encourageMsg}</p>
                <p class="fail-next-reward">
                    <i class="ph-duotone ph-coin"></i>
                    Next attempt reward: <strong>${nextCoins} coins</strong>
                </p>
            </div>

            <button class="btn-primary task-continue-btn" id="btn-retry-task" style="width:100%;">
                <i class="ph-duotone ph-arrow-counter-clockwise"></i>
                Rewatch & Retry
            </button>
            <button class="btn-secondary task-close-btn" id="btn-close-fail"
                style="width:100%; margin-top: var(--space-sm);">
                Close
            </button>
        </div>
    `;

    modal.querySelector('.task-modal-close').addEventListener('click', closeTaskModal);
    modal.querySelector('#btn-close-fail').addEventListener('click', closeTaskModal);

    modal.querySelector('#btn-retry-task').addEventListener('click', () => {
        // Store the accumulated attempts
        store.updateProgress(taskState.courseId, taskState.dayNumber, {
            status: 'in_progress',
            attempts: taskState.attempts
        });
        renderVideoStep(modal, taskState);
    });
}

/**
 * ─── My Journal View ─────────────────────────────────────────────────────
 * Renders all past journal entries in a full-screen modal, grouped by
 * course, in chronological order so users can review their growth journey.
 */
export function renderJournalView() {
    let modal = document.getElementById('journal-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'journal-modal';
        modal.className = 'modal-overlay modal-overlay--full';
        document.body.appendChild(modal);
    }

    const entries = store.getJournalEntries();

    // Group entries by courseId
    const grouped = {};
    for (const entry of entries) {
        const key = entry.courseId || 'unknown';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(entry);
    }

    // Course display names
    const courseNames = {
        'course-w1': 'Week 1: Budgeting Basics',
        'course-w2': 'Week 2: Smart Saving',
        'course-w3': 'Week 3: Scam Awareness'
    };

    let html = `
        <div class="journal-view">
            <div class="journal-view-header">
                <h2><i class="ph-duotone ph-notebook"></i> My Journal</h2>
                <button class="task-modal-close" id="btn-close-journal" aria-label="Close">
                    <i class="ph-duotone ph-x"></i>
                </button>
            </div>
    `;

    if (entries.length === 0) {
        html += `
            <div class="journal-empty-state">
                <i class="ph-duotone ph-pencil-circle"></i>
                <h3>Your journal is empty</h3>
                <p>Complete daily tasks and write reflections to fill your journal. Your thoughts and insights will appear here!</p>
            </div>
        `;
    } else {
        // Sort entries chronologically (oldest first) so users can
        // review their growth and improvement over time
        const allSorted = [...entries].sort((a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        );

        // Render by course groups — chronological (Week 1 → 2 → 3)
        const courseOrder = ['course-w1', 'course-w2', 'course-w3'];
        for (const cid of courseOrder) {
            const courseEntries = allSorted.filter(e => e.courseId === cid);
            if (courseEntries.length === 0) continue;

            html += `<div class="journal-course-group">
                <h3 class="journal-course-title">${courseNames[cid] || cid}</h3>`;

            for (const entry of courseEntries) {
                const date = new Date(entry.createdAt);
                const dateStr = date.toLocaleDateString('en-SG', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });
                const timeStr = date.toLocaleTimeString('en-SG', {
                    hour: '2-digit', minute: '2-digit'
                });

                html += `
                    <div class="journal-entry-card">
                        <div class="journal-entry-meta">
                            <span class="journal-entry-tag">
                                <i class="ph-duotone ph-book-open-text"></i>
                                Day ${entry.dayNumber} — ${escapeHtml(entry.lessonTitle || '')}
                            </span>
                            <span class="journal-entry-date">${dateStr} ${timeStr}</span>
                        </div>
                        <p class="journal-entry-body">${escapeHtml(entry.body)}</p>
                    </div>
                `;
            }
            html += `</div>`;
        }
    }

    html += `</div>`;
    modal.innerHTML = html;
    modal.classList.add('active');

    // Close handler
    modal.querySelector('#btn-close-journal')?.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

/** Utility: escape HTML */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
