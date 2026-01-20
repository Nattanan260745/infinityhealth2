import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import storage from '../utils/storage';
import { getUserProfile } from '../service/InfinityhealthApi';

export default function ProfileScreen() {
  const [userName, setUserName] = useState('User');

  const [userData, setUserData] = useState({
    avatar: 'https://i.pinimg.com/736x/5b/2c/47/5b2c4756f84f6a0478b67df75e2fd1c0.jpg',
    level: 1, // Default to 1
    rank: 'Beginner',
    experience: 0,
    maxExperience: 1000,
    totalPoints: 0,
  });

  // Load user data from storage and API whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          const storedName = await storage.getItem('userFullName');
          if (storedName) setUserName(storedName);

          const userId = await storage.getItem('userId');
          if (userId) {
            const res = await getUserProfile(userId);
            if (res.success && res.data) {
              setUserData({
                avatar: res.data.profile_img || 'https://i.pinimg.com/736x/5b/2c/47/5b2c4756f84f6a0478b67df75e2fd1c0.jpg',
                level: res.data.level_id || 1,
                rank: 'Beginner', // You might want to calculate rank based on level
                experience: res.data.exp || 0,
                maxExperience: 1000, // Or fetch next level requirement
                totalPoints: res.data.points || 0
              });
              // Update name if returned
              if (res.data.user?.firstName) {
                setUserName(`${res.data.user.firstName} ${res.data.user.lastName}`);
              }
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };

      loadUserData();
    }, [])
  );

  const experienceProgress = (userData.experience / userData.maxExperience) * 100;

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
        {/* Title */}
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1F2937',
          textAlign: 'center',
          marginBottom: 24,
        }}>
          Your Profile
        </Text>

        {/* Avatar Section */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: userData.avatar }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 3,
                borderColor: '#E5E7EB',
              }}
            />
            {/* Camera Icon */}
            <TouchableOpacity style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <Ionicons name="camera" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Username */}
          <Text style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: '#1F2937',
            marginTop: 16,
          }}>
            {userName}
          </Text>
        </View>

        {/* Level Card */}
        <View style={{
          backgroundColor: '#F9FAFB',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            {/* Level Circle */}
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#7DD1E0',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }}>
                {userData.level}
              </Text>
            </View>

            {/* Level Info */}
            <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>
                Level {userData.level}
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>
                {userData.rank}
              </Text>
            </View>
          </View>

          {/* Experience */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
                Experience
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>
                {userData.experience} / {userData.maxExperience}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={{
              height: 12,
              backgroundColor: '#E5E7EB',
              borderRadius: 6,
              overflow: 'hidden',
            }}>
              <View style={{
                width: `${experienceProgress}%`,
                height: '100%',
                backgroundColor: '#7DD1E0',
                borderRadius: 6,
              }} />
            </View>
          </View>
        </View>

        {/* Total Points Card */}
        <View style={{
          backgroundColor: '#F9FAFB',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
            Total Points
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: 8 }}>💎</Text>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937' }}>
              {userData.totalPoints}
            </Text>
          </View>
        </View>

        {/* Ranks Up Card */}
        <View style={{
          backgroundColor: '#F9FAFB',
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
        }}>
          {/* Trophy Icon */}
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#F3E8FF',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Ionicons name="trophy" size={32} color="#A855F7" />
          </View>

          <Text style={{
            fontSize: 14,
            color: '#6B7280',
            textAlign: 'center',
            marginBottom: 4,
          }}>
            Complete missions to earn EXP and Points
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#6B7280',
            textAlign: 'center',
            marginBottom: 20,
          }}>
            Use {userData.totalPoints} points and {userData.maxExperience} exp
          </Text>

          {/* Ranks Up Button */}
          <TouchableOpacity style={{
            backgroundColor: '#F472B6',
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 25,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
              Ranks Up!
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
