import { CalendarDay, Routine, Mission } from "@/src/types";
import { useEffect, useState, useCallback } from "react";
import { StyleSheet, Platform, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import storage from "../utils/storage";
import { HealthCheckResponse } from "../interface/infinityhealth.interface";
import { getHealthCheck, logout, getUserRoutinesByDate } from "../service/InfinityhealthApi";

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#FFFFFF'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: 300,
        maxHeight: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    unreadNotification: {
        backgroundColor: '#F0FDFA',
    },
    notificationDot: {
        width: 20,
        alignItems: 'center',
        paddingTop: 6,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#7DD1E0',
    },
    notificationText: {
        fontSize: 14,
        color: '#1F2937',
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});

// Helper to get current week (Mon-Sun or Sun-Sat)
const getWeekDays = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    // startOfWeek.setDate(today.getDate() - currentDay); // Start from Today now

    const days: (CalendarDay & { fullDate: string })[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push({
            day: dayNames[d.getDay()],
            date: d.getDate(),
            fullDate: d.toISOString().split('T')[0] // Store YYYY-MM-DD
        });
    }
    return days;
};

const missions: Mission[] = [
    { id: 1, title: 'Missions', subtitle: "Complete daily tasks", icon: '🎯' },
    { id: 2, title: 'Health Tracking', subtitle: 'Track your health', icon: '❤️' },
    { id: 3, title: 'Exercise', subtitle: 'Workout routines', icon: '💪' },
    { id: 4, title: 'Routine', subtitle: 'Self-Care Planner', icon: '📋' },
];

export const useHomePage = () => {
    const [weekDays, setWeekDays] = useState<any[]>([]); // Use state or memo
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());
    const [currentMission, setCurrentMission] = useState(0);
    const [isLoad, setisLoad] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>('User');
    const [userId, setUserId] = useState<string | null>(null);
    const [routines, setRoutines] = useState<Routine[]>([]);

    useEffect(() => {
        setWeekDays(getWeekDays());
    }, []);

    const getHealthCheckApi = async () => {
        if (isLoad) return;
        setisLoad(true);

        try {
            const res: HealthCheckResponse = await getHealthCheck();
            if (res) {
                setisLoad(false);
                console.log('Health check response:', res.status);
            }

        } catch (error) {
            console.error('Error fetching health check:', error);
            setisLoad(false);
        }
    }

    // Load user data from storage
    const loadUserData = async () => {
        try {
            const fullName = await storage.getItem('userFullName');
            const id = await storage.getItem('userId');
            if (fullName) setUserName(fullName);
            if (id) setUserId(id);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    // Fetch Routines for Selected Date
    const fetchRoutines = useCallback(async () => {
        if (!userId) return;

        // Try to find the exact date from weekDays
        let queryDate = '';
        const foundDay = weekDays.find((d: any) => d.date === selectedDate);

        if (foundDay && foundDay.fullDate) {
            queryDate = foundDay.fullDate;
        } else {
            // Fallback (e.g. initial load before weekDays populated, or user picked date outside range?)
            // Or simple construction if weekDays empty
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate).padStart(2, '0');
            queryDate = `${year}-${month}-${day}`;
        }

        console.log('Fetching routines for:', queryDate);

        try {
            const res = await getUserRoutinesByDate(userId, queryDate);
            if (res.success && Array.isArray(res.data)) {
                const mapped: Routine[] = res.data.map((r: any) => ({
                    id: r.id,
                    title: r.title,
                    time: r.scheduledTime || '',
                    status: r.completed ? 'completed' : 'pending' // Map boolean to status string
                }));
                setRoutines(mapped);
            } else {
                setRoutines([]);
            }
        } catch (e) {
            console.error('Error fetching routines for dashboard:', e);
            setRoutines([]);
        }
    }, [userId, selectedDate, weekDays]);

    useFocusEffect(
        useCallback(() => {
            fetchRoutines();
        }, [fetchRoutines])
    );

    // Trigger fetch when selectedDate changes (via fetchRoutines reference change)
    useEffect(() => {
        fetchRoutines();
    }, [fetchRoutines]);

    // Logout function
    const handleLogout = async () => {
        const confirmLogout = () => {
            return new Promise<boolean>((resolve) => {
                if (Platform.OS === 'web') {
                    resolve(window.confirm('Are you sure you want to logout?'));
                } else {
                    Alert.alert(
                        'Logout',
                        'Are you sure you want to logout?',
                        [
                            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                            { text: 'Logout', style: 'destructive', onPress: () => resolve(true) },
                        ]
                    );
                }
            });
        };

        const confirmed = await confirmLogout();
        if (!confirmed) return;

        try {
            // Call logout API
            await logout();
        } catch (error) {
            console.error('Logout API error:', error);
        }

        // Clear storage
        await storage.removeItem('userId');
        await storage.removeItem('userEmail');
        await storage.removeItem('userFullName');
        await storage.removeItem('token');

        console.log('[HomePage] Logged out, redirecting to login...');

        // Redirect to login
        router.replace('/(auth)/login');
    };

    useEffect(() => {
        getHealthCheckApi();
        loadUserData();
    }, [])


    return {
        styles,
        weekDays,
        routines,
        missions,
        selectedDate,
        setSelectedDate,
        currentMission,
        setCurrentMission,
        isLoad,
        userName,
        handleLogout,
    }
}

export type IuseHomePage = ReturnType<typeof useHomePage>;