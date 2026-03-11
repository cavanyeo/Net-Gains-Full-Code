-- ============================================================
-- 01_create_tables.sql
-- Run this first in the Supabase SQL Editor.
-- Creates all static content tables for Net Gains.
-- ============================================================

-- Static content: the 3 weekly courses
CREATE TABLE IF NOT EXISTS courses (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  week_number INT  NOT NULL,
  sort_order  INT  NOT NULL
);

-- Static content: 7 daily tasks per course (21 total)
CREATE TABLE IF NOT EXISTS daily_tasks (
  id             TEXT PRIMARY KEY,
  course_id      TEXT NOT NULL REFERENCES courses(id),
  day_number     INT  NOT NULL,
  title          TEXT NOT NULL,
  video_url      TEXT NOT NULL,
  video_duration INT  NOT NULL   -- duration in seconds
);

-- Static content: 5 quiz questions per daily task (105 total)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id             TEXT  PRIMARY KEY,
  task_id        TEXT  NOT NULL REFERENCES daily_tasks(id),
  question       TEXT  NOT NULL,
  options        JSONB NOT NULL,  -- array of 4 answer strings
  correct_answer INT   NOT NULL   -- 0-indexed position of the correct option
);

-- Static content: 1 practical challenge per daily task (21 total)
CREATE TABLE IF NOT EXISTS challenges (
  id          TEXT PRIMARY KEY,
  task_id     TEXT NOT NULL REFERENCES daily_tasks(id),
  type        TEXT NOT NULL,  -- 'action' | 'reflection' | 'research'
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria    TEXT NOT NULL
);

-- Static content: rewards redeemable with coins (9 total)
CREATE TABLE IF NOT EXISTS rewards (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  cost        INT  NOT NULL,
  tier        TEXT NOT NULL   -- 'bronze' | 'silver' | 'gold'
);
