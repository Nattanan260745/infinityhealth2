
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
    const [displayedIds, setDisplayedIds] = useState<Set<number>>(new Set());
    const [userId, setUserId] = useState<string | null>(null);

    // Helper to ensure userId is available (Standardized with other hooks)
    const ensureUserId = async () => {
        if (userId) return userId;
        const storedId = await storage.getItem('internalUserId') || await storage.getItem('userId');
        if (storedId) {
            setUserId(storedId);
            return storedId;
        }
        return null;
    };

    useEffect(() => {
        // Function to run the check
        const checkNotifications = async () => {
            try {
                const currentId = await ensureUserId();
                if (!currentId) return;

                // Fetch unsent notifications
                const response = await InfinityhealthApi.get(`/notification/user/${currentId}/unsent`);
                const notifications = response.data?.data || [];

                if (notifications.length > 0) {
                    console.log(`[Polling] Found ${notifications.length} unsent notifications`);

                    for (const notif of notifications) {
                        // 1. Local Duplication Check (Session Cache)
                        if (displayedIds.has(notif.id)) {
                            console.log(`[Polling] Notification ${notif.id} already shown this session. Skipping.`);
                            continue;
                        }

                        // 2. Trigger Local Notification
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: notif.title || "แจ้งเตือน",
                                body: notif.message,
                                sound: 'default',
                                android: {
                                    channelId: 'default',
                                }
                            } as any,
                            trigger: null, // Send immediately
                        });

                        // 3. Mark as displayed in local state
                        setDisplayedIds(prev => new Set(prev).add(notif.id));

                        // 4. Mark as Sent in Backend
                        try {
                            await InfinityhealthApi.patch(`/notification/${notif.id}/sent`);
                            console.log(`[Polling] Marked notification ${notif.id} as sent.`);
                        } catch (patchErr) {
                            console.error(`[Polling] Failed to sync 'sent' status for ${notif.id}`, patchErr);
                        }
                    }
                }
            } catch (error) {
                console.error('[Polling] Error:', error);
            }
            setLastPolled(new Date());
        };

        // Poll every 5 seconds
        const intervalId = setInterval(checkNotifications, 5000);
        checkNotifications();

        return () => clearInterval(intervalId);
    }, [userId, displayedIds]); // Re-run if userId or cache changes

    return { lastPolled };
};
