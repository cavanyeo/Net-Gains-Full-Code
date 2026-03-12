import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface DashboardData {
  weeklyCoins: number;
  weeklyGoal: number;
  progressPercent: number;
  currentCourse: {
    id: string;
    title: string;
    week_number: number;
    completed_days: number;
  } | null;
  loading: boolean;
}

export function useDashboardData(): DashboardData {
  const { user, guestMode } = useAuth();
  const [data, setData] = useState<Omit<DashboardData, 'loading'>>({
    weeklyCoins: 0,
    weeklyGoal: 700,
    progressPercent: 0,
    currentCourse: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user && !guestMode) {
        setLoading(false);
        return;
      }

      if (guestMode) {
        setData({
          weeklyCoins: 150,
          weeklyGoal: 700,
          progressPercent: Math.round((150 / 700) * 100),
          currentCourse: {
            id: 'course-w1',
            title: 'The Digital Trap',
            week_number: 1,
            completed_days: 1
          }
        });
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch current active course
        const { data: courses } = await supabase
          .from('courses')
          .select('*')
          .order('sort_order')
          .limit(1);
          
        const course = courses?.[0];

        let weeklyCoins = 0;
        let completedDays = 0;

        // user.id is the DB row UUID, used as FK in other tables
        if (course && user?.id) {
          // 2. Fetch weekly coins from coin_ledger
          // coin_ledger columns: id, user_id, amount, reason, created_at
          const { data: ledger } = await supabase
            .from('coin_ledger')
            .select('amount, reason')
            .eq('user_id', user.id);

          weeklyCoins = ledger?.reduce((sum, txn) => sum + txn.amount, 0) || 0;

          // 3. Fetch completed days from user_progress
          // user_progress columns: id, user_id, course_id, task_id, status, quiz_score, attempts, completed_at, created_at
          const { count } = await supabase
             .from('user_progress')
             .select('*', { count: 'exact', head: true })
             .eq('user_id', user.id)
             .eq('course_id', course.id)
             .eq('status', 'completed');
             
          completedDays = count || 0;
        }

        const weeklyGoal = 700;
        const progressPercent = Math.min(Math.round((weeklyCoins / weeklyGoal) * 100), 100);

        setData({
          weeklyCoins,
          weeklyGoal,
          progressPercent,
          currentCourse: course ? {
            id: course.slug || course.id,
            title: course.title,
            week_number: course.week_number || 1,
            completed_days: completedDays,
          } : null
        });

      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }

    if (user?.auth_id || guestMode) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.auth_id, guestMode]);

  return { ...data, loading };
}
