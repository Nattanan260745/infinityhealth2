import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import storage from '../utils/storage';
import {
  getUserMissions,
  completeMission,
  updateMissionProgress
} from '../service/InfinityhealthApi';
import { MissionWithStatus } from '../interface/infinityhealth.interface';

type TabType = 'daily' | 'challenge';

// Map icon for each mission type
const getMissionIcon = (title: string, type: string): string => {
  const titleLower = title.toLowerCase();

  if (titleLower.includes('water') || titleLower.includes('drink')) return '💧';
  if (titleLower.includes('walk') || titleLower.includes('step')) return '👟';
  if (titleLower.includes('exercise') || titleLower.includes('workout')) return '💪';
  if (titleLower.includes('sleep') || titleLower.includes('rest')) return '😴';
  if (titleLower.includes('food') || titleLower.includes('meal') || titleLower.includes('eat')) return '🥗';
  if (titleLower.includes('sugar')) return '🍬';
  if (titleLower.includes('stretch')) return '🧘';
  if (titleLower.includes('cardio')) return '🏃';
  if (titleLower.includes('weight')) return '🏋️';
  if (titleLower.includes('track') || titleLower.includes('health')) return '📊';

  // Default by type
  switch (type) {
    case 'daily': return '📅';
    case 'weekly': return '📆';
    case 'monthly': return '🗓️';
    case 'special': return '⭐';
    default: return '🎯';
  }
};

export interface DisplayMission {
  id: string;
  title: string;
  icon: string;
  progress: number;
  total: number;
  xp: number;
  gems: number;
  completed: boolean;
  type: string;
  description: string;
  missionId: string;
  minLevel: number;
  targetValue: number;
  targetUnit: string;
  isLocked: boolean;
}

