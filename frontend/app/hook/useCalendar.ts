import { useState, useMemo, useEffect, useCallback } from "react";
import storage from "../utils/storage";
import { getUserRoutinesByDate, getUserGoalsByDate, updateRoutine, updateGoal } from "../service/InfinityhealthApi";
import { useFocusEffect } from "expo-router";

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export interface Task {
    id: number;
    title: string;
    time?: string;
    completed: boolean;
    category: 'routine' | 'goal';
}

export interface MonthDay {
    day: string;
    date: number;
    hasTask: boolean;
}

export const useCalendar = () => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(today.getDate());
    const [showMonthPicker, setShowMonthPicker] = useState(false);

    // Store tasks by date key 'YYYY-MM-DD'
    const [tasks, setTasks] = useState<Record<string, Task[]>>({});
    const [userId, setUserId] = useState<string | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Load User ID
    useEffect(() => {
        const loadUser = async () => {
            const id = await storage.getItem('internalUserId') || await storage.getItem('userId');
            setUserId(id);
        };
        loadUser();
    }, []);

    const getDateKey = (date: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    };

    // Fetch tasks for the selected date
    const fetchTasksForDate = useCallback(async () => {
        if (!userId) return;

        // Clerk ID Safety: Skip if userId starts with "user_"
        if (userId.toString().startsWith('user')) {
            console.warn('[Calendar] Skipping fetch with Clerk ID:', userId);
            return;
        }

        const dateKey = getDateKey(selectedDay);
        console.log('[Calendar] Fetching tasks for:', dateKey);

        try {
            const [routineRes, goalRes] = await Promise.all([
                getUserRoutinesByDate(userId, dateKey),
                getUserGoalsByDate(userId, dateKey)
            ]);

            const newTasks: Task[] = [];

            if (routineRes.success && Array.isArray(routineRes.data)) {
                routineRes.data.forEach((r: any) => {
                    newTasks.push({
                        id: r.id,
                        title: r.title,
                        time: r.scheduledTime || '',
                        completed: r.completed,
                        category: 'routine'
                    });
                });
            }

            if (goalRes.success && Array.isArray(goalRes.data)) {
                goalRes.data.forEach((g: any) => {
                    newTasks.push({
                        id: g.id,
                        title: g.title,
                        completed: g.completed,
                        category: 'goal'
                    });
                });
            }

            setTasks(prev => ({
                ...prev,
                [dateKey]: newTasks
            }));

        } catch (error) {
            console.error('Error fetching calendar tasks:', error);
        }
    }, [userId, selectedDay, year, month]);

    // Re-fetch when date changes, userId changes, or screen is focused
    useEffect(() => {
        fetchTasksForDate();
    }, [fetchTasksForDate]);

    useFocusEffect(
        useCallback(() => {
            fetchTasksForDate();
        }, [fetchTasksForDate])
    );

    // Get all days of the current month
    const monthDays = useMemo<MonthDay[]>(() => {
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const days: MonthDay[] = [];

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            // Note: In a real app we might want to fetch "hasTask" for the entire month
            // For now, it only checks if we have loaded data for that day
            days.push({
                day: DAYS[date.getDay()],
                date: i,
                hasTask: !!tasks[dateKey] && tasks[dateKey].length > 0,
            });
        }
        return days;
    }, [year, month, tasks]);


    // Get tasks for selected date
    const selectedDateTasks = tasks[getDateKey(selectedDay)] || [];
    const routineTasks = selectedDateTasks.filter(t => t.category === 'routine');
    const goalTasks = selectedDateTasks.filter(t => t.category === 'goal');

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDay(1);
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDay(1);
    };

    const selectMonth = (monthIndex: number) => {
        setCurrentDate(new Date(year, monthIndex, 1));
        setSelectedDay(1);
        setShowMonthPicker(false);
    };

    const goToPreviousYear = () => {
        setCurrentDate(new Date(year - 1, month, 1));
    };

    const goToNextYear = () => {
        setCurrentDate(new Date(year + 1, month, 1));
    };

    const isToday = (date: number) => {
        return (
            date === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    const toggleTask = async (taskId: number, category: 'routine' | 'goal') => {
        const dateKey = getDateKey(selectedDay);
        const task = tasks[dateKey]?.find(t => t.id === taskId && t.category === category);
        if (!task || !userId) return;

        // Optimistic Update
        setTasks(prev => ({
            ...prev,
            [dateKey]: prev[dateKey]?.map(t =>
                (t.id === taskId && t.category === category) ? { ...t, completed: !t.completed } : t
            ) || [],
        }));

        try {
            // Call API
            if (category === 'routine') {
                // Use updateRoutine to allow toggling (completeRoutine might only set to true)
                await updateRoutine(taskId, { completed: !task.completed });
            } else {
                await updateGoal(taskId, { completed: !task.completed });
            }
        } catch (error) {
            console.error('Error toggling task:', error);
            // Revert logic could be added here
        }
    };

    return {
        today,
        year,
        month,
        selectedDay,
        setSelectedDay,
        showMonthPicker,
        setShowMonthPicker,
        monthDays,
        selectedDateTasks,
        routineTasks,
        goalTasks,
        goToPreviousMonth,
        goToNextMonth,
        selectMonth,
        goToPreviousYear,
        goToNextYear,
        isToday,
        toggleTask,
    };
};
