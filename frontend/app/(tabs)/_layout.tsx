import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import storage from '../utils/storage';
import { getUserNotifications, getUserRoutinesByDate, getUserProfile, syncClerkUser } from '../service/InfinityhealthApi';
import { Notification } from '../interface/infinityhealth.interface';
import { useUser } from '@clerk/clerk-expo';

export default function TabLayout() {
  const { user } = useUser();
  const [hasUnread, setHasUnread] = useState(false);

  // Global User Sync (Clerk -> Backend)
  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        try {
          const internalId = await storage.getItem('internalUserId');
          if (!internalId) {
            console.log('[GlobalSync] No internalId found. Syncing...');
            const email = user.primaryEmailAddress?.emailAddress;
            if (email) {
              const res = await syncClerkUser(
                email,
                user.firstName || 'User',
                user.lastName || '',
                user.imageUrl || ''
              );
              const data = res as any;
              if (data.success && data.user) {
                const newId = String(data.user.id);
                await storage.setItem('internalUserId', newId);
                await storage.setItem('userId', newId);
                console.log('[GlobalSync] Synced successfully. ID:', newId);
              }
            }
          }
        } catch (e) {
          console.error('[GlobalSync] Sync failed:', e);
        }
      }
    };
    syncUser();
  }, [user]);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const userId = await storage.getItem('userId');
        if (!userId) return;

        // 1. Fetch Backend Notifications
        const notifRes = await getUserNotifications(userId);
        let backendNotifs: Notification[] = [];
        if (notifRes.success && notifRes.data) {
          backendNotifs = notifRes.data;
        }

        // 2. Fetch Today's Routines (Local)
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;

        const routineRes = await getUserRoutinesByDate(userId, today);
        let routineNotifs: any[] = [];
        if (routineRes.success && Array.isArray(routineRes.data)) {
          routineNotifs = routineRes.data;
        }

        // 3. Check Local Read Status & Deleted Status
        const readKey = `read_notifications_${today}`;
        const readData = await storage.getItem(readKey);
        const readIds: number[] = readData ? JSON.parse(readData) : [];

        const deleteKey = `deleted_notifications_${today}`;
        const deleteData = await storage.getItem(deleteKey);
        const deletedIds: number[] = deleteData ? JSON.parse(deleteData) : [];

        // 4. Calculate Unread Count
        // Backend: isRead is false
        const unreadBackend = backendNotifs.filter(n => !n.isRead).length;

        // Routines: ID not in readIds AND not in deletedIds AND Time has passed
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();

        const unreadRoutines = routineNotifs.filter(r => {
          if (readIds.includes(r.id)) return false;
          if (deletedIds.includes(r.id)) return false; // Fix: Check deleted status

          // Check Time (Only count if time has passed)
          if (r.scheduledTime) {
            const [h, m] = r.scheduledTime.split(':').map(Number);
            if (h > currentHours) return false;
            if (h === currentHours && m > currentMinutes) return false;
          }
          return true;
        }).length;

        const totalUnread = unreadBackend + unreadRoutines;

        setHasUnread(totalUnread > 0);

      } catch (e) {
        console.error("Badge check failed", e);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 5000); // Check every 5s
    return () => clearInterval(interval);
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
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="DashBoardPage"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
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
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
