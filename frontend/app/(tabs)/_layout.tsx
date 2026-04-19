import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform, DeviceEventEmitter } from 'react-native';
import storage from '@/utils/storage';
import { getUserNotifications, getUserRoutinesByDate, getUserProfile, syncClerkUser } from '@/service/InfinityhealthApi';
import { Notification } from '@/interface/infinityhealth.interface';
import { useUser } from '@clerk/clerk-expo';
import { usePushNotifications } from '@/hook/usePushNotifications';
import TutorialTarget from '@/components/shared/TutorialTarget';

export default function TabLayout() {
  const { user } = useUser();
  const { getPushToken } = usePushNotifications();
  const [hasUnread, setHasUnread] = useState(false);

  // Global User Sync (Clerk -> Backend)
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const syncUser = async () => {
      if (user) {
        try {
          console.log('[GlobalSync] Syncing with backend to ensure ID is valid...');
          const email = user.primaryEmailAddress?.emailAddress;
          if (email) {
            const pushToken = await getPushToken();
            console.log('[GlobalSync] Syncing with pushToken:', pushToken);

            const res = await syncClerkUser(
              email,
              user.firstName || 'User',
              user.lastName || '',
              user.imageUrl || '',
              pushToken || undefined
            );
            const data = res as any;
            if (data.success && data.user) {
              const newId = String(data.user.id);
              await storage.setItem('internalUserId', newId);
              await storage.setItem('userId', newId);
              console.log('[GlobalSync] Synced successfully. ID:', newId);
            } else {
              throw new Error(data.message || 'Sync response was not successful');
            }
          }
        } catch (e) {
          console.error(`[GlobalSync] Sync attempt ${retryCount + 1} failed:`, e);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(syncUser, 3000 * retryCount); // Backoff retry
          }
        }
      }
    };

    // Trigger sync immediately when user is available
    syncUser();
  }, [user]);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const userId = await storage.getItem('userId');
        if (!userId) {
            setHasUnread(false);
            return;
        }

        // Fetch Backend Notifications (Single Source of Truth)
        const notifRes = await getUserNotifications(userId);
        if (notifRes.success && Array.isArray(notifRes.data)) {
            // Count unread notifications
            const unreadCount = notifRes.data.filter(n => !n.isRead).length;
            setHasUnread(unreadCount > 0);
        } else {
            setHasUnread(false);
        }

      } catch (e) {
        console.error("Badge check failed", e);
        setHasUnread(false);
      }
    };

    checkNotifications();
    
    // Listen for manual refreshes (Instant update)
    const subscription = DeviceEventEmitter.addListener('refresh_notification_badge', checkNotifications);
    
    const interval = setInterval(checkNotifications, 10000); // Pulse every 10s as backup
    
    return () => {
        subscription.remove();
        clearInterval(interval);
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: Platform.OS === 'android' ? 90 : 65,
          paddingBottom: Platform.OS === 'android' ? 30 : 8,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarActiveTintColor: '#7DD1E0',
        tabBarInactiveTintColor: '#D1D5DB',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TutorialTarget tutorialKey="tab_calendar">
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
              </View>
            </TutorialTarget>
          ),
        }}
      />
      <Tabs.Screen
        name="DashBoardPage"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TutorialTarget tutorialKey="tab_dashboard">
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
              </View>
            </TutorialTarget>
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
              <Ionicons name={focused ? 'timer' : 'timer-outline'} size={28} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={26} color={color} />
              {hasUnread && (
                <View style={{
                  position: 'absolute',
                  right: -2,
                  top: -2,
                  backgroundColor: '#EF4444',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  borderWidth: 2,
                  borderColor: '#FFFFFF'
                }} />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TutorialTarget tutorialKey="tab_profile">
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
              </View>
            </TutorialTarget>
          ),
        }}
      />
    </Tabs>
  );
}
