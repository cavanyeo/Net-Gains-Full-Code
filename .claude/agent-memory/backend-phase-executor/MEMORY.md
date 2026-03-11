# Net Gains Project Memory

## Architecture
- Pure vanilla JS with ES modules (import/export), no bundler
- Mobile-first PWA, max-width 480px, bottom nav with 3 tabs
- CSS custom properties for design tokens in `:root`
- localStorage for state persistence via singleton Store class (key: `ng_state`)

## File Structure
- `index.html` - Single-page app shell with modal overlays (onboarding, info, task)
- `index.css` - All styles including component styles
- `js/main.js` - Entry point, imports store + view renderers, handles nav + onboarding
- `js/store.js` - Singleton Store class, localStorage backend, exports `store`
- `js/dashboard.js` - Renders home view (greeting, progress ring, roadmap)
- `js/task.js` - Full task modal flow (video -> quiz -> challenge -> pass/fail)
- `js/quests.js` - Course cards (active/locked/completed)
- `js/rewards.js` - Shop + My Rewards tabs, redeem flow
- `data/courses.json` - 3 courses, 7 daily tasks each, 5 MCQs per task
- `data/rewards.json` - 9 rewards across bronze/silver/gold tiers

## Key Patterns
- Views re-render on tab switch and after task completion (custom event `ng:taskCompleted`)
- YouTube IFrame API loaded dynamically; 90% watch threshold to unlock quiz
- Coin awards: 1st attempt=100, 2nd=75, 3rd=50, 4th+=25
- Pass threshold: combined score >= 80 (quiz*0.7 + challenge*0.3)
- Day availability: Mon=1..Sun=7, maps to JS getDay() with Sunday=7
- Course unlock: course N requires >= 6/7 days of course N-1

## Design Tokens
- Taupe #544739, Sage #9CA288, Pearl #CED0B7, Beige #FFFEE5, Dutch White #EBDCB8
- Success #82C09A, Error #E07A5F
- Radius: 8/12/16px, Font: Inter

## Phases Completed
- Phase 1: HTML shell, CSS tokens, bottom nav (by Gemini)
- Phases 2-6: Data layer, dashboard, task loop, quests, rewards (all implemented)
