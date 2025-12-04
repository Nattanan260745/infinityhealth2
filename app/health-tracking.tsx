import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type TabType = 'workout' | 'health';

const moods = ['😁', '😊', '😐', '😢', '😭'];
const activityTypes = ['Walking', 'Running', 'Cycling', 'Swimming', 'Yoga', 'Gym Workout'];

export default function HealthTrackingScreen() {
  const [selectedTab, setSelectedTab] = useState<TabType>('workout');
  
  // Workout state
  const [activityType, setActivityType] = useState('Walking');
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [duration, setDuration] = useState('30');
  const [distance, setDistance] = useState('8.5');
  const [calories, setCalories] = useState('800');
  
  // Health state
  const [weight, setWeight] = useState('70.5');
  const [height, setHeight] = useState('180');
  const [sleep, setSleep] = useState('8');
  const [water, setWater] = useState('2000');
  const [steps, setSteps] = useState('10000');
  const [selectedMood, setSelectedMood] = useState(1);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'web' ? 20 : 50,
          paddingBottom: 100,
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
          Health Tracking
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
            onPress={() => setSelectedTab('workout')}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              borderRadius: 22,
              backgroundColor: selectedTab === 'workout' ? '#14B8A6' : 'transparent',
            }}
          >
            <Ionicons name="fitness" size={18} color={selectedTab === 'workout' ? '#FFFFFF' : '#6B7280'} />
            <Text style={{
              marginLeft: 6,
              fontWeight: '600',
              color: selectedTab === 'workout' ? '#FFFFFF' : '#6B7280',
            }}>
              Workout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('health')}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              borderRadius: 22,
              backgroundColor: selectedTab === 'health' ? '#FFFFFF' : 'transparent',
            }}
          >
            <Ionicons name="heart" size={18} color={selectedTab === 'health' ? '#1F2937' : '#6B7280'} />
            <Text style={{
              marginLeft: 6,
              fontWeight: '600',
              color: selectedTab === 'health' ? '#1F2937' : '#6B7280',
            }}>
              Health
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'workout' ? (
          /* Workout Tab Content */
          <View style={{
            backgroundColor: '#F9FAFB',
            borderRadius: 16,
            padding: 20,
          }}>
            {/* Exercise Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 24 }}>🏋️</Text>
              <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: '600', color: '#1F2937' }}>
                Exercise
              </Text>
            </View>

            {/* Activity Type */}
            <Text style={{ fontSize: 14, color: '#374151', marginBottom: 8 }}>Activity Type</Text>
            <TouchableOpacity
              onPress={() => setShowActivityPicker(!showActivityPicker)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                padding: 14,
                marginBottom: showActivityPicker ? 0 : 20,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <Text style={{ color: '#9CA3AF', fontSize: 16 }}>{activityType}</Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>

            {showActivityPicker && (
              <View style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderTopWidth: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}>
                {activityTypes.map((type, index) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      setActivityType(type);
                      setShowActivityPicker(false);
                    }}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 14,
                      borderBottomWidth: index !== activityTypes.length - 1 ? 1 : 0,
                      borderBottomColor: '#F3F4F6',
                    }}
                  >
                    <Text style={{
                      color: activityType === type ? '#14B8A6' : '#374151',
                      fontWeight: activityType === type ? '600' : '400',
                    }}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Duration */}
            <Text style={{ fontSize: 14, color: '#374151', marginBottom: 8 }}>Duration (minutes)</Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              placeholder="30"
              placeholderTextColor="#D1D5DB"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                padding: 14,
                fontSize: 16,
                color: '#9CA3AF',
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            />

            {/* Distance */}
            <Text style={{ fontSize: 14, color: '#374151', marginBottom: 8 }}>Distance (km) - optional</Text>
            <TextInput
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              placeholder="0.0"
              placeholderTextColor="#D1D5DB"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                padding: 14,
                fontSize: 16,
                color: '#9CA3AF',
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            />

            {/* Calories */}
            <Text style={{ fontSize: 14, color: '#374151', marginBottom: 8 }}>Calories Burned (kcal) - optional</Text>
            <TextInput
              value={calories}
              onChangeText={setCalories}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#D1D5DB"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                padding: 14,
                fontSize: 16,
                color: '#9CA3AF',
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            />
          </View>
        ) : (
          /* Health Tab Content */
          <>
            {/* Body Measurements */}
            <View style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 20 }}>📊</Text>
                <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
                  Body Measurements
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>Weight (kg)</Text>
                  <TextInput
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      color: '#9CA3AF',
                    }}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>Height (cm)</Text>
                  <TextInput
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="decimal-pad"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      color: '#9CA3AF',
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Sleep */}
            <View style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 20 }}>🌙</Text>
                <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#1F2937' }}>Sleep</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>Hours</Text>
              <TextInput
                value={sleep}
                onChangeText={setSleep}
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: '#9CA3AF',
                }}
              />
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
                Recommended: 7-9 hours per night
              </Text>
            </View>

            {/* Water Intake */}
            <View style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 20 }}>💧</Text>
                <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#1F2937' }}>Water Intake</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#14B8A6', marginBottom: 6 }}>Amount (ml)</Text>
              <TextInput
                value={water}
                onChangeText={setWater}
                keyboardType="number-pad"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: '#9CA3AF',
                }}
              />
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
                Recommended: 2000-3000 ml per day
              </Text>
            </View>

            {/* Steps */}
            <View style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 20 }}>👟</Text>
                <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#1F2937' }}>Steps</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>Count</Text>
              <TextInput
                value={steps}
                onChangeText={setSteps}
                keyboardType="number-pad"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: '#9CA3AF',
                }}
              />
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
                Recommended: 10,000 steps per day
              </Text>
            </View>

            {/* Mood */}
            <View style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 20 }}>❤️</Text>
                <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#1F2937' }}>Mood</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                {moods.map((mood, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedMood(index)}
                    style={{
                      padding: 8,
                      borderRadius: 12,
                      backgroundColor: selectedMood === index ? '#FEF3C7' : 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: 32 }}>{mood}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#FFFFFF',
      }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#14B8A6',
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