export const useMissionPage = () => {
  const [selectedTab, setSelectedTab] = useState<TabType>('daily');
  const [missions, setMissions] = useState<MissionWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<number>(1);

  // Modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<DisplayMission | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Load user ID and level
  useEffect(() => {
    const loadUserData = async () => {
      const id = await storage.getItem('userId');
      const level = await storage.getItem('userLevel');
      setUserId(id);
      setUserLevel(level ? parseInt(level) : 1);
    };
    loadUserData();
  }, []);

  // Fetch missions
  const fetchMissions = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserMissions(userId);

      if (response.success && response.data) {
        setMissions(response.data);
      } else {
        setError(response.message || 'Failed to load missions');
      }
    } catch (err: any) {
      console.error('Error fetching missions:', err);
      setError(err.message || 'Failed to load missions');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  // Convert API mission to display format
  const convertToDisplayMission = (mission: MissionWithStatus): DisplayMission => {
    const progressParts = mission.user_status?.progress?.split('/') || ['0', String(mission.target_value || 100)];
    const currentProgress = parseInt(progressParts[0]) || 0;
    const totalProgress = parseInt(progressParts[1]) || mission.target_value || 100;
    const minLevel = mission.min_level || 1;
    const isLocked = mission.type === 'challenge' && userLevel < minLevel;

    return {
      id: mission._id,
      title: mission.title,
      icon: getMissionIcon(mission.title, mission.type),
      progress: currentProgress,
      total: totalProgress,
      xp: mission.reward_exp,
      gems: mission.reward_points,
      completed: mission.user_status?.mission_status === 'completed',
      type: mission.type,
      description: mission.description,
      missionId: mission._id,
      minLevel: minLevel,
      targetValue: mission.target_value || 1,
      targetUnit: mission.target_unit || '',
      isLocked: isLocked,
    };
  };

  // Filter missions by selected tab
  const filteredMissions = missions
    .filter(m => m.type === selectedTab)
    .map(convertToDisplayMission)
    .sort((a, b) => {
      // Sort challenge missions by minLevel (unlocked first)
      if (selectedTab === 'challenge') {
        if (a.isLocked !== b.isLocked) return a.isLocked ? 1 : -1;
        return a.minLevel - b.minLevel;
      }
      return 0;
    });

  // Stats
  const completedCount = filteredMissions.filter(m => m.completed).length;
  const totalXP = filteredMissions.reduce((sum, m) => sum + m.xp, 0);
  const totalGems = filteredMissions.reduce((sum, m) => sum + m.gems, 0);

  // Handle update press
  const handleUpdatePress = (mission: DisplayMission) => {
    setSelectedMission(mission);
    setInputValue(mission.progress.toString());
    setShowUpdateModal(true);
  };

  // Handle save progress
  const handleSave = async () => {
    if (!selectedMission || !userId) return;

    const newProgress = parseFloat(inputValue) || 0;
    const isCompleted = newProgress >= selectedMission.total;

    try {
      if (isCompleted) {
        // Complete the mission
        const response = await completeMission(userId, selectedMission.missionId);

        if (response.success) {
          // Show reward notification
          const rewards = response.data?.rewards;
          if (Platform.OS === 'web') {
            alert(`🎉 Mission Complete!\n+${rewards?.exp || 0} XP\n+${rewards?.points || 0} Points`);
          } else {
            Alert.alert(
              '🎉 Mission Complete!',
              `+${rewards?.exp || 0} XP\n+${rewards?.points || 0} Points`
            );
          }
        }
      } else {
        // Update progress
        await updateMissionProgress(
          userId,
          selectedMission.missionId,
          `${Math.min(newProgress, selectedMission.total)}/${selectedMission.total}`,
          'in_progress'
        );
      }

      // Refresh missions
      await fetchMissions();
    } catch (err: any) {
      console.error('Error updating mission:', err);
      if (Platform.OS === 'web') {
        alert('Failed to update mission');
      } else {
        Alert.alert('Error', 'Failed to update mission');
      }
    }

    setShowUpdateModal(false);
    setSelectedMission(null);
    setInputValue('');
  };

  // Handle complete mission directly
  const handleComplete = async (mission: DisplayMission) => {
    if (!userId) return;

    try {
      const response = await completeMission(userId, mission.missionId);

      if (response.success) {
        const rewards = response.data?.rewards;
        if (Platform.OS === 'web') {
          alert(`🎉 Mission Complete!\n+${rewards?.exp || 0} XP\n+${rewards?.points || 0} Points`);
        } else {
          Alert.alert(
            '🎉 Mission Complete!',
            `+${rewards?.exp || 0} XP\n+${rewards?.points || 0} Points`
          );
        }
        await fetchMissions();
      }
    } catch (err: any) {
      console.error('Error completing mission:', err);
    }
  };

  // Handle quick update (add/subtract value)
  const handleQuickUpdate = async (mission: DisplayMission, changeAmount: number) => {
    if (!userId) return;

    const currentProgress = mission.progress;
    const newProgress = Math.max(0, currentProgress + changeAmount); // Prevent negative
    const isCompleted = newProgress >= mission.total;

    // Optimistic update (optional, but good for UI responsiveness)
    setMissions(prev => prev.map(m =>
      m._id === mission.missionId
        ? {
          ...m,
          user_status: {
            ...m.user_status,
            progress: `${Math.min(newProgress, mission.total)}/${mission.total}`,
            mission_status: isCompleted ? 'completed' : 'in_progress'
          }
        }
        : m
    ));

    try {
      if (isCompleted) {
        const response = await completeMission(userId, mission.missionId);
        if (response.success) {
          const rewards = response.data?.rewards;
          if (Platform.OS === 'web') {
            alert(`🎉 Mission Complete!\n+${rewards?.exp || 0} XP\n+${rewards?.points || 0} Points`);
          } else {
            Alert.alert('🎉 Mission Complete!', `+${rewards?.exp || 0} XP\n+${rewards?.points || 0} Points`);
          }
        }
      } else {
        await updateMissionProgress(
          userId,
          mission.missionId,
          `${Math.min(newProgress, mission.total)}/${mission.total}`,
          'in_progress'
        );
      }

      // Refresh to get sync backend state
      await fetchMissions();
    } catch (err) {
      console.error('Quick update error:', err);
      // Revert optimistic update if needed or just re-fetch
      await fetchMissions();
    }
  };

  // Count unlocked missions (for challenge tab)
  const unlockedCount = filteredMissions.filter(m => !m.isLocked).length;

  return {
    selectedTab,
    setSelectedTab,
    missions: filteredMissions,
    isLoading,
    error,
    completedCount,
    totalCount: filteredMissions.length,
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
    refreshMissions: fetchMissions,
  };
};

export type IuseMissionPage = ReturnType<typeof useMissionPage>;

