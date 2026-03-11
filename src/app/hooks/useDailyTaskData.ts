import { useState, useEffect } from 'react';
import coursesData from '../data/courses.json';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
}

export interface DailyTaskData {
  day_number: number;
  title: string;
  video_url: string;
  video_title: string;
  challenge: {
    title: string;
    description: string;
    coins: number;
  };
  task: {
    title: string;
    description: string;
    coins: number;
  };
  quiz_questions: QuizQuestion[];
}

export function useDailyTaskData(day: number) {
  const [taskData, setTaskData] = useState<DailyTaskData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In guest mode, or fallback, we just pull from local data
    let foundTask: DailyTaskData | null = null;
    
    for (const course of coursesData) {
      if (course.daily_tasks) {
        const task = course.daily_tasks.find((t: any) => t.day_number === day);
        if (task) {
          foundTask = task as DailyTaskData;
          break;
        }
      }
    }
    
    setTaskData(foundTask);
    setLoading(false);
  }, [day]);

  return { taskData, loading };
}
