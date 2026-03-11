import { supabase } from './supabase.js';

let cachedCourses = null;
let cachedRewards = null;

export async function fetchCourses() {
    if (cachedCourses) return cachedCourses;

    try {
        const { data: courses, error } = await supabase
            .from('courses')
            .select(`
                id:slug,
                title,
                description,
                weeks:week_number,
                order:sort_order,
                daily_tasks (
                    id:slug,
                    day_number,
                    title,
                    video_url,
                    video_duration,
                    quiz_questions (
                        id:slug,
                        question,
                        options,
                        correct_answer
                    ),
                    challenges (
                        id:slug,
                        type,
                        title,
                        description,
                        criteria
                    )
                )
            `)
            .order('sort_order');

        if (error) throw error;

        // Reshape data to match exactly what the frontend expects
        cachedCourses = courses.map(c => {
            // Re-map aliased/mismatched properties
            const course = {
                id: c.id,
                title: c.title,
                description: c.description,
                week_number: c.weeks,
                order: c.order,
                total_coins: 700,
                daily_tasks: (c.daily_tasks || []).map(t => {
                    const task = { ...t };
                    // Ensure quiz questions are sorted
                    task.quiz_questions = (task.quiz_questions || []).sort((a, b) => {
                        const idxA = parseInt((a.id || '').split('-q')[1] || 0);
                        const idxB = parseInt((b.id || '').split('-q')[1] || 0);
                        return idxA - idxB;
                    });
                    
                    // Challenges is a foreign key array. Extract the first one.
                    const ch = Array.isArray(t.challenges) ? t.challenges[0] : t.challenges;
                    if (ch) {
                        task.task = {
                            title: ch.title,
                            description: ch.description,
                            coins: 30 // default from older logic
                        };
                        task.challenge = {
                            title: ch.title,
                            description: ch.criteria,
                            coins: 20 // default from older logic
                        };
                    }
                    return task;
                }).sort((a, b) => a.day_number - b.day_number)
            };
            return course;
        });

        return cachedCourses;
    } catch (e) {
        console.error("Failed to load courses from Supabase:", e);
        
        // Fallback to local JSON if Supabase fails (e.g. offline)
        const resp = await fetch('./data/courses.json');
        cachedCourses = await resp.json();
        return cachedCourses;
    }
}

export async function fetchRewards() {
    if (cachedRewards) return cachedRewards;

    try {
        const { data: rewards, error } = await supabase
            .from('rewards')
            .select('id:slug, title, description, icon, cost, tier')
            .eq('is_active', true)
            // Can't sort logically by tier directly in SQL unless we add a separate sort_order,
            // so we'll sort in JS or use cost.
            .order('cost', { ascending: true });

        if (error) throw error;
        
        cachedRewards = rewards;
        return cachedRewards;
    } catch (e) {
        console.error("Failed to load rewards from Supabase:", e);
        
        const resp = await fetch('./data/rewards.json');
        cachedRewards = await resp.json();
        return cachedRewards;
    }
}
