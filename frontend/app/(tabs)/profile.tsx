import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Image, Alert, ActivityIndicator, Linking } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import storage from '../utils/storage';
import { getUserProfile, getMissionsByType, getUserMissions, syncClerkUser, getLevelByExp, getLevelById, rankUpUser } from '../service/InfinityhealthApi';
import { useUser, useAuth } from '@clerk/clerk-expo';

import LogoutModal from '../shared/LogoutModal';
import UsernameModal from '../components/shared/UsernameModal';
import ImagePickerModal from '../shared/ImagePickerModal';
import ChallengeModal from '../shared/ChallengeModal';
import CustomAlert from '../shared/CustomAlert';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { Mission, MissionWithStatus } from '../interface/infinityhealth.interface';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [userName, setUserName] = useState('User');

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [usernameModalVisible, setUsernameModalVisible] = useState(false);
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [challengeMission, setChallengeMission] = useState<Mission | null>(null);
  const [userMissionStatus, setUserMissionStatus] = useState<MissionWithStatus | null>(null);

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    onConfirm: undefined as (() => void) | undefined,
    confirmText: 'OK',
    icon: undefined as React.ReactNode | undefined,
    showCancel: true,
  });

  const [userData, setUserData] = useState({
    avatar: 'https://i.pinimg.com/736x/5b/2c/47/5b2c4756f84f6a0478b67df75e2fd1c0.jpg',
    level: 1,
    rank: 'Beginner',
    experience: 0,
    minExperience: 0,
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

            let internalUserId = await storage.getItem('internalUserId');

            if (!internalUserId) {
              console.log('[Profile] Internal ID not found yet. Waiting for global sync...');
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

                // Fetch Level Data by ID to ensure correct progress bar even if XP overflows
                try {
                  const currentLevel = res.data?.level_id || 1;
                  const levelRes = await getLevelById(currentLevel);
                  if (levelRes.success && levelRes.data) {
                    setUserData(prev => ({
                      ...prev,
                      minExperience: levelRes.data?.min_exp || 0,
                      maxExperience: levelRes.data?.max_exp || 1000,
                    }));
                  }
                } catch (e) {
                  console.error('Failed to fetch level data:', e);
                }

                // Check for Level Challenge
                const currentLevel = res.data?.level_id || 1;
                // Always check for challenge
                try {
                  const missionsRes = await getMissionsByType('challenge');
                  if (missionsRes.success && missionsRes.data) {
                    // Fix: API returns 'requiredLevel', not 'min_level' for this endpoint
                    const challenge = missionsRes.data.find((m: any) => (m.requiredLevel || m.min_level) === currentLevel);
                    if (challenge) {
                      setChallengeMission(challenge);
                      // Check status
                      const userMissionsRes = await getUserMissions(internalUserId);
                      if (userMissionsRes.success && userMissionsRes.data) {
                        const status = userMissionsRes.data.find((m: any) => m._id === (challenge as any).id || m._id === challenge._id);
                        if (status) setUserMissionStatus(status);
                      }
                    } else {
                      setChallengeMission(null);
                      setUserMissionStatus(null);
                    }
                  }
                } catch (e) { console.log('Mission API failed'); }
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

  // Notification Handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true, // required for newer expo-notifications types
      shouldShowList: true,
    }),
  });

  const hasNotifiedRef = React.useRef(false);

  // Notify user if they are ready to rank up
  React.useEffect(() => {
    const checkCapAndNotify = async () => {
      const nextLevelCap = Math.ceil((userData.level + 1) / 10) * 10;
      // Check if at cap (10, 20...) and XP is maxed
      if (userData.level % 10 === 0 && userData.experience >= userData.maxExperience) {

        if (!hasNotifiedRef.current) {
          hasNotifiedRef.current = true;

          // 1. External Notification (System Tray)

          // 2. In-App Alert
          Alert.alert(
            "Rank Up Ready!",
            "You have reached the level cap! Complete the Rank Up Challenge to proceed to the next level.",
            [{ text: "OK" }]
          );
        }
      }
    };

    checkCapAndNotify();
  }, [userData.level, userData.experience, userData.maxExperience]);

  const experienceProgress = Math.min(100, Math.max(0, ((userData.experience - userData.minExperience) / (userData.maxExperience - userData.minExperience + 1)) * 100)) || 0;

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

  const handleUpdateName = async (newName: string) => {
    try {
      // 1. Update Clerk
      await user?.update({
        firstName: newName,
      });

      // 2. Optimistic Update
      setUserName(newName);

      // 3. Sync with Backend
      const email = user?.emailAddresses[0]?.emailAddress;
      const avatar = user?.imageUrl;
      if (email) {
        await syncClerkUser(email, newName, user?.lastName || '', avatar);
      }

      Alert.alert("Success", "Name updated successfully!");
    } catch (error) {
      console.error("Failed to update name:", error);
      Alert.alert("Error", "Could not update name. Please try again.");
    }
  };

  const handleRankUpPress = async () => {
    console.log('Rank Up Pressed! Level:', userData.level);

    const showAlert = (title: string, message: string, onConfirm?: () => void, confirmText = "OK", icon?: React.ReactNode, showCancel = true) => {
      setAlertConfig({ title, message, onConfirm, confirmText, icon, showCancel });
      setAlertVisible(true);
    };

    // 1. Calculate Requirements
    const level = Number(userData.level);
    const isBossLevel = (level % 10 === 0);
    const pointsCost = isBossLevel ? 1000 : 100;
    const xpRequired = level * 1000;

    // 2. Check EXP Requirement
    if (userData.experience < xpRequired) {
      showAlert("Not Ready", `You need ${xpRequired - userData.experience} more EXP to max out!`);
      return;
    }

    // 3. Check Points Requirement
    if (userData.totalPoints < pointsCost) {
      showAlert("Not Ready", `You need ${pointsCost} Points to Rank Up (Current: ${userData.totalPoints})`);
      return;
    }

    // 4. Check Challenge Requirement
    // Only check challenge if one exists for this level (Frontend check)
    // Determining if challenge exists: Current level usually has a challenge to verify before ranking up.
    // The backend `rank-up` will enforces this strictly.
    // Frontend just gives a hint.

    if (challengeMission) {
      // We can rely on `userMissionStatus` if available, or just let backend handle it.
      // But if we have status, check it.
      const isCompleted = userMissionStatus?.user_status?.mission_status === 'completed';
      if (!isCompleted) {
        showAlert("Challenge Incomplete", "You haven't completed the Rank Up Challenge yet!", () => {
          // Redirect logic or modal
          // The modal logic existed before, let's keep it if possible or just alert.
          // If we have `challengeModalVisible`, use it.
          // But simpler to just alert for now as I replaced the modal logic block partially in thought process? 
          // No, I replaced the *Card*. The modal state `challengeModalVisible` is still in file.
          // Wait, I need to make sure I don't break the closure.
          setChallengeModalVisible(true);
          setAlertVisible(false);
        }, "View Challenge");
        return;
      }
    }

    // Proceed to Rank Up API Call
    try {
      const internalId = await storage.getItem('internalUserId');
      if (internalId) {
        const res = await rankUpUser(internalId);
        if (res.success) {
          showAlert("Congratulations! 🎉", "You have successfully ranked up!\nKeep up the great work!", async () => {
            // Optimistic Update
            setUserData(prev => ({
              ...prev,
              level: prev.level + 1,
              totalPoints: prev.totalPoints - pointsCost,
              experience: 0, // Reset exp usually, or keep it if it carries over? Standard is reset or carry overflow.
              // Assuming backend handles overflow, but for UI sync, let's assume 0 for safety or fetch.
              // Better: Just set level and points, experience might be complex.
              // Actually, most games carry over. Let's start with 0 for visual clarity or fetch.
              // Safest: Trigger a re-fetch if possible, or just update level/points.
            }));

            // Force reload data by toggling a dependency or calling a refresh function if we had one.
            // Since `loadUserData` is inside useEffect, we can't call it directly.
            // But updating state will trigger re-render.

            // Remove router.replace as it's redundant on same screen
            setAlertVisible(false);
          }, "Awesome!", (
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#F3E8FF',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons name="trophy" size={40} color="#9333EA" />
            </View>
          ), false); // Hide Cancel Button
        } else {
          showAlert("Rank Up Failed", res.message || "Conditions not met.");
        }
      }
    } catch (e) {
      console.error(e);
      showAlert("Error", "Something went wrong.");
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
    await storage.removeItem('internalUserId'); // Fix: Clear internal ID
    await storage.removeItem('userEmail');
    await storage.removeItem('userFullName');
    await storage.removeItem('token');

    // Router redirect handled by auth state mostly, but for safety:
    router.replace('/(auth)/login');
  };

  const getLevelColor = (level: number) => {
    if (level <= 10) return '#86EFAC'; // Pastel Green
    if (level <= 20) return '#93C5FD'; // Pastel Blue
    if (level <= 30) return '#A5B4FC'; // Pastel Indigo
    if (level <= 40) return '#FDBA74'; // Pastel Orange
    if (level <= 50) return '#67E8F9'; // Pastel Cyan
    if (level <= 60) return '#D8B4FE'; // Pastel Violet
    if (level <= 70) return '#C084FC'; // Pastel Deep Purple
    if (level <= 80) return '#F472B6'; // Pastel Pink
    if (level <= 90) return '#FCA5A5'; // Pastel Red
    return '#FDE047'; // Pastel Gold
  };

  // Helper to convert hex to rgba for background tint
  const hexToRgba = (hex: string, opacity: number) => {
    let c: any;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + opacity + ')';
    }
    return hex;
  };

  const levelColor = getLevelColor(userData.level);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'web' ? 40 : 60,
          paddingBottom: 100,
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
          <TouchableOpacity
            onPress={() => setUsernameModalVisible(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 16,
              marginLeft: 8
            }}
          >
            <Text style={{
              fontSize: 22,
              fontWeight: 'bold',
              color: '#1F2937',
              marginRight: 8
            }}>
              {userName}
            </Text>
            <Ionicons name="pencil" size={18} color="#9CA3AF" />
          </TouchableOpacity>
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
              backgroundColor: hexToRgba(levelColor, 0.2), // Light background tint
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: levelColor }}>
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
                {userData.experience - userData.minExperience} / {userData.maxExperience - userData.minExperience + 1}
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
                backgroundColor: '#7DD1E0', // Fixed Cyan color
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
            <Image
              source={require('../../assets/images/point.png')}
              style={{ width: 20, height: 20, marginRight: 8 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>
              {userData.totalPoints}
            </Text>
          </View>
        </View>

        {/* Ranks Up Card - Always Visible */}
        {/* Ranks Up Card - Always Visible */}
        {(() => {
          const isBossLevel = (userData.level % 10 === 0);
          const pointsCost = isBossLevel ? 1000 : 100;
          const xpRequired = userData.level * 1000;

          const isExpReady = userData.experience >= xpRequired;
          const isPointsReady = userData.totalPoints >= pointsCost;

          let isChallengeReady = true;
          if (challengeMission) {
            const status = userMissionStatus?.user_status?.mission_status;
            isChallengeReady = status === 'completed';
          }

          const isReadyToRankUp = isExpReady && isPointsReady && isChallengeReady;

          return (
            <View style={{
              backgroundColor: '#F3F4F6',
              borderRadius: 20,
              padding: 24,
              marginBottom: 24,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Icon Circle */}
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: isReadyToRankUp ? '#E9D5FF' : '#E5E7EB',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <Ionicons name="trophy-outline" size={28} color={isReadyToRankUp ? "#A855F7" : "#9CA3AF"} />
              </View>

              {/* Description Text */}
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#374151', textAlign: 'center', marginBottom: 4 }}>
                {isReadyToRankUp ? "Rank Up Available!" : "Rank Up Requirements"}
              </Text>

              {/* Requirements Text */}
              <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20 }}>
                {isReadyToRankUp
                  ? `Ready to Rank Up! (Cost: ${pointsCost} Points)`
                  : `Requirements: Max EXP, Challenge, and ${pointsCost} Points`}
              </Text>

              {/* Status Indicators */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={isExpReady ? "checkmark-circle" : "ellipse-outline"} size={16} color={isExpReady ? "#10B981" : "#EF4444"} />
                  <Text style={{ marginLeft: 4, fontSize: 12, color: isExpReady ? '#4B5563' : '#EF4444' }}>Max EXP</Text>
                </View>

                {/* Points Indicator */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={isPointsReady ? "checkmark-circle" : "ellipse-outline"} size={16} color={isPointsReady ? "#10B981" : "#EF4444"} />
                  <Text style={{ marginLeft: 4, fontSize: 12, color: isPointsReady ? '#4B5563' : '#EF4444' }}>{pointsCost} Pts</Text>
                </View>

                {/* Challenge Indicator */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={isChallengeReady ? "checkmark-circle" : "ellipse-outline"} size={16} color={isChallengeReady ? "#10B981" : "#EF4444"} />
                  <Text style={{ marginLeft: 4, fontSize: 12, color: isChallengeReady ? '#4B5563' : '#EF4444' }}>Challenge</Text>
                </View>
              </View>

              {/* Button */}
              <TouchableOpacity
                onPress={handleRankUpPress}
                style={{
                  backgroundColor: isReadyToRankUp ? '#7DD1E0' : '#D1D5DB',
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  borderRadius: 25,
                  shadowColor: isReadyToRankUp ? '#7DD1E0' : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                disabled={!isReadyToRankUp}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                  Rank Up!
                </Text>
              </TouchableOpacity>
            </View>
          );
        })()}

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
      </ScrollView >
      {/* Logout Modal */}
      < LogoutModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)
        }
        onConfirm={confirmLogout}
      />

      <UsernameModal
        visible={usernameModalVisible}
        currentName={userName}
        onClose={() => setUsernameModalVisible(false)}
        onSave={handleUpdateName}
      />

      {/* Image Picker Modal */}
      < ImagePickerModal
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

      <CustomAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.confirmText}
        icon={alertConfig.icon}
        showCancel={alertConfig.showCancel}
      />
    </View >
  );
}
