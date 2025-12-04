import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type TabType = 'daily' | 'challenge';

interface Mission {
  id: number;
  title: string;
  icon: string;
  progress: number;
  total: number;
  xp: number;
  gems: number;
  completed: boolean;
}

const dailyMissions: Mission[] = [
  { id: 1, title: 'Drink water at least 2000 ml', icon: '💧', progress: 1000, total: 2000, xp: 50, gems: 10, completed: false },
  { id: 2, title: 'Walk 5000 steps', icon: '👟', progress: 5000, total: 5000, xp: 50, gems: 10, completed: true },
  { id: 3, title: 'Avoid fried foods', icon: '🥗', progress: 5000, total: 5000, xp: 50, gems: 10, completed: true },
];

const challengeMissions: Mission[] = [
  { id: 4, title: '7-Day Workout Streak', icon: '🔥', progress: 5, total: 7, xp: 200, gems: 50, completed: false },
  { id: 5, title: 'Lose 2kg this month', icon: '⚖️', progress: 1.5, total: 2, xp: 300, gems: 100, completed: false },
  { id: 6, title: 'Sleep 8 hours for a week', icon: '😴', progress: 7, total: 7, xp: 150, gems: 30, completed: true },
];

export default function MissionsScreen() {
  const [selectedTab, setSelectedTab] = useState<TabType>('daily');
  
  const missions = selectedTab === 'daily' ? dailyMissions : challengeMissions;
  const completedCount = missions.filter(m => m.completed).length;
  const totalXP = missions.reduce((sum, m) => sum + m.xp, 0);
  const totalGems = missions.reduce((sum, m) => sum + m.gems, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        {/* Hero Image */}
        <View style={{
          height: 200,
          backgroundColor: '#FEF3C7',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 100 }}>🧗</Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ position: 'absolute', top: -180, left: 20 }}
          >
            <Ionicons name="chevron-back" size={28} color="#1F2937" />
          </TouchableOpacity>

          {/* Header */}
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginTop: 16, marginBottom: 24 }}>
            Missions
          </Text>

          {/* Tabs */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: '#F3F4F6',
            borderRadius: 25,
            padding: 4,
            marginBottom: 24,
          }}>
            <TouchableOpacity
              onPress={() => setSelectedTab('daily')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 22,
                backgroundColor: selectedTab === 'daily' ? '#FFFFFF' : 'transparent',
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontWeight: '600',
                color: selectedTab === 'daily' ? '#F97316' : '#6B7280',
              }}>
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab('challenge')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 22,
                backgroundColor: selectedTab === 'challenge' ? '#FFFFFF' : 'transparent',
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontWeight: '600',
                color: selectedTab === 'challenge' ? '#F97316' : '#6B7280',
              }}>
                Challenge
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress Card */}
          <View style={{
            backgroundColor: '#F9FAFB',
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>Missions Completed</Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>{completedCount}/{missions.length}</Text>
            </View>
            
            {/* Progress Bar */}
            <View style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 16 }}>
              <View style={{
                height: 8,
                backgroundColor: '#10B981',
                borderRadius: 4,
                width: `${(completedCount / missions.length) * 100}%`,
              }} />
            </View>

            {/* Rewards */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16 }}>⚡</Text>
                <Text style={{ marginLeft: 4, fontWeight: '600', color: '#F59E0B' }}>{totalXP}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16 }}>💎</Text>
                <Text style={{ marginLeft: 4, fontWeight: '600', color: '#EC4899' }}>{totalGems}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16 }}>🔥</Text>
                <Text style={{ marginLeft: 4, fontWeight: '600', color: '#F97316' }}>0</Text>
              </View>
            </View>
          </View>

          {/* Missions Title */}
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
            {selectedTab === 'daily' ? 'Daily Missions' : 'Challenge Missions'}
          </Text>

          {/* Mission Cards */}
          {missions.map((mission) => (
            <View
              key={mission.id}
              style={{
                backgroundColor: mission.completed ? '#ECFDF5' : '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: mission.completed ? '#D1FAE5' : '#F3F4F6',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>{mission.icon}</Text>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: '#1F2937' }}>
                  {mission.title}
                </Text>
              </View>

              {/* Progress */}
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>Progress</Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>{mission.progress}/{mission.total}</Text>
                </View>
                <View style={{ height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 }}>
                  <View style={{
                    height: 6,
                    backgroundColor: mission.completed ? '#10B981' : '#F97316',
                    borderRadius: 3,
                    width: `${(mission.progress / mission.total) * 100}%`,
                  }} />
                </View>
              </View>

              {/* Rewards & Action */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                    <Text style={{ fontSize: 14 }}>⚡</Text>
                    <Text style={{ marginLeft: 4, fontSize: 12, color: '#F59E0B' }}>{mission.xp}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14 }}>💎</Text>
                    <Text style={{ marginLeft: 4, fontSize: 12, color: '#EC4899' }}>{mission.gems}</Text>
                  </View>
                </View>
                
                {mission.completed ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#10B981', marginRight: 4 }}>Completed</Text>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  </View>
                ) : (
                  <TouchableOpacity style={{
                    backgroundColor: '#3B82F6',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>Update</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

