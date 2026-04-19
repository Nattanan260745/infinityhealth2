import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';

import { getAllExercises } from '@/service/InfinityhealthApi';
import { Exercise } from '@/interface/infinityhealth.interface';
import { useFocusEffect } from 'expo-router';

// Helper to extract YouTube Video ID
const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return (match && match[1]) ? match[1] : null;
};

type TabType = 'all' | 'cardio' | 'weight';

const levels = ['All', 'Beginner', 'Intermediate', 'Expert'];

export default function ExerciseScreen() {
  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showLevelPicker, setShowLevelPicker] = useState(false);

  // Real Data State
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Exercises
  useFocusEffect(
    useCallback(() => {
      fetchExercises();
    }, [])
  );

  const fetchExercises = async () => {
    try {
      const response = await getAllExercises();
      if (response.success && Array.isArray(response.data)) {
        setExercises(response.data);
      }
    } catch (error) {
      console.log('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  // Level mapping for UI display names vs DB values
  const LEVEL_MAP: Record<string, string> = {
    'All': 'All',
    'Beginner': 'Easy',
    'Intermediate': 'Medium',
    'Expert': 'Hard'
  };

  const finalExercises = useMemo(() => {
    // 1. Initial Type Filter
    let filtered = exercises.filter(ex => {
      const type = (ex.bodyPart || ex.type || '').toLowerCase();
      if (selectedTab === 'all') return true;
      if (selectedTab === 'cardio') return type === 'cardio';
      if (selectedTab === 'weight') return type.startsWith('weight');
      return true;
    });

    // 2. Level/Difficulty Filter
    if (selectedLevel !== 'All') {
      const dbLevel = LEVEL_MAP[selectedLevel] || selectedLevel;
      filtered = filtered.filter(ex => {
        const difficulty = (ex.difficulty || '').toLowerCase();
        // Match either the mapped value (e.g. 'hard') OR the UI label itself (e.g. 'expert')
        return difficulty === dbLevel.toLowerCase() || difficulty === selectedLevel.toLowerCase();
      });
    }

    // 3. Category (Body Part) Filter for Weight
    if (selectedTab === 'weight' && selectedCategory) {
      filtered = filtered.filter(ex => {
        const bodyPart = (ex.bodyPart || ex.type || '').toLowerCase();
        // Use lowercase for both to be safe
        const target = `weight_${selectedCategory}`.toLowerCase();
        return bodyPart === target;
      });
    }

    return filtered;
  }, [exercises, selectedTab, selectedLevel, selectedCategory]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Back Button - Fixed position */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 50 : 40,
          left: 20,
          zIndex: 10,
          padding: 8,
        }}
      >
        <Ionicons name="chevron-back" size={28} color="#1F2937" />
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'web' ? 20 : 80,
          paddingBottom: 30,
          paddingHorizontal: 20,
        }}
      >
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
            onPress={() => {
              setSelectedTab('all');
              setSelectedCategory(null);
            }}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: selectedTab === 'all' ? '#FFFFFF' : 'transparent',
              borderRadius: 21,
              shadowColor: selectedTab === 'all' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: selectedTab === 'all' ? 0.1 : 0,
              shadowRadius: 4,
              elevation: selectedTab === 'all' ? 2 : 0,
            }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: selectedTab === 'all' ? '#181D27' : '#667085'
            }}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedTab('cardio');
              setSelectedCategory(null);
            }}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: selectedTab === 'cardio' ? '#FFFFFF' : 'transparent',
              borderRadius: 21,
              shadowColor: selectedTab === 'cardio' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: selectedTab === 'cardio' ? 0.1 : 0,
              shadowRadius: 4,
              elevation: selectedTab === 'cardio' ? 2 : 0,
            }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: selectedTab === 'cardio' ? '#181D27' : '#667085'
            }}>Cardio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedTab('weight');
              setSelectedCategory(null);
            }}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: selectedTab === 'weight' ? '#FFFFFF' : 'transparent',
              borderRadius: 21,
              shadowColor: selectedTab === 'weight' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: selectedTab === 'weight' ? 0.1 : 0,
              shadowRadius: 4,
              elevation: selectedTab === 'weight' ? 2 : 0,
            }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: selectedTab === 'weight' ? '#181D27' : '#667085'
            }}>Weight</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Bar (Level) */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="filter" size={18} color="#6B7280" />
            <Text style={{ marginLeft: 8, color: '#6B7280', fontSize: 14 }}>Level:</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowLevelPicker(!showLevelPicker)}
            style={{
              backgroundColor: '#F3F4F6',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 14, color: '#374151', marginRight: 4 }}>{selectedLevel}</Text>
            <Ionicons name="chevron-down" size={14} color="#374151" />
          </TouchableOpacity>
        </View>

        {showLevelPicker && (
          <View style={{
            position: 'absolute',
            top: Platform.OS === 'web' ? 160 : 220,
            right: 20,
            width: 150,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            zIndex: 100,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
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
                  borderBottomWidth: level !== 'Expert' ? 1 : 0,
                  borderBottomColor: '#E5E7EB',
                }}
              >
                <Text style={{
                  color: selectedLevel === level ? '#7DD1E0' : '#374151',
                  fontWeight: selectedLevel === level ? '600' : '400',
                }}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Horizontal Category Selector for Weight */}
        {(selectedTab === 'weight') && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
            contentContainerStyle={{ gap: 10 }}
          >
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: !selectedCategory ? '#7DD1E0' : '#F3F4F6',
              }}
            >
              <Text style={{ color: !selectedCategory ? '#FFFFFF' : '#6B7280', fontWeight: '600' }}>All</Text>
            </TouchableOpacity>
            {[
              { id: 'full_body', label: 'Full Body' },
              { id: 'upper_body', label: 'Upper' },
              { id: 'lower_body', label: 'Lower' },
              { id: 'core', label: 'Core' }
            ].map(cat => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: selectedCategory === cat.id ? '#7DD1E0' : '#F3F4F6',
                }}
              >
                <Text style={{ color: selectedCategory === cat.id ? '#FFFFFF' : '#6B7280', fontWeight: '600' }}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View>
          {/* Workouts List */}
          {finalExercises.length > 0 ? (
            finalExercises.map((workout) => (
              <TouchableOpacity
                key={workout.id}
                onPress={() => {
                  if (workout.videoUrl) {
                    Linking.openURL(workout.videoUrl).catch(err => console.error("Couldn't open URL", err));
                  }
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  backgroundColor: (workout.bodyPart || workout.type || '').toLowerCase().startsWith('weight') ? '#FCE7F3' : '#E0F2FE',
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
                  overflow: 'hidden',
                }}>
                  {workout.thumbnail ? (
                    <Image
                      source={{ uri: workout.thumbnail }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                      onError={(e) => console.log('Error loading thumbnail from DB:', e.nativeEvent.error)}
                    />
                  ) : workout.videoUrl && getYoutubeId(workout.videoUrl) ? (
                    <Image
                      source={{ uri: `https://img.youtube.com/vi/${getYoutubeId(workout.videoUrl)}/hqdefault.jpg` }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                      onError={(e) => console.log('Error loading thumbnail from YouTube:', e.nativeEvent.error)}
                    />
                  ) : (
                    <Ionicons name="fitness-outline" size={30} color="#7DD1E0" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 }}
                    numberOfLines={2}
                  >
                    {workout.title}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text style={{ fontSize: 13, color: '#6B7280', marginLeft: 4 }}>
                      {workout.duration || 0} min
                    </Text>
                  </View>
                </View>
                {workout.videoUrl && <Ionicons name="play-circle" size={28} color="#9CA3AF" />}
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', marginTop: 60, opacity: 0.5 }}>
              <Ionicons name="search-outline" size={48} color="#9CA3AF" />
              <Text style={{ marginTop: 12, fontSize: 16, color: '#9CA3AF' }}>No exercises found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
