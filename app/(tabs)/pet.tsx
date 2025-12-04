import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Pet {
  id: number;
  name: string;
  type: string;
  emoji: string;
  level: number;
  experience: number;
  maxExperience: number;
  happiness: number;
  health: number;
}

const initialPet: Pet = {
  id: 1,
  name: 'Buddy',
  type: 'Dog',
  emoji: '🐕',
  level: 5,
  experience: 350,
  maxExperience: 500,
  happiness: 85,
  health: 92,
};

const achievements = [
  { id: 1, icon: '🏃', title: '7 Days Streak', earned: true },
  { id: 2, icon: '💧', title: 'Hydration Master', earned: true },
  { id: 3, icon: '🥗', title: 'Healthy Eater', earned: false },
  { id: 4, icon: '😴', title: 'Sleep Champion', earned: true },
  { id: 5, icon: '🎯', title: 'Goal Crusher', earned: false },
  { id: 6, icon: '💪', title: 'Fitness Pro', earned: false },
];

export default function PetScreen() {
  const [pet, setPet] = useState(initialPet);

  const feedPet = () => {
    setPet(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 5),
      experience: Math.min(prev.maxExperience, prev.experience + 20),
    }));
  };

  const playWithPet = () => {
    setPet(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 10),
      health: Math.min(100, prev.health + 3),
      experience: Math.min(prev.maxExperience, prev.experience + 30),
    }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'web' ? 40 : 60,
          paddingBottom: 30,
          paddingHorizontal: 20,
        }}
      >
        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
          My Pet
        </Text>

        {/* Pet Card */}
        <View style={{
          backgroundColor: '#FEF3C7',
          borderRadius: 24,
          padding: 24,
          alignItems: 'center',
          marginBottom: 24,
        }}>
          <Text style={{ fontSize: 80 }}>{pet.emoji}</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginTop: 12 }}>
            {pet.name}
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            Level {pet.level} {pet.type}
          </Text>

          {/* Experience Bar */}
          <View style={{ width: '100%', marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Experience</Text>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>{pet.experience}/{pet.maxExperience}</Text>
            </View>
            <View style={{ height: 8, backgroundColor: '#FDE68A', borderRadius: 4 }}>
              <View style={{
                height: 8,
                backgroundColor: '#F59E0B',
                borderRadius: 4,
                width: `${(pet.experience / pet.maxExperience) * 100}%`,
              }} />
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
          <View style={{
            flex: 1,
            backgroundColor: '#DCFCE7',
            borderRadius: 16,
            padding: 16,
            marginRight: 8,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="heart" size={18} color="#22C55E" />
              <Text style={{ marginLeft: 6, fontSize: 14, color: '#4B5563' }}>Health</Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>{pet.health}%</Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: '#FCE7F3',
            borderRadius: 16,
            padding: 16,
            marginLeft: 8,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="happy" size={18} color="#EC4899" />
              <Text style={{ marginLeft: 6, fontSize: 14, color: '#4B5563' }}>Happiness</Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>{pet.happiness}%</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', marginBottom: 32 }}>
          <TouchableOpacity
            onPress={feedPet}
            style={{
              flex: 1,
              backgroundColor: '#10B981',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              marginRight: 8,
            }}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>🍖</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={playWithPet}
            style={{
              flex: 1,
              backgroundColor: '#8B5CF6',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              marginLeft: 8,
            }}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>🎾</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>Play</Text>
          </TouchableOpacity>
        </View>

        {/* Achievements */}
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
          Achievements
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={{
                width: '31%',
                backgroundColor: achievement.earned ? '#F0FDF4' : '#F9FAFB',
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
                marginRight: '2%',
                marginBottom: 12,
                opacity: achievement.earned ? 1 : 0.5,
              }}
            >
              <Text style={{ fontSize: 28, marginBottom: 4 }}>{achievement.icon}</Text>
              <Text style={{
                fontSize: 10,
                color: achievement.earned ? '#059669' : '#9CA3AF',
                textAlign: 'center',
              }}>
                {achievement.title}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
