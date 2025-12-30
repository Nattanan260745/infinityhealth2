import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMissionPage } from '@/app/hook/useMissionPage';

type TabType = 'daily' | 'challenge';

const tabs: { key: TabType; label: string; icon: string }[] = [
  { key: 'daily', label: 'Daily', icon: '📅' },
  { key: 'challenge', label: 'Challenge', icon: '🏆' },
];

// Helper to determine presets based on mission type/unit
const getPresets = (mission: any) => {
  const title = mission.title.toLowerCase();
  const unit = mission.targetUnit?.toLowerCase() || '';
  const total = mission.total || 0;

  // Case 1: Binary/Daily Task (e.g., "Avoid Fried Food" 0/1 day) -> No +/- buttons
  if (total <= 1 || unit.includes('day') || unit.includes('time') || unit.includes('playlist')) {
    return null; // Signals to render a simple "Done" button
  }

  // Case 2: Water (Standard)
  if (title.includes('water') || unit.includes('ml')) {
    return [
      { label: '💧 250ml', value: 250 },
      { label: '🍼 600ml', value: 600 }
    ];
  }

  // Case 3: Steps (Standard)
  if (title.includes('step') || unit.includes('step')) {
    return [
      { label: '👣 500', value: 500 },
      { label: '🏃 1000', value: 1000 }
    ];
  }

  // Case 4: Exercise/Sleep (Time-based)
  if (title.includes('exercise') || title.includes('workout') || title.includes('sleep') || unit.includes('min') || unit.includes('hr')) {
    // If target is small (<= 20 mins), give smaller increments
    if (total <= 20) {
      return [
        { label: '⏱️ 5m', value: 5 },
        { label: '💪 15m', value: 15 }
      ];
    }
    // Standard duration
    return [
      { label: '⏱️ 15m', value: 15 },
      { label: '💪 30m', value: 30 }
    ];
  }

  // Case 5: Calories/Food
  if (title.includes('cal') || title.includes('food')) {
    return [
      { label: '🍎 50', value: 50 },
      { label: '🍔 200', value: 200 }
    ];
  }

  // Default fallback
  return [
    { label: 'Item', value: 1 },
    { label: 'Pack', value: 5 }
  ];
};

// Generic Component for Quick Update
const QuickUpdateControl = ({ mission, onUpdate }: { mission: any, onUpdate: (m: any, val: number) => void }) => {
  const presets = getPresets(mission);
  const [currentPresetIndex, setCurrentPresetIndex] = React.useState(0);

  // If no presets (Binary Task), show simple "Done" button
  if (!presets) {
    return (
      <TouchableOpacity
        onPress={() => onUpdate(mission, 1)}
        style={{
          backgroundColor: '#10B981',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4
        }}
      >
        <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>Done</Text>
      </TouchableOpacity>
    );
  }

  const currentPreset = presets[currentPresetIndex];

  const togglePreset = () => {
    setCurrentPresetIndex((prev) => (prev + 1) % presets.length);
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {/* Minus */}
      <TouchableOpacity
        onPress={() => onUpdate(mission, -currentPreset.value)}
        style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name="remove" size={14} color="#4B5563" />
      </TouchableOpacity>

      {/* Unit Selector */}
      <TouchableOpacity
        onPress={togglePreset}
        style={{
          minWidth: 60,
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: 8,
          backgroundColor: '#EFF6FF',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#BFDBFE'
        }}
      >
        <Text style={{ fontSize: 11, color: '#2563EB', fontWeight: '600' }}>
          {currentPreset.label}
        </Text>
      </TouchableOpacity>

      {/* Plus */}
      <TouchableOpacity
        onPress={() => onUpdate(mission, currentPreset.value)}
        style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name="add" size={14} color="#2563EB" />
      </TouchableOpacity>
    </View>
  );
};

