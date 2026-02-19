
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import storage from '../utils/storage';
import InfinityhealthApi from '../service/InfinityhealthApi';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const usePollingNotifications = () => {
    const [lastPolled, setLastPolled] = useState(new Date());

    useEffect(() => {
        // Function to run the check
        const checkNotifications = async () => {
            try {
                const userId = await storage.getItem('internalUserId');
                if (!userId) return;

                // Fetch unsent notifications
                const response = await InfinityhealthApi.get(`/notifications/user/${userId}/unsent`);
                const notifications = response.data?.data || [];

                if (notifications.length > 0) {
                    console.log('Found unsent notifications:', notifications.length);

                    for (const notif of notifications) {
                        // 1. Trigger Local Notification
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: notif.title,
                                body: notif.message,
                                sound: 'default',
                            },
                            trigger: null, // Send immediately
                        });

                        // 2. Mark as Sent in Backend
                        await InfinityhealthApi.patch(`/notifications/${notif.id}/sent`);
                        console.log(`Marked notification ${notif.id} as sent.`);
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
            setLastPolled(new Date());
        };

        // Poll every 5 seconds (5000ms)
        const intervalId = setInterval(checkNotifications, 5000);

        // Run immediately on mount (and keep running via interval)
        checkNotifications();

        return () => clearInterval(intervalId);
    }, []); // Run once on mount

    return { lastPolled };
};
