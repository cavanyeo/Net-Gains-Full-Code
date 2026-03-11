/**
 * scripts/seed.js
 *
 * Reads courses.json and rewards.json and inserts all static
 * content into Supabase using the service_role key.
 *
 * Usage:
 *   1. Replace SERVICE_ROLE_KEY below (Project Settings → API → service_role).
 *   2. From the project root run:  node scripts/seed.js
 *
 * Safe to re-run — uses upsert on the slug column.
 *
 * NOTE: The tables use UUID primary keys. The original string IDs
 * from the JSON (e.g. 'course-w1', 'w1d1') are stored in a `slug`
 * column so the app can look them up easily.
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://vbyaqrockpztxslsjfvn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZieWFxcm9ja3B6dHhzbHNqZnZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjM3MjQxMCwiZXhwIjoyMDg3OTQ4NDEwfQ.qU1rDeuWuCi_x7msdFWf7vEOYUVyGZoGtLb5FWmOvZM'; // ← replace this
// ─────────────────────────────────────────────────────────────────────────────

if (SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.error('ERROR: Paste your service_role key into scripts/seed.js first.');
  console.error('Find it at: Supabase Dashboard → Project Settings → API → service_role');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const courses = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/courses.json'), 'utf8')
);
const rewards = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/rewards.json'), 'utf8')
);

async function seed() {
  console.log('Seeding Supabase with static content...\n');

  // ── 1. Courses ──────────────────────────────────────────────────────────────
  // slug stores the original JSON id ('course-w1', etc.) so the app can
  // look up a course by week without storing UUID in the front-end.
  const courseRows = courses.map((c, idx) => ({
    slug: c.id,
    title: c.title,
    description: c.description,
    week_number: c.weeks || (idx + 1),
    sort_order: c.order || (idx + 1)
  }));

  const { data: insertedCourses, error: e1 } = await supabase
    .from('courses')
    .upsert(courseRows, { onConflict: 'slug' })
    .select('id, slug');

  if (e1) { console.error('courses failed:', e1.message); process.exit(1); }

  // Build slug → UUID map so child tables can reference the right course
  const courseIdOf = Object.fromEntries(insertedCourses.map(r => [r.slug, r.id]));
  console.log(`✓ ${insertedCourses.length} courses`);

  // ── 2. Daily tasks ──────────────────────────────────────────────────────────
  const taskRows = [];
  for (const course of courses) {
    for (const task of course.daily_tasks) {
      taskRows.push({
        slug: `${course.id}-d${task.day_number}`,  // 'course-w1-d1', etc.
        course_id: courseIdOf[course.id],      // UUID looked up above
        day_number: task.day_number,
        title: task.title,
        video_url: task.video_url || '',
        video_duration: task.video_duration || 300 // default 5 mins if missing
      });
    }
  }

  const { data: insertedTasks, error: e2 } = await supabase
    .from('daily_tasks')
    .upsert(taskRows, { onConflict: 'slug' })
    .select('id, slug');

  if (e2) { console.error('daily_tasks failed:', e2.message); process.exit(1); }

  const taskIdOf = Object.fromEntries(insertedTasks.map(r => [r.slug, r.id]));
  console.log(`✓ ${insertedTasks.length} daily tasks`);

  // ── 3. Quiz questions ───────────────────────────────────────────────────────
  const quizRows = [];
  for (const course of courses) {
    for (const task of course.daily_tasks) {
      const taskSlug = `${course.id}-d${task.day_number}`;
      task.quiz_questions.forEach((q, qIndex) => {
        quizRows.push({
          slug: `${taskSlug}-q${qIndex + 1}`,  // 'course-w1-d1-q1', etc.
          task_id: taskIdOf[taskSlug],  // UUID
          question: q.question,
          options: q.options || [],          // JSONB array of 4 strings
          correct_answer: q.correct_answer || 0  // 0-indexed integer
        });
      });
    }
  }

  const { error: e3 } = await supabase
    .from('quiz_questions')
    .upsert(quizRows, { onConflict: 'slug' });

  if (e3) { console.error('quiz_questions failed:', e3.message); process.exit(1); }
  console.log(`✓ ${quizRows.length} quiz questions`);

  // ── 4. Challenges ───────────────────────────────────────────────────────────
  const challengeRows = [];
  for (const course of courses) {
    for (const task of course.daily_tasks) {
      const taskSlug = `${course.id}-d${task.day_number}`;
      // Use 'task' or 'challenge' item from JSON
      const ch = task.challenge || task.task || { title: 'Challenge', description: 'Complete the task.' };
      challengeRows.push({
        slug: `${taskSlug}-c`,              // 'course-w1-d1-c'
        task_id: taskIdOf[taskSlug],  // UUID
        type: ch.type || 'action',            // 'action' | 'reflection' | 'research'
        title: ch.title || 'Daily Challenge',
        description: ch.description || 'Complete the challenge for this lesson.',
        criteria: ch.criteria || 'Self-reported completion'
      });
    }
  }

  const { error: e4 } = await supabase
    .from('challenges')
    .upsert(challengeRows, { onConflict: 'slug' });

  if (e4) { console.error('challenges failed:', e4.message); process.exit(1); }
  console.log(`✓ ${challengeRows.length} challenges`);

  // ── 5. Rewards ──────────────────────────────────────────────────────────────
  const rewardRows = rewards.map(r => ({
    slug: r.id,          // 'reward-b1', 'reward-s1', …
    title: r.title,
    description: r.description,
    icon: r.icon,        // Phosphor icon class string
    cost: r.cost,
    tier: r.tier         // 'bronze' | 'silver' | 'gold'
  }));

  const { error: e5 } = await supabase
    .from('rewards')
    .upsert(rewardRows, { onConflict: 'slug' });

  if (e5) { console.error('rewards failed:', e5.message); process.exit(1); }
  console.log(`✓ ${rewardRows.length} rewards`);

  console.log('\nAll done. Static content is live in Supabase.');
  console.log('Next step: run sql/02_rls_policies.sql in the SQL Editor.');
}

seed().catch(err => { console.error(err); process.exit(1); });
