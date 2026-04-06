import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { getAllExercises } from '../../../service/InfinityhealthApi';
import { Exercise } from '../../../interface/infinityhealth.interface';
import { useFocusEffect } from '@react-navigation/native';

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
  const [serverId, setServerId] = useState<number | null>(null);


  // Fetch Exercises
  useFocusEffect(
    React.useCallback(() => {
      fetchExercises();
      fetchHealth();
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

  const fetchHealth = async () => {
    try {
      const response = await require('../../../service/InfinityhealthApi').getHealth();
      if (response.serverId) {
        setServerId(response.serverId);
      }
    } catch (error) {
      console.log('Error fetching health:', error);
    }
  };

  const filteredExercises = exercises; // Force show all for debugging

  // Apply level filter
  const finalExercises = filteredExercises; // Force show all for debugging

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
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
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 4 }}>
          Exercise ({exercises.length})
        </Text>
        <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 20 }}>
          Server ID: {serverId || 'connecting...'}
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
            onPress={() => setSelectedTab('all')}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 22,
              backgroundColor: selectedTab === 'all' ? '#FFFFFF' : 'transparent',
            }}
          >
            <Text style={{
              textAlign: 'center',
              fontWeight: '600',
              color: selectedTab === 'all' ? '#7DD1E0' : '#6B7280',
            }}>
              All
            </Text>
          </TouchableOpacity>
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
              color: selectedTab === 'cardio' ? '#7DD1E0' : '#6B7280',
            }}>
              Cardio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedTab('weight');
              setSelectedCategory(null);
            }}
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
              color: selectedTab === 'weight' ? '#7DD1E0' : '#6B7280',
            }}>
              Weight
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

        {/* Horizontal Category Selector for Weight/Yoga */}
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
            {selectedTab === 'weight' && [
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
                  backgroundColor: workout.type?.startsWith('weight') ? '#FCE7F3' : '#E0F2FE',
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
                      defaultSource={require('@/assets/images/exercise.png')}
                    />
                  ) : (
                    <Image
                      source={require('@/assets/images/exercise.png')}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text 
                    style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 }}
                    numberOfLines={2}
                  >
                    {workout.title}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: 'bold' }}>
                    ID: {workout.id} | Type: {workout.type} | Diff: {workout.difficulty}
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

