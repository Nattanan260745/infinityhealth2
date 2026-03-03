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

type TabType = 'cardio' | 'weight';

const levels = ['Beginner', 'Intermediate', 'Expert'];

export default function ExerciseScreen() {
  const [selectedTab, setSelectedTab] = useState<TabType>('cardio');
  const [selectedLevel, setSelectedLevel] = useState('Beginner');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showLevelPicker, setShowLevelPicker] = useState(false);

  // Real Data State
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);


  // Fetch Exercises
  useFocusEffect(
    React.useCallback(() => {
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

  const filteredExercises = exercises.filter(ex => {
    if (selectedTab === 'weight') {
      if (!selectedCategory) return false;
      return ex.type === `weight_${selectedCategory}`;
    }
    return ex.type === 'cardio';
  });

  // Apply level filter
  const finalExercises = filteredExercises.filter(ex =>
    selectedLevel ? ex.difficulty.toLowerCase() === selectedLevel.toLowerCase() : true
  );

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
              color: selectedTab === 'cardio' ? '#7DD1E0' : '#6B7280',
            }}>
              Cardio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedTab('weight');
              setSelectedCategory(null); // Reset category when switching tabs 
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

        {/* Weight Training Categories */}
        {selectedTab === 'weight' && !selectedCategory ? (
          <View style={{ gap: 16 }}>
            {[
              { id: 'full_body', label: 'Full Body', icon: 'body', desc: 'Complete workout for all muscle groups' },
              { id: 'upper_body', label: 'Upper Body', icon: 'barbell', desc: 'Focus on chest, back, arms, and shoulders' },
              { id: 'lower_body', label: 'Lower Body', icon: 'walk', desc: 'Strengthen legs, glutes, and calves' },
              { id: 'core', label: 'Core', icon: 'fitness', desc: 'Build a strong core and abs' }
            ].map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F3F4F6',
                  padding: 16,
                  borderRadius: 16,
                }}
              >
                <View style={{
                  width: 60,
                  height: 60,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <Ionicons name={cat.icon as any} size={30} color="#1F2937" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>{cat.label}</Text>
                  <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{cat.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            {/* Back Button for Weight Categories */}
            {selectedTab === 'weight' && (
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
              >
                <Ionicons name="arrow-back" size={20} color="#6B7280" />
                <Text style={{ marginLeft: 8, color: '#6B7280', fontWeight: '500' }}>Back to Categories</Text>
              </TouchableOpacity>
            )}

            {/* Workouts List */}
            {(selectedTab === 'cardio' || !selectedLevel) && !selectedLevel ? (
              <View style={{ marginTop: 60, alignItems: 'center', opacity: 0.5 }}>
                <Ionicons name="options-outline" size={48} color="#9CA3AF" />
                <Text style={{ marginTop: 12, fontSize: 16, color: '#9CA3AF' }}>Please select a level to view exercises</Text>
              </View>
            ) : (
              /* Render Exercises (Filtered) */
              finalExercises.length > 0 ? (
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
                      backgroundColor: selectedTab === 'weight' ? '#FCE7F3' : '#E0F2FE', // Pink for Weight, Blue for Cardio
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
                          defaultSource={require('@/assets/images/exercise.png')} // Fallback
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
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>{workout.title}</Text>
                      <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{workout.description || 'No description'}</Text>
                      <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, textTransform: 'capitalize' }}>{workout.difficulty}</Text>
                    </View>
                    {workout.videoUrl && <Ionicons name="play-circle" size={24} color="#9CA3AF" />}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Text style={{ color: '#9CA3AF' }}>No exercises found for this level/category.</Text>
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>


    </View>
  );
}

