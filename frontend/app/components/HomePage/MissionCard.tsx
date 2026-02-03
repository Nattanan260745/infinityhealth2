import React, { useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import type { Mission } from '@/src/types';
import { IuseHomePage } from '@/app/hook/useHomePage';

const missionIcon = require('../../../assets/images/Group.png');
const exerciseIcon = require('../../../assets/images/exercise.png');
const routineIcon = require('../../../assets/images/selfcare.png');
const missionsIcon = require('../../../assets/images/missions.png');

const getIcon = (title: string) => {
  switch (title) {
    case 'Exercise': return exerciseIcon;
    case 'Routine': return routineIcon;
    case 'Missions': return missionsIcon;
    default: return missionIcon;
  }
};

const getThemedColors = (title: string) => {
  switch (title) {
    case 'Routine':
      return { bg: '#FBCFC9', iconBox: '#FFF5F5' }; // Peach / Light Pink
    case 'Exercise':
      return { bg: '#DBEAFE', iconBox: '#EFF6FF' }; // Light Blue / Pale Blue
    case 'Missions':
      return { bg: '#FEF3C7', iconBox: '#FFFBEB' }; // Light Yellow / Pale Yellow
    default:
      return { bg: '#FBCFC9', iconBox: '#FDE8E4' }; // Fallback (original)
  }
};


const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 50;

interface MissionCardProps {
  // missions: Mission[];
  // currentIndex: number;
  // onIndexChange: (index: number) => void;
  useHomePageController: IuseHomePage;
}

const missionRoutes: Record<string, string> = {
  'Missions': '/components/HomePage/subHomePage/missions',
  'Exercise': '/components/HomePage/subHomePage/exercise',
  'Routine': '/components/HomePage/subHomePage/routine',
};

export function MissionCard({ useHomePageController }: MissionCardProps) {
  const handlePress = (title: string) => {
    const route = missionRoutes[title];
    if (route) {
      router.push(route as any);
    }
  };


  return (
    <View style={{ marginTop: 8 }}>
      <ScrollView

        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 10}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 10));
          useHomePageController.setCurrentMission(index);
        }}
      >
        {useHomePageController.missions.map((mission) => {
          const colors = getThemedColors(mission.title);
          return (
            <TouchableOpacity
              key={mission.id}
              onPress={() => handlePress(mission.title)}
              activeOpacity={0.8}
              style={{
                marginRight: 20,
                width: CARD_WIDTH,
                backgroundColor: colors.bg,
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
                  backgroundColor: colors.iconBox,
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
                  source={getIcon(mission.title)}
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
          );
        })}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        {useHomePageController.missions.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: 4,
              backgroundColor: index === useHomePageController.currentMission ? '#4B5563' : '#D1D5DB',
            }}
          />
        ))}
      </View>
    </View>
  );
}
