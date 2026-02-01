import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Image, Alert, ActivityIndicator, Linking } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import storage from '../utils/storage';
import { getUserProfile, getMissionsByType, getUserMissions, syncClerkUser } from '../service/InfinityhealthApi';
import { useUser, useAuth } from '@clerk/clerk-expo';

import LogoutModal from '../shared/LogoutModal';
import ImagePickerModal from '../shared/ImagePickerModal';
import ChallengeModal from '../shared/ChallengeModal';
import * as ImagePicker from 'expo-image-picker';
import { Mission, MissionWithStatus } from '../interface/infinityhealth.interface';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [userName, setUserName] = useState('User');

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [challengeMission, setChallengeMission] = useState<Mission | null>(null);
  const [userMissionStatus, setUserMissionStatus] = useState<MissionWithStatus | null>(null);

  const [userData, setUserData] = useState({
    avatar: 'https://i.pinimg.com/736x/5b/2c/47/5b2c4756f84f6a0478b67df75e2fd1c0.jpg',
    level: 1,
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
          if (user) {
            const name = user.fullName || user.firstName || 'User';
            const email = user.emailAddresses[0]?.emailAddress;
            const avatar = user.imageUrl;

            setUserName(name);
            setUserData(prev => ({
              ...prev,
              avatar: avatar || prev.avatar
            }));

            // SYNC CLERK USER with BACKEND
            let internalUserId = await storage.getItem('internalUserId');

            if (!internalUserId && email) {
              try {
                console.log('Syncing Clerk User with Backend...');
                const syncRes = await syncClerkUser(email, user.firstName || 'User', user.lastName || '', avatar);
                const syncData = syncRes as any; // Cast to avoid TS error
                if (syncData.success && syncData.user) {
                  internalUserId = syncData.user.id.toString();
                  await storage.setItem('internalUserId', internalUserId);
                  console.log('Synced! Internal ID:', internalUserId);
                }
              } catch (e) {
                console.error('Sync failed:', e);
              }
            }

            if (internalUserId) {
              // Fetch gamification stats using INTERNAL ID
              const res = await getUserProfile(internalUserId);
              if (res.success && res.data) {
                setUserData(prev => ({
                  ...prev,
                  level: res.data?.level_id || 1,
                  experience: res.data?.exp || 0,
                  totalPoints: res.data?.points || 0
                }));

                // Check for Level Challenge
                const currentLevel = res.data?.level_id || 1;
                if (currentLevel % 10 === 0) {
                  try {
                    const missionsRes = await getMissionsByType('challenge');
                    if (missionsRes.success && missionsRes.data) {
                      const challenge = missionsRes.data.find(m => m.min_level === currentLevel);
                      if (challenge) {
                        setChallengeMission(challenge);
                        // Check status
                        const userMissionsRes = await getUserMissions(internalUserId);
                        if (userMissionsRes.success && userMissionsRes.data) {
                          const status = userMissionsRes.data.find(m => m._id === challenge._id);
                          if (status) setUserMissionStatus(status);
                        }
                      }
                    }
                  } catch (e) { console.log('Mission API failed'); }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };

      loadUserData();
    }, [user])
  );

  const experienceProgress = (userData.experience / userData.maxExperience) * 100;

  const handlePickImage = () => {
    if (Platform.OS === 'web') {
      pickFromGallery();
    } else {
      setImagePickerModalVisible(true);
    }
  };

  const uploadImage = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets[0].base64) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      const originalAvatar = userData.avatar;

      setUserData(prev => ({ ...prev, avatar: base64 })); // Optimistic update
      setImagePickerModalVisible(false); // Close modal
      setIsUploading(true);

      try {
        await user?.setProfileImage({ file: base64 });
        await user?.reload();
      } catch (e) {
        console.error(e);
        Alert.alert("Upload Failed", "Could not update profile image. Reverting change.");
        setUserData(prev => ({ ...prev, avatar: originalAvatar })); // Revert
      } finally {
        setIsUploading(false);
      }
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert(
        "Permission Required",
        "Photo library access is needed to change your profile picture.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    uploadImage(result);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert(
        "Permission Required",
        "Camera access is needed to take a profile picture.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    uploadImage(result);
  };

  const handleRankUpPress = () => {
    if (!challengeMission) {
      Alert.alert("Error", "No challenge found for this level!");
      return;
    }

    const isCompleted = userMissionStatus?.user_status?.mission_status === 'completed';

    if (!isCompleted) {
      Alert.alert("Challenge Incomplete", "You haven't completed the Rank Up Challenge yet!", [
        { text: "View Challenge", onPress: () => setChallengeModalVisible(true) },
        { text: "Cancel", style: "cancel" }
      ]);
    } else {
      // Proceed to Rank Up
      // TODO: Call API to actually level up if backend requires, or just show success
      Alert.alert("Congratulations!", "You have proved your worth. Ranking Up...", [
        {
          text: "Yeah!", onPress: async () => {
            // Determine logic for simple level up or just refresh
            // For now, refresh
            router.replace('/(tabs)/profile');
          }
        }
      ]);
    }
  };

  const isLevelCapped = (userData.level % 10 === 0) && (userData.experience >= userData.maxExperience);

  const handleLogoutPress = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false); // Close modal first
    try {
      await signOut();
    } catch (error) {
      console.error('Logout API error:', error);
    }

    // Clear storage
    await storage.removeItem('userId');
    await storage.removeItem('userEmail');
    await storage.removeItem('userFullName');
    await storage.removeItem('token');

    // Router redirect handled by auth state mostly, but for safety:
    // router.replace('/(auth)/login'); 
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

            {/* Loading Indicator Overlay */}
            {isUploading && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 60,
                backgroundColor: 'rgba(255,255,255,0.7)',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ActivityIndicator size="small" color="#7DD1E0" />
              </View>
            )}
            {/* Camera Icon */}
            <TouchableOpacity
              onPress={handlePickImage}
              style={{
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

        {/* Ranks Up Card - Only show if capped */}
        {isLevelCapped && (
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
            <TouchableOpacity
              onPress={handleRankUpPress}
              style={{
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
        )}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogoutPress}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FEE2E2',
            borderRadius: 12,
            paddingVertical: 14,
            marginTop: 20
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#EF4444' }}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Logout Modal */}
      <LogoutModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
      />

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={imagePickerModalVisible}
        onClose={() => setImagePickerModalVisible(false)}
        onTakePhoto={takePhoto}
        onChooseFromGallery={pickFromGallery}
      />

      <ChallengeModal
        visible={challengeModalVisible}
        onClose={() => setChallengeModalVisible(false)}
        challenge={challengeMission}
        onGoToMission={() => {
          setChallengeModalVisible(false);
          router.push('/components/HomePage/subHomePage/missions');
        }}
      />
    </View>
  );
}
