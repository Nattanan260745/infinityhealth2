import { CalendarDay, Routine, Mission } from "@/src/types";
import { useState } from "react";

const weekDays: CalendarDay[] = [
    { day: 'Sun', date: 14 },
    { day: 'Mon', date: 15 },
    { day: 'Tue', date: 16 },
    { day: 'Wed', date: 17 },
    { day: 'Thu', date: 18 },
    { day: 'Fri', date: 19 },
    { day: 'Sat', date: 20 },
];

const routines: Routine[] = [
    { id: 1, title: 'Clean Up', time: '13.00 A.M.', status: 'pending' },
    { id: 2, title: 'Go Shopping', time: '12.00 A.M.', status: 'completed' },
    { id: 3, title: 'Clean Up', time: '11.00 A.M.', status: 'cancelled' },
];

const missions: Mission[] = [
    { id: 1, title: 'Missions', subtitle: "Complete daily tasks", icon: '🎯' },
    { id: 2, title: 'Health Tracking', subtitle: 'Track your health', icon: '❤️' },
    { id: 3, title: 'Exercise', subtitle: 'Workout routines', icon: '💪' },
];

export const useHomePage = () => {
    const [selectedDate, setSelectedDate] = useState(15);
    const [currentMission, setCurrentMission] = useState(0);
    
    return {
        weekDays,
        routines,
        missions,
        selectedDate,
        setSelectedDate,
        currentMission,
        setCurrentMission,
    }
}