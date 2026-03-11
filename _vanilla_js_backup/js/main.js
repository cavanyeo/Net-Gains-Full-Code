/**
 * main.js
 * Application entry point handling global routing, navigation,
 * store initialisation, onboarding, and view rendering.
 */

import store from './store.js';
import { renderDashboard } from './dashboard.js';
import { renderQuests } from './quests.js';
import { renderRewards } from './rewards.js';
import { signInWithGoogle, getSession, onAuthStateChange, ensureUserProfile } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Setup login button listener
    const btnGoogleLogin = document.getElementById('btn-google-login');
    if (btnGoogleLogin) {
        btnGoogleLogin.addEventListener('click', async () => {
            btnGoogleLogin.disabled = true;
            btnGoogleLogin.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Connecting...';
            await signInWithGoogle();
        });
    }

    // Setup guest login button listener
    const btnGuestLogin = document.getElementById('btn-guest-login');
    if (btnGuestLogin) {
        btnGuestLogin.addEventListener('click', () => {
            initializeGuestApp();
        });
    }

    // Check for existing session
    const session = await getSession();
    
    // Check if we are already in a guest session (persisted via localStorage)
    const storedUserId = localStorage.getItem('ng_user_id');
    const isGuestSession = storedUserId && storedUserId.startsWith('guest_');

    if (session) {
        // User is authenticated via Supabase
        await initializeApp(session);
    } else if (isGuestSession) {
        // User previously chose to continue as guest
        initializeGuestApp();
    } else {
        // No session: show login overlay
        const loginOverlay = document.getElementById('login-overlay');
        if (loginOverlay) loginOverlay.classList.add('active');
    }

    // Listen for auth changes (e.g. sign out)
    onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            // Also clear any guest session marker
            localStorage.removeItem('ng_user_id');
            window.location.reload();
        }
    });
});

/**
 * Initializes the app for a guest user (local-only storage).
 */
function initializeGuestApp() {
    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay) loginOverlay.classList.remove('active');

    // Generate or retrieve a guest ID
    let guestId = localStorage.getItem('ng_user_id');
    if (!guestId || !guestId.startsWith('guest_')) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('ng_user_id', guestId);
    }

    // Initialise the data store with the guest ID
    store.init(guestId);

    // Set guest user details
    store.updateUser({ 
        name: 'Guest User', 
        email: 'Local Session' 
    });

    // Initialise navigation
    initNavigation();

    // Check for onboarding
    if (!store.isOnboardingComplete()) {
        showOnboarding();
    } else {
        // Render the initial active view
        renderActiveView('view-home');
    }

    // Listen for task completion events to refresh the dashboard
    window.addEventListener('ng:taskCompleted', () => {
        renderActiveView(getActiveViewId());
    });
}

/**
 * Initializes the main app UI after successful authentication.
 */
async function initializeApp(session) {
    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay) loginOverlay.classList.remove('active');

    // Ensure user profile exists in database
    const userProfile = await ensureUserProfile(session);

    // Initialise the data store (passing the user ID for future Supabase queries)
    store.init(session.user.id);

    // Set user details from auth session
    store.updateUser({ 
        name: userProfile?.name || session.user.user_metadata?.full_name || 'User', 
        email: session.user.email 
    });

    // Initialise navigation
    initNavigation();

    // Check for onboarding
    if (!store.isOnboardingComplete()) {
        showOnboarding();
    } else {
        // Render the initial active view
        renderActiveView('view-home');
    }

    // Listen for task completion events to refresh the dashboard
    window.addEventListener('ng:taskCompleted', () => {
        renderActiveView(getActiveViewId());
    });
}

/**
 * Initialises the bottom navigation bar and tab switching logic.
 */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetViewId = item.getAttribute('data-target');

            // If already active, do nothing
            if (item.classList.contains('active')) return;

            // Update nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update views - crossfade logic
            views.forEach(view => {
                if (view.id === targetViewId) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            });

            // Render the target view
            renderActiveView(targetViewId);
        });
    });
}

/**
 * Get the currently active view ID.
 */
function getActiveViewId() {
    const active = document.querySelector('.view.active');
    return active ? active.id : 'view-home';
}

/**
 * Render the content for the currently active view.
 */
function renderActiveView(viewId) {
    switch (viewId) {
        case 'view-home':
            renderDashboard();
            break;
        case 'view-quests':
            renderQuests();
            break;
        case 'view-rewards':
            renderRewards();
            break;
    }
}

/* ------------------------------------------------------------------ */
/*  Onboarding Carousel                                                */
/* ------------------------------------------------------------------ */

function showOnboarding() {
    const overlay = document.getElementById('onboarding-overlay');
    if (!overlay) return;

    const slides = [
        {
            icon: 'ph-duotone ph-coins',
            title: 'Welcome to Net Gains!',
            text: 'Build your financial skills one day at a time. Watch videos, take quizzes, and earn coins along the way.'
        },
        {
            icon: 'ph-duotone ph-flag',
            title: 'Daily Quests',
            text: 'Complete 7 daily tasks each week. Watch the video, pass the quiz, and take on a real-world challenge to earn coins.'
        },
        {
            icon: 'ph-duotone ph-gift',
            title: 'Earn & Redeem',
            text: 'Earn up to 100 coins per day. Complete 6 of 7 days for a weekly reward. Get all 7 for a x2 multiplier! Spend coins in the Rewards Shop.'
        }
    ];

    let currentSlide = 0;

    function renderSlide() {
        const slide = slides[currentSlide];
        const isLast = currentSlide === slides.length - 1;

        overlay.innerHTML = `
            <div class="onboarding-card">
                <div class="onboarding-icon-wrapper">
                    <i class="${slide.icon} onboarding-icon"></i>
                </div>
                <h2 class="onboarding-title">${slide.title}</h2>
                <p class="onboarding-text">${slide.text}</p>
                <div class="onboarding-dots">
                    ${slides.map((_, i) =>
                        `<span class="onboarding-dot ${i === currentSlide ? 'onboarding-dot--active' : ''}"></span>`
                    ).join('')}
                </div>
                <div class="onboarding-actions">
                    ${currentSlide > 0
                        ? '<button class="btn-secondary onboarding-back">Back</button>'
                        : ''}
                    <button class="btn-primary onboarding-next">
                        ${isLast ? "Let's Go!" : 'Next'}
                    </button>
                </div>
            </div>
        `;

        const nextBtn = overlay.querySelector('.onboarding-next');
        nextBtn.addEventListener('click', () => {
            if (isLast) {
                store.completeOnboarding();
                overlay.classList.remove('active');
                renderActiveView('view-home');
            } else {
                currentSlide++;
                renderSlide();
            }
        });

        const backBtn = overlay.querySelector('.onboarding-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                currentSlide--;
                renderSlide();
            });
        }
    }

    overlay.classList.add('active');
    renderSlide();
}
