import { useState, useMemo } from "react";

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

// Tasks organized by date (key format: 'YYYY-MM-DD')
const tasksByDate: Record<string, Task[]> = {
    '2025-12-01': [
        { id: 1, title: 'Morning Meditation', time: '6.00 AM', completed: true, category: 'routine' },
        { id: 2, title: 'Team Meeting', time: '10.00 AM', completed: true, category: 'routine' },
        { id: 3, title: 'Drink 8 glasses of water', completed: false, category: 'goal' },
    ],
    '2025-12-02': [
        { id: 4, title: 'Yoga Class', time: '7.00 AM', completed: true, category: 'routine' },
        { id: 5, title: 'Read 20 pages', completed: false, category: 'goal' },
    ],
    '2025-12-04': [
        { id: 6, title: 'Go Shopping', time: '2.00 PM', completed: true, category: 'routine' },
        { id: 7, title: 'Clean up', time: '4.00 PM', completed: false, category: 'routine' },
        { id: 8, title: 'Exercise for 30 minutes', completed: true, category: 'goal' },
        { id: 9, title: 'No Sugar', completed: false, category: 'goal' },
    ],
    '2025-12-06': [
        { id: 10, title: 'Dentist Appointment', time: '9.00 AM', completed: false, category: 'routine' },
        { id: 11, title: 'Read 30 pages', completed: false, category: 'goal' },
    ],
    '2025-12-08': [
        { id: 12, title: 'Gym Session', time: '6.00 AM', completed: true, category: 'routine' },
        { id: 13, title: 'Walk 10,000 steps', completed: true, category: 'goal' },
    ],
    '2025-12-10': [
        { id: 14, title: 'Project Deadline', time: '5.00 PM', completed: false, category: 'routine' },
        { id: 15, title: 'Finish report', completed: false, category: 'goal' },
    ],
    '2025-12-15': [
        { id: 16, title: 'Birthday Party', time: '6.00 PM', completed: false, category: 'routine' },
        { id: 17, title: 'Call parents', completed: true, category: 'goal' },
    ],
    '2025-12-20': [
        { id: 18, title: 'Christmas Shopping', time: '10.00 AM', completed: false, category: 'routine' },
        { id: 19, title: 'Wrap gifts', completed: false, category: 'goal' },
    ],
    '2025-12-25': [
        { id: 20, title: 'Christmas Celebration', time: '12.00 PM', completed: false, category: 'routine' },
        { id: 21, title: 'Family dinner', time: '7.00 PM', completed: false, category: 'routine' },
    ],
    '2025-12-31': [
        { id: 22, title: 'New Year Eve Party', time: '8.00 PM', completed: false, category: 'routine' },
        { id: 23, title: 'Set 2026 goals', completed: false, category: 'goal' },
    ],
};

export const useCalendar = () => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(today.getDate());
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [tasks, setTasks] = useState(tasksByDate);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get all days of the current month
    const monthDays = useMemo<MonthDay[]>(() => {
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const days: MonthDay[] = [];

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                day: DAYS[date.getDay()],
                date: i,
                hasTask: !!tasks[dateKey],
            });
        }
        return days;
    }, [year, month, tasks]);

    // Get date key for current selection
    const getDateKey = (d: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    };

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

    const toggleTask = (taskId: number) => {
        const dateKey = getDateKey(selectedDay);
        setTasks(prev => ({
            ...prev,
            [dateKey]: prev[dateKey]?.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            ) || [],
        }));
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

