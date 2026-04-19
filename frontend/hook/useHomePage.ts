import { CalendarDay, Routine, Mission } from "@/src/types";
import { useEffect, useState, useCallback } from "react";
import { StyleSheet, Platform, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import storage from "../utils/storage";
import { HealthCheckResponse } from "../interface/infinityhealth.interface";
import { getHealthCheck, getUserRoutinesByDate, syncClerkUser, getUserNotifications, getUserProfile } from "../service/InfinityhealthApi";
import { useUser, useAuth } from "@clerk/clerk-expo";
import * as Notifications from 'expo-notifications';

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#FFFFFF'
    }
});

// Helper to get current week (Mon-Sun or Sun-Sat)
const getWeekDays = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    // startOfWeek.setDate(today.getDate() - currentDay); // Start from Today now

    const days: (CalendarDay & { fullDate: string })[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const toLocalYMD = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push({
            day: dayNames[d.getDay()],
            date: d.getDate(),
            fullDate: toLocalYMD(d) // Use local YMD to avoid UTC shifts
        });
    }
    return days;
};

const missions: Mission[] = [
    { id: 1, title: 'Missions', subtitle: "Complete daily tasks", icon: '🎯' },
    { id: 3, title: 'Exercise', subtitle: 'Workout routines', icon: '💪' },
    { id: 4, title: 'Routine', subtitle: 'Self-Care Planner', icon: '📋' },
];

export const useHomePage = () => {
    const { user } = useUser();
    const { signOut } = useAuth();
    const [weekDays, setWeekDays] = useState<any[]>([]); // Use state or memo
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());
    const [currentMission, setCurrentMission] = useState(0);
    const [isLoad, setisLoad] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>('User');
    const [userAvatar, setUserAvatar] = useState<string>('https://i.pravatar.cc/100?img=47');
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

    // Load user data from Clerk and sync to storage
    const loadUserData = async () => {
        if (user) {
            const clerkName = user.fullName || user.firstName || 'User';
            
            // Try to load cached name for instant UI update
            const cachedName = await storage.getItem('userFullName');
            setUserName(cachedName || clerkName);

            // Fetch latest profile from backend to sync
            const internalId = await storage.getItem('internalUserId');
            if (internalId) {
                try {
                    const res = await getUserProfile(internalId);
                    if (res.success && res.data?.user?.firstName) {
                        const backendName = res.data.user.firstName;
                        setUserName(backendName);
                        await storage.setItem('userFullName', backendName);
                    }
                } catch (err: any) {
                    if (err.response?.status === 404) {
                        console.warn('[HomePage] User ID not found in current database. Clearing cache...');
                        await storage.removeItem('internalUserId');
                        await storage.removeItem('userFullName');
                        setUserId(null);
                    }
                }
            } else {
                console.log('[HomePage] Internal ID not found yet. Waiting for global sync...');
            }

            if (user.imageUrl) {
                setUserAvatar(user.imageUrl);
            }
        }
    };

    // Fetch Routines for Selected Date
    const fetchRoutines = useCallback(async () => {
        if (!userId) return;

        // Extra Safety: Check if userId looks like an internal ID (numeric)
        // If it starts with "user", it's likely a Clerk ID and we should skip to avoid 500 Error
        if (userId.toString().startsWith('user')) {
            console.warn('[HomePage] Skipping fetch with likely Clerk ID:', userId);
            return;
        }

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

                // Note: Notifications are handled by usePushNotifications at the time of creation/edit
                // This keeps the Home Page focus on display stability.
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
            await signOut();
        } catch (error) {
            console.error('Logout API error:', error);
        }

        // Clear storage
        await storage.removeItem('userId');
        await storage.removeItem('userEmail');
        await storage.removeItem('userFullName');
        await storage.removeItem('token');

        console.log('[HomePage] Logged out, redirecting to login...');

        // Redirect handled by auth state change in index.tsx usually, but explicit replace is fine
        // router.replace('/(auth)/login'); 
    };

    useEffect(() => {
        getHealthCheckApi();
    }, [])

    useEffect(() => {
        loadUserData();
    }, [user]);


    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // Refresh all data
        try {
            await Promise.all([
                fetchRoutines(),
                loadUserData()
            ]);
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setRefreshing(false);
        }
    }, [fetchRoutines, loadUserData]); // fetchNotifications is defined inside but depends on userId which is stable or handled

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
        userAvatar,
        handleLogout,
        refreshing,
        onRefresh
    }
}

export type IuseHomePage = ReturnType<typeof useHomePage>;