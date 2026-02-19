import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { NotificationItem } from '../components/HomePage/NotificationItem';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect } from 'expo-router';
import storage from '../utils/storage';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
    getUserRoutinesByDate
} from '../service/InfinityhealthApi';
import { Notification } from '../interface/infinityhealth.interface';

import { usePushNotifications } from '../hook/usePushNotifications';

export default function NotificationScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { notification } = usePushNotifications(); // Listen for incoming pushes

    // Helper to get today YYYY-MM-DD in local time
    const getTodayStr = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const userId = await storage.getItem('userId');
            console.log('[NotificationScreen] Fetching for UserId:', userId);

            if (!userId) {
                console.log('[NotificationScreen] No UserId found in storage');
                setNotifications([]);
                return;
            }

            // 1. Fetch Backend Notifications
            const notifRes = await getUserNotifications(userId);
            let backendNotifs: Notification[] = [];
            if (notifRes.success && notifRes.data) {
                backendNotifs = notifRes.data;
            }

            // 2. Fetch Today's Routines (Local Notifications)
            const today = getTodayStr();
            console.log('[NotificationScreen] Fetching routines for local display:', today);

            // Note: getUserRoutinesByDate returns { success: boolean, data: Routine[] }
            const routineRes = await getUserRoutinesByDate(userId, today);
            let routineNotifs: Notification[] = [];

            if (routineRes.success && Array.isArray(routineRes.data)) {
                // Check local read status for routines
                const readKey = `read_notifications_${today}`;
                const readData = await storage.getItem(readKey);
                const readIds: number[] = readData ? JSON.parse(readData) : [];

                // Check local deleted status
                const deleteKey = `deleted_notifications_${today}`;
                const deleteData = await storage.getItem(deleteKey);
                const deletedIds: number[] = deleteData ? JSON.parse(deleteData) : [];

                const now = new Date();
                const currentHours = now.getHours();
                const currentMinutes = now.getMinutes();

                routineNotifs = routineRes.data
                    .filter((r: any) => {
                        // 1. Check Deletion
                        if (deletedIds.includes(r.id)) return false;

                        // 2. Check Time (Only show if time has passed)
                        if (r.scheduledTime) {
                            const [h, m] = r.scheduledTime.split(':').map(Number);
                            if (h > currentHours) return false;
                            if (h === currentHours && m > currentMinutes) return false;
                        }
                        return true;
                    })
                    .map((r: any) => {
                        // Create a valid date object for sorting
                        // r.scheduledTime is "HH:MM"
                        let createdDate = new Date();
                        if (r.scheduledTime) {
                            const [h, m] = r.scheduledTime.split(':');
                            createdDate.setHours(parseInt(h), parseInt(m), 0, 0);
                        }

                        // Use Negative ID for Routines to avoid collision with DB IDs
                        // r.id is likely number
                        return {
                            id: -Math.abs(r.id),
                            userId: parseInt(userId),
                            type: 'ROUTINE',
                            title: 'Routine Reminder',
                            message: `It's time for: ${r.title}`,
                            isRead: readIds.includes(r.id), // Check against original ID
                            referenceId: r.id, // Keep original ID here
                            createdAt: createdDate.toISOString()
                        };
                    });
            }

            // 3. Merge & Sort
            const allNotifs = [...backendNotifs, ...routineNotifs];
            const sorted = allNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            console.log(`[NotificationScreen] Merged: ${backendNotifs.length} Backend + ${routineNotifs.length} Routines`);
            setNotifications(sorted);

        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    // Refresh when a new notification arrives while looking at this screen
    React.useEffect(() => {
        if (notification) {
            console.log('New notification received, refreshing list...');
            fetchNotifications();
        }
    }, [notification]);

    const handlePressNotification = async (notif: Notification) => {
        if (notif.isRead) return;

        // 1. Optimistic Update (Immediate UI feedback)
        setNotifications(prev => prev.map(n =>
            n.id === notif.id ? { ...n, isRead: true } : n
        ));

        // 2. Mark as Read
        if (notif.type === 'ROUTINE') {
            // Local Storage Logic
            try {
                const today = getTodayStr();
                const readKey = `read_notifications_${today}`;
                const readData = await storage.getItem(readKey);
                const readIds: number[] = readData ? JSON.parse(readData) : [];

                // Use referenceId because id is negative
                const originalId = notif.referenceId || Math.abs(notif.id);

                if (!readIds.includes(originalId)) {
                    readIds.push(originalId);
                    await storage.setItem(readKey, JSON.stringify(readIds));
                }
            } catch (e) {
                console.error('Failed to mark routine locally:', e);
            }
        } else {
            // API Logic
            try {
                await markNotificationAsRead(notif.id);
                console.log(`Notification ${notif.id} marked as read`);
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }
    };

    const handleDeleteNotification = async (id: number) => {
        // 1. Find notification to get referenceId if needed
        const target = notifications.find(n => n.id === id);

        // 2. Optimistic Update
        setNotifications(prev => prev.filter(n => n.id !== id));

        // 3. Handle Deletion Logic
        if (id < 0 && target) { // Routine Notification (Local)
            try {
                const today = getTodayStr();
                const deleteKey = `deleted_notifications_${today}`;
                const deleteData = await storage.getItem(deleteKey);
                const deletedIds: number[] = deleteData ? JSON.parse(deleteData) : [];

                const originalId = target.referenceId || Math.abs(id);

                if (!deletedIds.includes(originalId)) {
                    deletedIds.push(originalId);
                    await storage.setItem(deleteKey, JSON.stringify(deletedIds));
                    console.log(`[NotificationScreen] Persisted deletion for routine ${originalId}`);
                }
            } catch (e) {
                console.error('Failed to delete routine locally:', e);
            }
        } else if (id > 0) { // Backend Notification
            try {
                await deleteNotification(id);
            } catch (error) {
                console.error("Failed to delete notification", error);
            }
        }
    };

    const handleClearAllNotifications = async () => {
        // Optimistic Clear
        const oldNotifs = [...notifications];
        setNotifications([]);

        try {
            const userId = await storage.getItem('userId');
            if (userId) {
                // 1. Delete All Backend Notifications
                await deleteAllNotifications(userId);

                // 2. Clear Local (Add all today's routines to deleted list)
                const today = getTodayStr();
                const routineNotifs = oldNotifs.filter(n => n.type === 'ROUTINE');
                const deleteKey = `deleted_notifications_${today}`;
                const deleteData = await storage.getItem(deleteKey);
                let deletedIds: number[] = deleteData ? JSON.parse(deleteData) : [];

                routineNotifs.forEach(n => {
                    const originalId = n.referenceId || Math.abs(n.id);
                    if (!deletedIds.includes(originalId)) deletedIds.push(originalId);
                });
                await storage.setItem(deleteKey, JSON.stringify(deletedIds));
                console.log(`[NotificationScreen] Clear All: Deleted ${routineNotifs.length} local routines`);
            }
        } catch (error) {
            console.error("Failed to clear notifications", error);
            setNotifications(oldNotifs); // Revert on error
        }
    };

    const getTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMins / 60);
        const diffDays = Math.round(diffHours / 24);

        if (diffMs < 0) {
            // Future date: Show "Today at HH:MM"
            const hours = date.getHours().toString().padStart(2, '0');
            const mins = date.getMinutes().toString().padStart(2, '0');
            return `Today at ${hours}:${mins}`;
        }

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Notification</Text>
                    {/* Clear All Button */}
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
                            notifications.map((notif: Notification) => (
                                <NotificationItem
                                    key={notif.id}
                                    id={notif.id}
                                    title={notif.title}
                                    subtitle={notif.message}
                                    time={getTimeAgo(notif.createdAt)}
                                    type={notif.type}
                                    isRead={notif.isRead}
                                    onPress={() => handlePressNotification(notif)}
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
        flexDirection: 'column', // Stack vertically
        alignItems: 'center', // Center title
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10, // Spacing from button
    },
    clearButton: {
        backgroundColor: '#7DD1E0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-end', // Align button to the right
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
