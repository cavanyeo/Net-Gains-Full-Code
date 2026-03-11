/**
 * rewards.js
 * Renders the Rewards Center screen.
 * Includes coin balance header, Shop / My Rewards tabs,
 * reward card grid, and redemption flow.
 */

import store from './store.js';
import { fetchRewards } from './data.js';

async function loadRewards() {
    return await fetchRewards();
}

/** Currently active tab: 'shop' or 'my-rewards' */
let activeTab = 'shop';

/**
 * Render the Rewards view.
 */
export async function renderRewards() {
    const container = document.querySelector('#view-rewards .view-body');
    if (!container) return;

    const rewards = await loadRewards();
    const balance = store.getCoinBalance();
    const redeemed = store.getRedeemedRewards();

    container.innerHTML = `
        <div class="rewards-balance-header">
            <i class="ph-duotone ph-coin rewards-coin-icon"></i>
            <div class="rewards-balance-info">
                <span class="rewards-balance-amount">${balance}</span>
                <span class="rewards-balance-label">coins available</span>
            </div>
        </div>

        <div class="rewards-tabs">
            <button class="rewards-tab ${activeTab === 'shop' ? 'rewards-tab--active' : ''}"
                data-tab="shop">Shop</button>
            <button class="rewards-tab ${activeTab === 'my-rewards' ? 'rewards-tab--active' : ''}"
                data-tab="my-rewards">My Rewards</button>
        </div>

        <div class="rewards-content" id="rewards-content">
            ${activeTab === 'shop'
            ? renderShopTab(rewards, balance)
            : renderMyRewardsTab(rewards, redeemed)}
        </div>
    `;

    // Bind tab switches
    container.querySelectorAll('.rewards-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            activeTab = tab.dataset.tab;
            renderRewards();
        });
    });

    // Bind redeem buttons
    container.querySelectorAll('[data-action="redeem"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const rewardId = btn.dataset.rewardId;
            const cost = parseInt(btn.dataset.cost, 10);
            const reward = rewards.find(r => r.id === rewardId);
            if (reward) showRedeemConfirm(reward, cost);
        });
    });
}

/* ------------------------------------------------------------------ */
/*  Tab content renderers                                              */
/* ------------------------------------------------------------------ */

function renderShopTab(rewards, balance) {
    // Group by tier with section headers
    const tiers = [
        { key: 'bronze', label: 'Bronze Rewards', icon: 'ph-duotone ph-medal' },
        { key: 'silver', label: 'Silver Rewards', icon: 'ph-duotone ph-star' },
        { key: 'gold', label: 'Gold Rewards', icon: 'ph-duotone ph-crown' }
    ];
    let html = '';

    for (const tier of tiers) {
        const tierRewards = rewards.filter(r => r.tier === tier.key);
        if (tierRewards.length === 0) continue;

        html += `
            <div class="rewards-tier-section">
                <h3 class="rewards-tier-header rewards-tier-header--${tier.key}">
                    <i class="${tier.icon}"></i> ${tier.label}
                </h3>
                <div class="rewards-grid">
        `;

        for (const reward of tierRewards) {
            const canAfford = balance >= reward.cost;
            const alreadyRedeemed = store.isRewardRedeemed(reward.id);
            const tierClass = `reward-tier--${reward.tier}`;

            html += `
                <div class="reward-card card ${tierClass} ${alreadyRedeemed ? 'reward-card--redeemed' : ''}">
                    <span class="reward-tier-badge">${capitalize(reward.tier)}</span>
                    <div class="reward-icon-wrapper">
                        <i class="${reward.icon} reward-icon"></i>
                    </div>
                    <h4 class="reward-title">${escapeHtml(reward.title)}</h4>
                    <p class="reward-description">${escapeHtml(reward.description)}</p>
                    <div class="reward-footer">
                        <span class="reward-cost ${canAfford ? 'reward-cost--affordable' : 'reward-cost--expensive'}">
                            <i class="ph-duotone ph-coin"></i> ${reward.cost}
                        </span>
                        ${alreadyRedeemed
                    ? '<button class="btn-secondary reward-btn" disabled>Redeemed</button>'
                    : `<button class="btn-primary reward-btn" ${canAfford ? '' : 'disabled'}
                                data-action="redeem" data-reward-id="${reward.id}" data-cost="${reward.cost}">
                                Redeem
                              </button>`
                }
                    </div>
                </div>
            `;
        }

        html += '</div></div>';
    }

    return html;
}

