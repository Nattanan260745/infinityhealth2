import React, { useState } from 'react';
import { View, ScrollView, Platform } from 'react-native';
import {
  Header,
  MissionCard,
  CalendarWeek,
  RoutineList,
} from '@/src/components';
import type { CalendarDay, Mission, Routine } from '@/src/types';

// Sample data
const weekDays: CalendarDay[] = [
  { day: 'Sun', date: 14 },
  { day: 'Mon', date: 15 },
  { day: 'Tue', date: 16 },
  { day: 'Wed', date: 17 },
  { day: 'Thu', date: 18 },
  { day: 'Fri', date: 19 },
  { day: 'Sat', date: 20 },
];

const routines: Routine[] = [
  { id: 1, title: 'Clean Up', time: '13.00 A.M.', status: 'pending' },
  { id: 2, title: 'Go Shopping', time: '12.00 A.M.', status: 'completed' },
  { id: 3, title: 'Clean Up', time: '11.00 A.M.', status: 'cancelled' },
];

const missions: Mission[] = [
  { id: 1, title: 'Missions', subtitle: "Complete daily tasks", icon: '🎯' },
  { id: 2, title: 'Health Tracking', subtitle: 'Track your health', icon: '❤️' },
  { id: 3, title: 'Exercise', subtitle: 'Workout routines', icon: '💪' },
];

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(15);
  const [currentMission, setCurrentMission] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: Platform.OS === 'web' ? 20 : 50,
          paddingBottom: 20 
        }}
      >
        <Header
          userName="Tutor"
          userAvatar="https://i.pravatar.cc/100?img=47"
          date="Today 12 Nov 27"
        />

        <MissionCard
          missions={missions}
          currentIndex={currentMission}
          onIndexChange={setCurrentMission}
        />

        <CalendarWeek
          days={weekDays}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <RoutineList routines={routines} />
      </ScrollView>
    </View>
  );
}
