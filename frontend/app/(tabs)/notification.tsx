import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { NotificationItem } from '../components/HomePage/NotificationItem';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect } from 'expo-router';
import storage from '../utils/storage';
import { getUserRoutinesByDate, getUserGoalsByDate, getUserProfile } from '../service/InfinityhealthApi';

export default function NotificationScreen() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const userId = await storage.getItem('userId');
            if (!userId) {
                setNotifications([]);
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            const [routineRes, goalRes, profileRes] = await Promise.all([
                getUserRoutinesByDate(userId, today),
                getUserGoalsByDate(userId, today),
                getUserProfile(userId)
            ]);

            let newNotifications: any[] = [];

            // 1. Rank Up Notification (Priority)
            if (profileRes.success && profileRes.data) {
                const userLevel = profileRes.data.level_id;
                // Assuming Level 10 is the cap for Beginner
                if (userLevel === 10) {
                    newNotifications.push({
                        id: 'rank-up-10',
                        title: 'Rank Up Available! 🏆',
                        subtitle: 'You reached Level 10. Tap to Rank Up!',
                        time: 'Now',
                        type: 'alert', // Use a distinct type or map to existing styles
                        isLocal: false
                    });
                }
            }

            if (routineRes.success && Array.isArray(routineRes.data)) {
                // Current time in minutes
                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();

                const routineNotifs = routineRes.data
                    .filter((r: any) => {
                        // 1. Filter out completed tasks
                        if (r.completed) return false;

                        // 2. Time Logic
                        if (!r.scheduledTime) return true; // No time = All day, keep it

                        const [h, m] = r.scheduledTime.split(':').map(Number);
                        const routineMinutes = h * 60 + m;

                        // Calculate difference
                        // If routine is in the past (overdue) -> Keep it
                        // If routine is in the future -> Keep ONLY if within 2 hours (120 mins)
                        const diff = routineMinutes - currentMinutes;

                        // diff < 0 means past
                        // diff <= 120 means within 2 hours
                        return diff <= 120; // Shows Overdue + Upcoming in 2 hours
                    })
                    .map((r: any) => ({
                        id: `routine-${r.id}`,
                        title: r.title,
                        subtitle: r.scheduledTime ? `Scheduled at ${r.scheduledTime}` : 'Check your routine',
                        time: r.scheduledTime ? r.scheduledTime : 'Today',
                        type: 'planner',
                        isLocal: false
                    }));
                newNotifications = [...routineNotifs, ...newNotifications];
            }

            if (goalRes.success && Array.isArray(goalRes.data)) {
                const goalNotifs = goalRes.data
                    .filter((g: any) => !g.completed) // Filter out completed goals
                    .map((g: any) => ({
                        id: `goal-${g.id}`,
                        title: 'Goal Reminder: ' + g.title,
                        subtitle: 'Keep up the good work!',
                        time: 'Today',
                        type: 'success',
                        isLocal: false
                    }));
                newNotifications = [...goalNotifs, ...newNotifications];
            }

            // FILTER DISMISSED NOTIFICATIONS
            const dismissedKey = `dismissed_notifications_${today}`;
            const dismissedData = await storage.getItem(dismissedKey);
            const dismissedIds = dismissedData ? JSON.parse(dismissedData) : [];

            newNotifications = newNotifications.filter(n => !dismissedIds.includes(n.id));

            setNotifications(newNotifications);

        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const handleDeleteNotification = async (id: string) => {
        // 1. Update UI immediately
        setNotifications(prev => prev.filter(n => n.id !== id));

        // 2. Persist dismissal
        const today = new Date().toISOString().split('T')[0];
        const dismissedKey = `dismissed_notifications_${today}`;
        try {
            const dismissedData = await storage.getItem(dismissedKey);
            const dismissedIds = dismissedData ? JSON.parse(dismissedData) : [];
            if (!dismissedIds.includes(id)) {
                dismissedIds.push(id);
                await storage.setItem(dismissedKey, JSON.stringify(dismissedIds));
            }
        } catch (error) {
            console.error("Failed to save dismissed notification", error);
        }
    };

    const handleClearAllNotifications = async () => {
        const currentIds = notifications.map(n => n.id);
        setNotifications([]); // Clear UI immediately

        const today = new Date().toISOString().split('T')[0];
        const dismissedKey = `dismissed_notifications_${today}`;
        try {
            const dismissedData = await storage.getItem(dismissedKey);
            let dismissedIds = dismissedData ? JSON.parse(dismissedData) : [];
            // Merge new ids
            const uniqueIds = Array.from(new Set([...dismissedIds, ...currentIds]));
            await storage.setItem(dismissedKey, JSON.stringify(uniqueIds));
        } catch (error) {
            console.error("Failed to save cleared notifications", error);
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Notification</Text>
                    <TouchableOpacity
                        onPress={handleClearAllNotifications}
                        style={styles.clearButton}
                    >
                        <Text style={styles.clearButtonText}>Clear All</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#7DD1E0" />
                    </View>
                ) : (
                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {notifications.length > 0 ? (
                            notifications.map((notif: any) => (
                                <NotificationItem
                                    key={notif.id}
                                    id={notif.id}
                                    title={notif.title}
                                    subtitle={notif.subtitle}
                                    time={notif.time}
                                    type={notif.type}
                                    onDelete={() => handleDeleteNotification(notif.id)}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
                                <Text style={styles.emptyStateText}>No new notifications</Text>
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingTop: Platform.OS === 'web' ? 40 : 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    clearButton: {
        backgroundColor: '#7DD1E0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    clearButtonText: {
        color: '#005F73',
        fontWeight: 'bold',
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
        padding: 20,
        paddingBottom: 100, // Safe space for nav bar
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyStateText: {
        color: '#9CA3AF',
        marginTop: 16,
        fontSize: 16,
    }
});
