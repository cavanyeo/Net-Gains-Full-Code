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
        // Guest mode mock data
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

        if (course && user?.id) {
          // 2. Fetch weekly coins (similar to store.js logic)
          const { data: ledger } = await supabase
            .from('coin_ledger')
            .select('amount, transaction_type, description')
            .eq('user_id', user.id)
            .in('transaction_type', ['task', 'streak_bonus'])
            .like('description', `%${course.slug}%`);

          weeklyCoins = ledger?.reduce((sum, txn) => sum + txn.amount, 0) || 0;

          // 3. Fetch completed days
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
            id: course.slug,
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

    if (user?.id || guestMode) {
      loadData();
    }
  }, [user?.id, guestMode]);

  return { ...data, loading };
}
