import React, { useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import type { Mission } from '@/src/types';

const missionIcon = require('../../../assets/images/Group.png');

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 50;

interface MissionCardProps {
  missions: Mission[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const missionRoutes: Record<string, string> = {
  'Missions': '/components/HomePage/subHomePage/missions',
  'Health Tracking': '/components/HomePage/subHomePage/health-tracking',
  'Exercise': '/components/HomePage/subHomePage/exercise',
  'Routine': '/components/HomePage/subHomePage/routine',
};

export function MissionCard({ missions, currentIndex, onIndexChange }: MissionCardProps) {
  const handlePress = (title: string) => {
    const route = missionRoutes[title];
    if (route) {
      router.push(route as any);
    }
  };


  return (
    <View style={{ marginTop: 8}}>
      <ScrollView

        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 10}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 10));
          onIndexChange(index);
        }}
      >
        {missions.map((mission) => (
          <TouchableOpacity
            key={mission.id}
            onPress={() => handlePress(mission.title)}
            activeOpacity={0.8}
            style={{
              marginRight: 20,
              width: CARD_WIDTH,
              backgroundColor: '#FBCFC9',
              borderRadius: 24,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 16,
              overflow: 'hidden',
            }}
          >
            {/* Illustration Box */}
            <View
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#FDE8E4',
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Checkmark badge */}
              <View style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              {/* Illustration */}
              <Image
                source={missionIcon}
                style={{ width: 70, height: 70 }}
                resizeMode="contain"
              />
            </View>

            {/* Text Content */}
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>
                {mission.title}
              </Text>
              <Text style={{ color: '#4B5563', fontSize: 14, marginTop: 4 }}>
                {mission.subtitle}
              </Text>
            </View>

            {/* Arrow */}
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        {missions.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: 4,
              backgroundColor: index === currentIndex ? '#4B5563' : '#D1D5DB',
            }}
          />
        ))}
      </View>
    </View>
  );
}
