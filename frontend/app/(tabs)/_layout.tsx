import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import storage from '../utils/storage';
import { getUserNotifications, getUserRoutinesByDate, getUserProfile } from '../service/InfinityhealthApi';
import { Notification } from '../interface/infinityhealth.interface';

export default function TabLayout() {
  const [hasUnread, setHasUnread] = useState(false);

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

        // 3. Check Local Read Status
        const readKey = `read_notifications_${today}`;
        const readData = await storage.getItem(readKey);
        const readIds: number[] = readData ? JSON.parse(readData) : [];

        // 4. Calculate Unread Count
        // Backend: isRead is false
        const unreadBackend = backendNotifs.filter(n => !n.isRead).length;

        // Routines: ID not in readIds
        const unreadRoutines = routineNotifs.filter(r => !readIds.includes(r.id)).length;

        const totalUnread = unreadBackend + unreadRoutines;

        // Also keep Level 10 Check? User seemed confused by it. 
        // Let's REMOVE it to strictly follow "Red dot = Unread Message" paradigm.
        // If we want to alert for Rank Up, we should use a different UI element or send a notification.

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
