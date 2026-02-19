import { CalendarDay, Routine, Mission } from "@/src/types";
import { useEffect, useState, useCallback } from "react";
import { StyleSheet, Platform, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import storage from "../utils/storage";
import { HealthCheckResponse } from "../interface/infinityhealth.interface";
import { getHealthCheck, getUserRoutinesByDate, syncClerkUser, getUserNotifications } from "../service/InfinityhealthApi";
import { useUser, useAuth } from "@clerk/clerk-expo";
import * as Notifications from 'expo-notifications';

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#FFFFFF'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    notificationContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        width: '100%',
        maxHeight: '80%', // Allow mostly full height
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        paddingBottom: 20, // Add padding for bottom safe area
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

    // Notification Logic (Simplified: Routines = Notifications)
    const [notifications, setNotifications] = useState<any[]>([]);

    const fetchNotifications = async () => {
        if (!userId) return;
        try {
            // 1. Fetch Routines for Today
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${day}`;
            const res = await getUserRoutinesByDate(userId, today);
            let notifs: any[] = [];

            if (res.success && Array.isArray(res.data)) {
                notifs = res.data.map((r: any) => ({
                    id: r.id, // specific ID
                    title: r.title,
                    subtitle: r.scheduledTime ? `Scheduled: ${r.scheduledTime}` : 'Daily Routine',
                    time: r.scheduledTime || 'Today',
                    type: 'planner',
                    isRead: false // default
                }));
            }

            // 2. Check Local Storage for "Read" status
            const readKey = `read_notifications_${today}`; // reset daily
            const readData = await storage.getItem(readKey);
            const readIds: number[] = readData ? JSON.parse(readData) : [];

            // 3. Apply Read Status
            const finalNotifs = notifs.map(n => ({
                ...n,
                isRead: readIds.includes(n.id)
            }));

            setNotifications(finalNotifs);

        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleDeleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleClearAllNotifications = () => {
        setNotifications([]);
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [userId])
    );

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
            const name = user.fullName || user.firstName || 'User';
            setUserName(name);
            // setUserId(user.id); // DO NOT SET CLERK ID IMMEDIATELY to avoid race condition with fetchRoutines

            // Check if we have Internal ID in storage first
            const cachedInternalId = await storage.getItem('internalUserId');
            if (cachedInternalId) {
                setUserId(cachedInternalId);
                console.log('[HomePage] Loaded cached Internal ID:', cachedInternalId);
            } else {
                if (user.primaryEmailAddress) {
                    const email = user.primaryEmailAddress.emailAddress;
                    await storage.setItem('userEmail', email);

                    // SYNC W/ BACKEND TO GET INTERNAL ID Only if not cached
                    try {
                        const syncRes = await syncClerkUser(email, user.firstName || 'User', user.lastName || '', user.imageUrl || '');
                        if (syncRes && syncRes.success && (syncRes as any).user) {
                            const internalId = String(((syncRes as any).user).id);
                            setUserId(internalId);
                            await storage.setItem('userId', internalId);
                            await storage.setItem('internalUserId', internalId);
                            console.log('[HomePage] User Synced. Internal ID:', internalId);
                        } else {
                            // Fallback? If sync fails, we can't really do much API wise if backend requires Int ID.
                            console.warn('[HomePage] Sync failed or no user returned');
                        }
                    } catch (e) {
                        console.error('[HomePage] Failed to sync user:', e);
                    }
                }
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

                // SCHEDULE LOCAL NOTIFICATIONS FOR TODAY'S PENDING ROUTINES
                // Only if looking at TODAY
                const todayStr = new Date().toISOString().split('T')[0];
                if (queryDate === todayStr) {
                    // Cancel all existing to avoid dupes (optional, but cleaner)
                    await Notifications.cancelAllScheduledNotificationsAsync();

                    for (const r of mapped) {
                        if (r.status === 'pending' && r.time) {
                            const [hours, minutes] = r.time.split(':').map(Number);
                            const triggerDate = new Date();
                            triggerDate.setHours(hours, minutes, 0, 0);

                            // Only schedule if time is in future
                            if (triggerDate > new Date()) {
                                await Notifications.scheduleNotificationAsync({
                                    content: {
                                        title: "InfinityHealth Routine",
                                        body: `It's time for: ${r.title}`,
                                        data: { routineId: r.id },
                                    },
                                    trigger: {
                                        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                                        hour: hours,
                                        minute: minutes,
                                        repeats: false,
                                    },
                                });
                                console.log(`Scheduled notification for ${r.title} at ${r.time}`);
                            }
                        }
                    }
                }
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
                fetchNotifications(),
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
        notifications,
        handleDeleteNotification,
        handleClearAllNotifications,
        unreadCount,
        refreshing,
        onRefresh
    }
}

export type IuseHomePage = ReturnType<typeof useHomePage>;