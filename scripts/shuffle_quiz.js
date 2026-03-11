/**
 * shuffle_quiz.js
 * 
 * Reads courses.json, shuffles quiz options for each question so that:
 *   1. The correct answer is placed at a random index
 *   2. No index is the correct answer more than 3 times in any 5-question quiz
 *   3. All options are correctly reordered
 *   4. correct_answer is updated to the new index of the correct option
 *
 * Usage:  node scripts/shuffle_quiz.js
 */

const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '..', 'data', 'courses.json');
const OUTPUT = path.join(__dirname, '..', 'data', 'courses.json');

// Seeded PRNG for reproducibility (simple xorshift)
function createRng(seed) {
    let s = seed;
    return function () {
        s ^= s << 13;
        s ^= s >> 17;
        s ^= s << 5;
        return ((s >>> 0) / 0xFFFFFFFF);
    };
}

const rng = createRng(20260302); // today's date as seed

/**
 * Fisher-Yates shuffle of an array (in-place), using our seeded rng.
 */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Generate a target index layout for 5 questions such that no index appears > 3 times.
 * Returns an array of 5 values, each 0-3.
 */
function generateTargetIndices() {
    const MAX_ATTEMPTS = 100;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const indices = [];
        for (let i = 0; i < 5; i++) {
            indices.push(Math.floor(rng() * 4));
        }
        // Check constraint: no value appears more than 3 times
        const counts = [0, 0, 0, 0];
        for (const idx of indices) counts[idx]++;
        if (counts.every(c => c <= 3)) {
            // Also check we have at least 2 distinct values (not all same)
            const distinct = new Set(indices).size;
            if (distinct >= 2) return indices;
        }
    }
    // Fallback: guaranteed good distribution
    return shuffle([0, 1, 2, 3, 0]);
}

/**
 * Place the correct answer at a specific target index within 4 options.
 * Returns { options: string[], correct_answer: number }
 */
function placeCorrectAt(options, currentCorrectIdx, targetIdx) {
    const correctText = options[currentCorrectIdx];
    const distractors = options.filter((_, i) => i !== currentCorrectIdx);
    shuffle(distractors);

    const newOptions = [];
    let dIdx = 0;
    for (let i = 0; i < 4; i++) {
        if (i === targetIdx) {
            newOptions.push(correctText);
        } else {
            newOptions.push(distractors[dIdx++]);
        }
    }

    return { options: newOptions, correct_answer: targetIdx };
}


// ── Main ──────────────────────────────────────────────────────────────────────

const courses = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

let totalQuestions = 0;
let totalShuffled = 0;

for (const course of courses) {
    for (const task of course.daily_tasks) {
        const quiz = task.quiz_questions;
        if (!quiz || quiz.length === 0) continue;

        // Generate target indices for this quiz
        const targets = generateTargetIndices();

        for (let qIdx = 0; qIdx < quiz.length; qIdx++) {
            const q = quiz[qIdx];
            const target = targets[qIdx];
            totalQuestions++;

            const result = placeCorrectAt(q.options, q.correct_answer, target);
            q.options = result.options;
            q.correct_answer = result.correct_answer;
            totalShuffled++;
        }

        // Verify constraint after shuffling
        const finalIndices = quiz.map(q => q.correct_answer);
        const counts = [0, 0, 0, 0];
        for (const idx of finalIndices) counts[idx]++;
        const maxCount = Math.max(...counts);
        if (maxCount > 3) {
            console.warn(`WARNING: Quiz ${task.id} has index appearing ${maxCount} times: ${finalIndices}`);
        }

        // Log the distribution
        console.log(`  ${task.id} (${task.title}): answers at indices [${finalIndices.join(', ')}]`);
    }
}

// Write back
fs.writeFileSync(OUTPUT, JSON.stringify(courses, null, 2) + '\n', 'utf8');

console.log(`\nDone. Processed ${totalQuestions} questions, shuffled ${totalShuffled}.`);
console.log(`Output written to: ${OUTPUT}`);
