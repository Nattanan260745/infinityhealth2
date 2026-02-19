
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import Constants from 'expo-constants';
import storage from '../utils/storage';

const ONESIGNAL_APP_ID = '62a8a981-4a2b-4a4f-8b7b-e67c65ff0017';

export const usePushNotifications = () => {
    const [pushToken, setPushToken] = useState<string | undefined>(undefined);
    const [notification, setNotification] = useState<any | undefined>(undefined); // Keep for compatibility

    useEffect(() => {
        // 1. OneSignal Init
        OneSignal.Debug.setLogLevel(LogLevel.Verbose);
        OneSignal.initialize(ONESIGNAL_APP_ID);

        // 2. Request Permission
        OneSignal.Notifications.requestPermission(true);

        // 3. Login User (Associate with our Internal ID)
        const identifyUser = async () => {
            const userId = await storage.getItem('internalUserId');
            if (userId) {
                console.log('Logging in to OneSignal with External ID:', userId);
                OneSignal.login(userId);
            }
        };
        identifyUser();

        // 4. Listener
        // Note: For 'click', the event is of type NotificationClickEvent
        // For 'foregroundWillDisplay', it's NotificationWillDisplayEvent
        OneSignal.Notifications.addEventListener('click', (event: any) => {
            console.log('OneSignal Notification Clicked:', event);
            setNotification(event.notification);
        });

        OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event: any) => {
            console.log('OneSignal Notification Received (Foreground):', event);
            setNotification(event.getNotification());
        });

    }, []);

    return {
        pushToken,
        notification
    };
};

// Remote Push Logic:
// The backend will send the notification. We don't need to 'schedule' locally anymore.
// However, if we still want local fallback, we can use OneSignal.Notifications.simplePush or keep expo-notifications.
// For now, we rely on the Backend to trigger the "Alarm".

export async function scheduleRoutineNotification(
    title: string,
    hour: number,
    minute: number
) {
    // This function is now a placeholder.
    // In a full Remote Push system, the "Schedule" happens on the Backend Database.
    // When user saves a routine -> We save to DB -> Backend Cron Job picks it up.
    // So usually we don't need to do anything here client-side for scheduling.

    console.log('Skipping local schedule. Routine saved to backend will be picked up by Cron Job.');
    return 'backend-managed';
}

export async function cancelRoutineNotification(notificationId: string) {
    // Managed by Backend
    console.log('Skipping local cancel. Backend manages the schedule.');
}