function renderMyRewardsTab(allRewards, redeemed) {
    if (redeemed.length === 0) {
        return `
            <div class="rewards-empty">
                <i class="ph-duotone ph-gift rewards-empty-icon"></i>
                <h4>No rewards yet</h4>
                <p>Complete tasks and earn coins to redeem rewards from the shop!</p>
            </div>
        `;
    }

    let html = '<div class="my-rewards-list">';
    for (const entry of redeemed) {
        const reward = allRewards.find(r => r.id === entry.rewardId);
        if (!reward) continue;

        const date = new Date(entry.redeemedAt);
        const dateStr = date.toLocaleDateString('en-SG', {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        html += `
            <div class="my-reward-item card">
                <div class="my-reward-icon-wrapper">
                    <i class="${reward.icon} my-reward-icon"></i>
                </div>
                <div class="my-reward-info">
                    <h4>${escapeHtml(reward.title)}</h4>
                    <p class="my-reward-date">Redeemed on ${dateStr}</p>
                </div>
                <span class="my-reward-tier-badge reward-tier--${reward.tier}">
                    ${capitalize(reward.tier)}
                </span>
            </div>
        `;
    }
    html += '</div>';
    return html;
}

/* ------------------------------------------------------------------ */
/*  Redeem confirmation dialog                                         */
/* ------------------------------------------------------------------ */

function showRedeemConfirm(reward, cost) {
    const modal = document.getElementById('info-modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="info-modal-content card redeem-confirm">
            <i class="${reward.icon} redeem-confirm-icon"></i>
            <h3>Redeem ${escapeHtml(reward.title)}?</h3>
            <p>This will cost <strong>${cost} coins</strong> from your balance.</p>
            <div class="redeem-confirm-actions">
                <button class="btn-secondary" id="redeem-cancel">Cancel</button>
                <button class="btn-primary" id="redeem-confirm">Redeem</button>
            </div>
        </div>
    `;
    modal.classList.add('active');

    modal.querySelector('#redeem-cancel').addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.querySelector('#redeem-confirm').addEventListener('click', async () => {
        const success = await store.redeemReward(reward.id, cost);
        if (success) {
            showRedeemSuccess(modal, reward);
        } else {
            modal.classList.remove('active');
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    }, { once: true });
}

function showRedeemSuccess(modal, reward) {
    modal.innerHTML = `
        <div class="info-modal-content card redeem-success">
            <div class="confetti-burst">
                <i class="ph-duotone ph-confetti confetti-icon"></i>
            </div>
            <div class="redeem-success-icon">
                <i class="${reward.icon}"></i>
            </div>
            <h3>Congratulations!</h3>
            <p>You've redeemed <strong>${escapeHtml(reward.title)}</strong>.</p>
            <p class="redeem-success-hint">Check the My Rewards tab to see your collection.</p>
            <button class="btn-primary" id="redeem-success-close" style="width:100%; margin-top:var(--space-md);">
                Awesome!
            </button>
        </div>
    `;

    // Trigger entrance animation
    requestAnimationFrame(() => {
        modal.querySelector('.redeem-success')?.classList.add('redeem-success--animate');
    });

    modal.querySelector('#redeem-success-close').addEventListener('click', () => {
        modal.classList.remove('active');
        // Refresh the rewards view
        activeTab = 'my-rewards';
        renderRewards();
    });
}

/* ------------------------------------------------------------------ */
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