export default function MissionsScreen() {
  const {
    selectedTab,
    setSelectedTab,
    missions,
    isLoading,
    error,
    completedCount,
    totalCount,
    unlockedCount,
    totalXP,
    totalGems,
    userLevel,
    showUpdateModal,
    setShowUpdateModal,
    selectedMission,
    inputValue,
    setInputValue,
    handleUpdatePress,
    handleSave,
    handleComplete,
    handleQuickUpdate,
    refreshMissions,
  } = useMissionPage();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Update Progress Modal (Still kept for backup/custom input if needed, though hidden for now) */}
      <Modal
        visible={showUpdateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowUpdateModal(false)}>
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TouchableWithoutFeedback>
                <View style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 24,
                  width: 280,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 8,
                }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#1F2937',
                    textAlign: 'center',
                    marginBottom: 20,
                  }}>
                    Update Progress
                  </Text>

                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 8,
                  }}>
                    {selectedMission?.title}
                  </Text>

                  <TextInput
                    value={inputValue}
                    onChangeText={setInputValue}
                    keyboardType="numeric"
                    placeholder="Enter value"
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: Number(inputValue) > 0 ? '#E5E7EB' : '#EF4444',
                      padding: 14,
                      fontSize: 16,
                      color: '#1F2937',
                      marginBottom: 20,
                    }}
                  />

                  <TouchableOpacity
                    onPress={handleSave}
                    style={{
                      backgroundColor: '#F59E0B',
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: 16,
                      fontWeight: '600',
                    }}>
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
          paddingBottom: 30,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshMissions}
            colors={['#F59E0B']}
            tintColor="#F59E0B"
          />
        }
      >
        {/* Hero Image */}
        <View style={{
          height: 200,
          backgroundColor: '#FEF3C7',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 100 }}>🧗</Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Header */}
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginTop: 16, marginBottom: 24 }}>
            Missions
          </Text>

          {/* Tabs */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: '#F3F4F6',
            borderRadius: 25,
            padding: 4,
            marginBottom: 24,
          }}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setSelectedTab(tab.key)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 22,
                  backgroundColor: selectedTab === tab.key ? '#FFFFFF' : 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16, marginRight: 6 }}>{tab.icon}</Text>
                <Text style={{
                  textAlign: 'center',
                  fontWeight: '600',
                  color: selectedTab === tab.key ? '#7DD1E0' : '#6B7280',
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* User Level Info (for Challenge tab) */}
          {selectedTab === 'challenge' && (
            <View style={{
              backgroundColor: '#FEF3C7',
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>⭐</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#92400E' }}>
                  Your Level: {userLevel}
                </Text>
                <Text style={{ fontSize: 12, color: '#B45309' }}>
                  Unlocked: {unlockedCount}/{totalCount} challenges
                </Text>
              </View>
            </View>
          )}

          {/* Progress Card */}
          <View style={{
            backgroundColor: '#F9FAFB',
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>Missions Completed</Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>{completedCount}/{totalCount}</Text>
            </View>

            {/* Progress Bar */}
            <View style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 16 }}>
              <View style={{
                height: 8,
                backgroundColor: '#F59E0B',
                borderRadius: 4,
                width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%',
              }} />
            </View>

            {/* Rewards */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16 }}>⚡</Text>
                <Text style={{ marginLeft: 4, fontWeight: '600', color: '#F59E0B' }}>{totalXP}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16 }}>💎</Text>
                <Text style={{ marginLeft: 4, fontWeight: '600', color: '#EC4899' }}>{totalGems}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16 }}>🔥</Text>
                <Text style={{ marginLeft: 4, fontWeight: '600', color: '#F97316' }}>{completedCount}</Text>
              </View>
            </View>
          </View>

          {/* Missions Title */}
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
            {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Missions
          </Text>

          {/* Loading State */}
          {isLoading && missions.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color="#F59E0B" />
              <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading missions...</Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={{
              alignItems: 'center',
              paddingVertical: 40,
              backgroundColor: '#FEF2F2',
              borderRadius: 12,
              marginBottom: 16,
            }}>
              <Ionicons name="alert-circle" size={40} color="#EF4444" />
              <Text style={{ marginTop: 12, color: '#EF4444', textAlign: 'center' }}>{error}</Text>
              <TouchableOpacity
                onPress={refreshMissions}
                style={{
                  marginTop: 16,
                  backgroundColor: '#EF4444',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !error && missions.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 60 }}>🎯</Text>
              <Text style={{ marginTop: 12, color: '#6B7280', fontSize: 16 }}>
                No {selectedTab} missions available
              </Text>
            </View>
          )}

          {/* Mission Cards */}
          {missions.map((mission) => (
            <View
              key={mission.id}
              style={{
                backgroundColor: mission.isLocked ? '#F9FAFB' : '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: mission.completed ? '#D1FAE5' : mission.isLocked ? '#E5E7EB' : '#F3F4F6',
                position: 'relative',
                opacity: mission.isLocked ? 0.7 : 1,
              }}
            >
              {/* Locked Badge */}
              {mission.isLocked && (
                <View style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FEE2E2',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}>
                  <Ionicons name="lock-closed" size={12} color="#DC2626" />
                  <Text style={{ fontSize: 10, color: '#DC2626', marginLeft: 4, fontWeight: '600' }}>
                    Lv.{mission.minLevel}
                  </Text>
                </View>
              )}

              {/* Completed checkmark */}
              {mission.completed && !mission.isLocked && (
                <View style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                }}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: mission.isLocked ? '#E5E7EB' : '#FEF3C7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ fontSize: 20 }}>{mission.isLocked ? '🔒' : mission.icon}</Text>
                </View>
                <View style={{ flex: 1, paddingRight: mission.isLocked ? 60 : 24 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: mission.isLocked ? '#9CA3AF' : '#1F2937'
                  }}>
                    {mission.title}
                  </Text>
                  {mission.description && (
                    <Text style={{
                      fontSize: 12,
                      color: mission.isLocked ? '#D1D5DB' : '#6B7280',
                      marginTop: 2
                    }}>
                      {mission.description}
                    </Text>
                  )}
                </View>
              </View>

              {/* Progress (hide for locked) */}
              {!mission.isLocked && (
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>Progress</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>
                      {mission.progress}/{mission.total} {mission.targetUnit}
                    </Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 }}>
                    <View style={{
                      height: 6,
                      backgroundColor: mission.completed ? '#10B981' : '#F59E0B',
                      borderRadius: 3,
                      width: `${Math.min((mission.progress / mission.total) * 100, 100)}%`,
                    }} />
                  </View>
                </View>
              )}

              {/* Rewards & Action */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                    <Text style={{ fontSize: 14 }}>⚡</Text>
                    <Text style={{
                      marginLeft: 4,
                      fontSize: 12,
                      color: mission.isLocked ? '#D1D5DB' : '#F59E0B'
                    }}>
                      {mission.xp}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14 }}>💎</Text>
                    <Text style={{
                      marginLeft: 4,
                      fontSize: 12,
                      color: mission.isLocked ? '#D1D5DB' : '#EC4899'
                    }}>
                      {mission.gems}
                    </Text>
                  </View>
                </View>

                {mission.isLocked ? (
                  <View style={{
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}>
                    <Text style={{ fontSize: 12, color: '#9CA3AF', fontWeight: '600' }}>
                      Unlock at Lv.{mission.minLevel}
                    </Text>
                  </View>
                ) : mission.completed ? (
                  <View style={{
                    borderWidth: 1,
                    borderColor: '#10B981',
                    backgroundColor: '#D1FAE5',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}>
                    <Text style={{ fontSize: 12, color: '#059669', fontWeight: '600' }}>Completed</Text>
                  </View>
                ) : (
                  <View>
                    <QuickUpdateControl mission={mission} onUpdate={handleQuickUpdate} />
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView >
    </View >
  );
}
