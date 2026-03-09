
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import storage from '../utils/storage';

// Configure how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const usePushNotifications = () => {
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);

    useEffect(() => {
        // 1. Request Permissions (POST_NOTIFICATIONS for Android 13+)
        const requestPermissions = async () => {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.warn('Failed to get push token for push notification!');
                return;
            }
        };

        requestPermissions();

        // 2. Listeners
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification Response:', response);
        });

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, []);

    return {
        notification
    };
};

/**
 * Schedules a daily routine notification using a Calendar trigger.
 * This is "Exact" on Android and works even if the app is closed.
 */
export async function scheduleRoutineNotification(
    title: string,
    hour: number,
    minute: number
) {
    console.log(`[LocalNotif] Scheduling: "${title}" at ${hour}:${minute}`);

    try {
        // Check for permission first
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            await Notifications.requestPermissionsAsync();
        }

        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title: "ถึงเวลาแล้ว! ⏰",
                body: `ได้เวลาทำภารกิจ: ${title}`,
                sound: 'default',
                priority: Notifications.AndroidNotificationPriority.MAX,
                // @ts-ignore
                channelId: 'default',
            },
            trigger: {
                hour: hour,
                minute: minute,
                repeats: true, // Daily
            } as Notifications.CalendarTriggerInput,
        });

        console.log(`[LocalNotif] Scheduled successfully. ID: ${identifier}`);
        return identifier;
    } catch (error) {
        console.error('[LocalNotif] Scheduling failed:', error);
        return null;
    }
}

export async function cancelRoutineNotification(notificationId: string) {
    if (!notificationId) return;
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log(`[LocalNotif] Cancelled ID: ${notificationId}`);
    } catch (error) {
        console.error('[LocalNotif] Cancel failed:', error);
    }
}
