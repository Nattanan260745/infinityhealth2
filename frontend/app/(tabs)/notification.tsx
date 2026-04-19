import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, DeviceEventEmitter, FlatList, RefreshControl } from 'react-native';
import { NotificationItem } from '@/components/HomePage/NotificationItem';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect, useRouter } from 'expo-router';
import storage from '@/utils/storage';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
    getUserRoutinesByDate
} from '@/service/InfinityhealthApi';
import { Notification } from '@/interface/infinityhealth.interface';
import { useUser } from '@clerk/clerk-expo';
import { usePushNotifications } from '@/hook/usePushNotifications';

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

    // Helper to ensure userId is available (Retry from storage if state is null)
    const [userId, setUserId] = useState<string | null>(null);

    const ensureUserId = async () => {
        if (userId) return userId;
        const storedId = await storage.getItem('internalUserId') || await storage.getItem('userId');
        if (storedId) {
            setUserId(storedId);
            return storedId;
        }
        return null;
    };

    const fetchNotifications = async () => {
        const currentId = await ensureUserId();
        setIsLoading(true);
        try {
            console.log('[NotificationScreen] Fetching for UserId:', currentId);

            if (!currentId) {
                console.log('[NotificationScreen] No UserId found or synced yet');
                setNotifications([]);
                return;
            }

            // 1. Fetch Backend Notifications (Single Source of Truth)
            const notifRes = await getUserNotifications(currentId);
            let backendNotifs: Notification[] = [];
            if (notifRes.success && notifRes.data) {
                backendNotifs = notifRes.data;
            }

            // 2. Filter & Sort
            // Filter out notifications older than 48 hours for performance/relevance
            const fortEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

            const allNotifs = backendNotifs.filter(n => {
                const createdAt = new Date(n.createdAt);
                return createdAt >= fortEightHoursAgo;
            });
            const sorted = allNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            console.log(`[NotificationScreen] Displaying ${backendNotifs.length} Backend Notifications`);
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
                DeviceEventEmitter.emit('refresh_notification_badge');
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
                DeviceEventEmitter.emit('refresh_notification_badge');
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
            const currentId = await ensureUserId();
            if (currentId) {
                // 1. Delete All Backend Notifications
                await deleteAllNotifications(currentId);

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
                DeviceEventEmitter.emit('refresh_notification_badge');
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
