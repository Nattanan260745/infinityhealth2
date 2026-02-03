import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import storage from '../utils/storage';
import { updateUserProfile } from '../service/InfinityhealthApi';

// 1. Setup notification handler (How it behaves when app is in foreground)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// 2. The Hook
export const usePushNotifications = () => {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

    async function registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }

            // Get the token
            // Project ID is sometimes needed for newer Expo versions, but usually auto-detected
            try {
                const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
                token = (await Notifications.getExpoPushTokenAsync({
                    projectId,
                })).data;
                console.log('Expo Push Token:', token);
            } catch (e) {
                console.error('Error getting push token:', e);
            }
        } else {
            // alert('Must use physical device for Push Notifications'); 
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    }

    useEffect(() => {
        // A. Register
        registerForPushNotificationsAsync().then(async token => {
            setExpoPushToken(token);
            if (token) {
                // Store locally
                storage.setItem('pushToken', token);

                // Sync to Backend
                const userId = await storage.getItem('internalUserId');
                if (userId) {
                    try {
                        console.log('Sending Push Token to Backend:', token);
                        await updateUserProfile(userId, { pushToken: token });
                    } catch (e) {
                        console.error('Failed to sync push token:', e);
                    }
                }
            }
        });

        // B. Listener: Received Notification (Foreground)
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
            console.log('Notification Received (Foreground):', notification);
        });

        // C. Listener: User Tapped Notification (Response)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification Tapped:', response);
            // Here you can handle navigation based on data
            // const data = response.notification.request.content.data;
            // if (data.url) router.push(data.url);
        });

        return () => {
            notificationListener.current && notificationListener.current.remove();
            responseListener.current && responseListener.current.remove();
        };
    }, []);

    return {
        expoPushToken,
        notification
    };
};
