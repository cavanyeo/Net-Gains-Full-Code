import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface CourseData {
  id: string;
  title: string;
  weekNumber: number;
  description: string;
  lessons: string;
  duration: string;
  status: "active" | "locked" | "completed";
  progress?: number;
  totalDays: number;
  completedDays?: number;
  icon: string;
  color: string;
}

export function useQuestsData() {
  const { user, guestMode } = useAuth();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuests() {
      if (!user && !guestMode) {
        setLoading(false);
        return;
      }

      if (guestMode) {
        // Mock data similar to the original hardcoded QuestsScreen
        setCourses([
          {
            id: "1",
            title: "The Labor-to-Value Foundation",
            weekNumber: 1,
            description: "Understand the fundamental relationship between time, effort, and financial value.",
            lessons: "7 lessons",
            duration: "7 days",
            status: "active",
            totalDays: 7,
            completedDays: 2,
            icon: "💳",
            color: "#2CC295",
          },
          {
            id: "2",
            title: "The Digital Trap",
            weekNumber: 2,
            description: "Learn how digital platforms are designed to extract your money and time unconsciously.",
            lessons: "7 lessons",
            duration: "7 days",
            status: "locked",
            totalDays: 7,
            icon: "🎯",
            color: "#00DF81",
          },
          {
            id: "3",
            title: "The Scam Dojo",
            weekNumber: 3,
            description: "Master the psychology behind scams and build an impenetrable defense.",
            lessons: "7 lessons",
            duration: "7 days",
            status: "locked",
            totalDays: 7,
            icon: "🛡️",
            color: "#03624C",
          }
        ]);
        setLoading(false);
        return;
      }

      try {
        // Fetch courses
        const { data: dbCourses } = await supabase
          .from('courses')
          .select('*')
          .order('sort_order');

        if (!dbCourses) {
          setLoading(false);
          return;
        }
        
        // Fetch progress for this user
        const { data: userProgress } = await supabase
          .from('user_progress')
          .select('course_id, status')
          .eq('user_id', user!.auth_id)
          .eq('status', 'completed');

        // Map progress
        const progressCountByCourse: Record<string, number> = {};
        userProgress?.forEach(p => {
          progressCountByCourse[p.course_id] = (progressCountByCourse[p.course_id] || 0) + 1;
        });

        // Determine active course
        // Simple logic: first course that doesn't have 7 completed days is active.
        let activeFound = false;

        const mappedCourses: CourseData[] = dbCourses.map((c, index) => {
          const totalDays = 7; // Assuming 7 days per week
          const isMasterUnlocked = localStorage.getItem('ng_master_unlocked') === 'true';
          const completedDays = isMasterUnlocked ? totalDays : (progressCountByCourse[c.id] || 0);
          
          let status: "active" | "locked" | "completed" = "locked";
          if (completedDays >= totalDays) {
             status = "completed";
          } else if (!activeFound) {
             status = "active";
             activeFound = true;
          }

          // Assign default colors based on index
          const colors = ["#2CC295", "#00DF81", "#03624C", "#17876D", "#2FA98C"];
          const color = colors[index % colors.length];
          const icons = ["💳", "🎯", "🛡️", "💰", "📊"];
          const icon = icons[index % icons.length];

          return {
            id: c.id,
            title: c.title,
            weekNumber: c.week_number || (index + 1),
            description: c.description || "Continue your financial journey.",
            lessons: "7 lessons",
            duration: "7 days",
            status,
            totalDays,
            completedDays,
            icon,
            color
          };
        });

        setCourses(mappedCourses);
      } catch (err) {
        console.error("Failed to load quests data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.auth_id || guestMode) {
      fetchQuests();
    }
  }, [user?.auth_id, guestMode]);

  return { courses, loading };
}
