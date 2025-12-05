import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Modal, TextInput, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type TabType = 'daily' | 'challenge';

interface Mission {
  id: number;
  title: string;
  icon: string;
  progress: number;
  total: number;
  xp: number;
  gems: number;
  completed: boolean;
}

const initialDailyMissions: Mission[] = [
  { id: 1, title: 'Drink water at least 2000 ml', icon: '💧', progress: 1000, total: 2000, xp: 50, gems: 10, completed: false },
  { id: 2, title: 'Walk 5000 steps', icon: '👟', progress: 5000, total: 5000, xp: 50, gems: 10, completed: true },
  { id: 3, title: 'Avoid fried foods', icon: '🥗', progress: 5000, total: 5000, xp: 50, gems: 10, completed: true },
];

const initialChallengeMissions: Mission[] = [
  { id: 4, title: 'No sugar for 1 day', icon: '🍬', progress: 0, total: 1, xp: 100, gems: 50, completed: false },
  { id: 5, title: 'Exercise for 3 days', icon: '💪', progress: 3, total: 3, xp: 100, gems: 50, completed: true },
];

export default function MissionsScreen() {
  const [selectedTab, setSelectedTab] = useState<TabType>('daily');
  const [dailyMissions, setDailyMissions] = useState<Mission[]>(initialDailyMissions);
  const [challengeMissions, setChallengeMissions] = useState<Mission[]>(initialChallengeMissions);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [inputValue, setInputValue] = useState('');
  
  const missions = selectedTab === 'daily' ? dailyMissions : challengeMissions;
  const completedCount = missions.filter(m => m.completed).length;
  const totalXP = missions.reduce((sum, m) => sum + m.xp, 0);
  const totalGems = missions.reduce((sum, m) => sum + m.gems, 0);

  const handleUpdatePress = (mission: Mission) => {
    setSelectedMission(mission);
    setInputValue(mission.progress.toString());
    setShowUpdateModal(true);
  };

  const handleSave = () => {
    if (!selectedMission) return;
    
    const newProgress = parseFloat(inputValue) || 0;
    const isCompleted = newProgress >= selectedMission.total;
    
    const updateMissions = (missions: Mission[]) => 
      missions.map(m => 
        m.id === selectedMission.id 
          ? { ...m, progress: Math.min(newProgress, m.total), completed: isCompleted }
          : m
      );

    if (selectedTab === 'daily') {
      setDailyMissions(updateMissions(dailyMissions));
    } else {
      setChallengeMissions(updateMissions(challengeMissions));
    }
    
    setShowUpdateModal(false);
    setSelectedMission(null);
    setInputValue('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Update Progress Modal */}
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
                      borderColor: '#E5E7EB',
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
            <TouchableOpacity
              onPress={() => setSelectedTab('daily')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 22,
                backgroundColor: selectedTab === 'daily' ? '#FFFFFF' : 'transparent',
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontWeight: '600',
                color: selectedTab === 'daily' ? '#7DD1E0' : '#6B7280',
              }}>
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab('challenge')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 22,
                backgroundColor: selectedTab === 'challenge' ? '#FFFFFF' : 'transparent',
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontWeight: '600',
                color: selectedTab === 'challenge' ? '#7DD1E0' : '#6B7280',
              }}>
                Challenge
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress Card */}
          <View style={{
            backgroundColor: '#F9FAFB',
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>Missions Completed</Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>{completedCount}/{missions.length}</Text>
            </View>
            
            {/* Progress Bar */}
            <View style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 16 }}>
              <View style={{
                height: 8,
                backgroundColor: '#F59E0B',
                borderRadius: 4,
                width: `${(completedCount / missions.length) * 100}%`,
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
                <Text style={{ marginLeft: 4, fontWeight: '600', color: '#F97316' }}>0</Text>
              </View>
            </View>
          </View>

          {/* Missions Title */}
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
            {selectedTab === 'daily' ? 'Daily Missions' : 'Challenge Missions'}
          </Text>

          {/* Mission Cards */}
          {missions.map((mission) => (
            <View
              key={mission.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#F3F4F6',
                position: 'relative',
              }}
            >
              {/* Completed checkmark */}
              {mission.completed && (
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
                  backgroundColor: '#FEF3C7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ fontSize: 20 }}>{mission.icon}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: '#1F2937', paddingRight: 24 }}>
                  {mission.title}
                </Text>
              </View>

              {/* Progress */}
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>Progress</Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>{mission.progress}/{mission.total}</Text>
                </View>
                <View style={{ height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 }}>
                  <View style={{
                    height: 6,
                    backgroundColor: mission.completed ? '#F59E0B' : '#F59E0B',
                    borderRadius: 3,
                    width: `${(mission.progress / mission.total) * 100}%`,
                  }} />
                </View>
              </View>

              {/* Rewards & Action */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                    <Text style={{ fontSize: 14 }}>⚡</Text>
                    <Text style={{ marginLeft: 4, fontSize: 12, color: '#F59E0B' }}>{mission.xp}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14 }}>💎</Text>
                    <Text style={{ marginLeft: 4, fontSize: 12, color: '#EC4899' }}>{mission.gems}</Text>
                  </View>
                </View>
                
                {mission.completed ? (
                  <View style={{
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>Completed</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => handleUpdatePress(mission)}
                    style={{
                      backgroundColor: '#F3F4F6',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ color: '#1F2937', fontSize: 12, fontWeight: '600' }}>Update</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

