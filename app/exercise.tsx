import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type TabType = 'cardio' | 'weight';

const workouts = {
  cardio: [
    { id: 1, title: 'Running', description: 'Outdoor or treadmill running', duration: '30 min', calories: '300 kcal', emoji: '🏃' },
    { id: 2, title: 'Cycling', description: 'Stationary or outdoor bike', duration: '45 min', calories: '400 kcal', emoji: '🚴' },
    { id: 3, title: 'Swimming', description: 'Full body cardio workout', duration: '30 min', calories: '350 kcal', emoji: '🏊' },
    { id: 4, title: 'Jump Rope', description: 'High intensity interval', duration: '15 min', calories: '200 kcal', emoji: '🪢' },
  ],
  weight: [
    { id: 1, title: 'Full Body', description: 'Complete workout for all muscle groups', emoji: '💪', color: '#E0F2FE' },
    { id: 2, title: 'Upper Body', description: 'Focus on chest, back, arms, and shoulders', emoji: '🏋️', color: '#FCE7F3' },
    { id: 3, title: 'Lower Body', description: 'Strengthen legs, glutes, and calves', emoji: '🦵', color: '#DCFCE7' },
    { id: 4, title: 'Core', description: 'Build a strong core and abs', emoji: '🎯', color: '#FEF3C7' },
  ],
};

const levels = ['Beginner', 'Intermediate', 'Advanced'];

export default function ExerciseScreen() {
  const [selectedTab, setSelectedTab] = useState<TabType>('cardio');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showLevelPicker, setShowLevelPicker] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'web' ? 20 : 50,
          paddingBottom: 30,
          paddingHorizontal: 20,
        }}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </TouchableOpacity>

        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 24 }}>
          Exercise
        </Text>

        {/* Tabs */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#F3F4F6',
          borderRadius: 25,
          padding: 4,
          marginBottom: 20,
        }}>
          <TouchableOpacity
            onPress={() => setSelectedTab('cardio')}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 22,
              backgroundColor: selectedTab === 'cardio' ? '#FFFFFF' : 'transparent',
            }}
          >
            <Text style={{
              textAlign: 'center',
              fontWeight: '600',
              color: selectedTab === 'cardio' ? '#F97316' : '#6B7280',
            }}>
              Cardio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('weight')}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 22,
              backgroundColor: selectedTab === 'weight' ? '#FFFFFF' : 'transparent',
            }}
          >
            <Text style={{
              textAlign: 'center',
              fontWeight: '600',
              color: selectedTab === 'weight' ? '#F97316' : '#6B7280',
            }}>
              Weight Training
            </Text>
          </TouchableOpacity>
        </View>

        {/* Level Selector */}
        <TouchableOpacity
          onPress={() => setShowLevelPicker(!showLevelPicker)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            marginBottom: 24,
          }}
        >
          <Text style={{ color: selectedLevel ? '#1F2937' : '#9CA3AF' }}>
            {selectedLevel || 'Select Level'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>

        {showLevelPicker && (
          <View style={{
            backgroundColor: '#F9FAFB',
            borderRadius: 12,
            marginBottom: 24,
            marginTop: -16,
          }}>
            {levels.map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => {
                  setSelectedLevel(level);
                  setShowLevelPicker(false);
                }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderBottomWidth: level !== 'Advanced' ? 1 : 0,
                  borderBottomColor: '#E5E7EB',
                }}
              >
                <Text style={{
                  color: selectedLevel === level ? '#F97316' : '#374151',
                  fontWeight: selectedLevel === level ? '600' : '400',
                }}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Workouts */}
        {selectedTab === 'cardio' ? (
          workouts.cardio.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                backgroundColor: '#F9FAFB',
                borderRadius: 16,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 40, marginRight: 16 }}>{workout.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{workout.title}</Text>
                <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{workout.description}</Text>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: '#10B981', marginRight: 12 }}>⏱ {workout.duration}</Text>
                  <Text style={{ fontSize: 12, color: '#F97316' }}>🔥 {workout.calories}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))
        ) : (
          workouts.weight.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                backgroundColor: workout.color,
                borderRadius: 16,
                marginBottom: 12,
              }}
            >
              <View style={{
                width: 70,
                height: 70,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Text style={{ fontSize: 32 }}>{workout.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>{workout.title}</Text>
                <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{workout.description}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

