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
  const [streak, setStreak] = useState<number>(0);

  // Modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<DisplayMission | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Status Modal State (Replaces Alert)
  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const closeStatusModal = () => {
    setStatusModal(prev => ({ ...prev, visible: false }));
  };



  // Load user ID and level
  useEffect(() => {
    const loadUserData = async () => {
      // Changed to use internalUserId from Sync
      const id = await storage.getItem('internalUserId');
      const level = await storage.getItem('userLevel');
      setUserId(id);
      setUserLevel(level ? parseInt(level) : 1);
    };
    loadUserData();
  }, []);

  // Load Streak (omitted unchanged parts for brevity if handled by diff, but need context)
  // ... (keeping existing streak logic ideally, but since I'm replacing a huge chunk, let's just make sure I don't delete it. 
  // Wait, I should target specific lines or be careful. The `replace_file_content` replaces a contiguous block. 
  // I need to be careful not to delete the streak logic if it's in between.)

  // Actually, let's just use `multi_replace_file_content` if I need to touch multiple places, 
  // but here I need to inject state near top and replace handleSave/handleComplete logic.
  // The state injection is at lines 65-68.
  // The handleSave/handleComplete logic is further down.

  // Let's do this in steps via `multi_replace_file_content` instead of one big replace.
  // It's safer.



  // Load Streak
  useEffect(() => {
    const loadStreak = async () => {
      if (!userId) return;
      const storedStreak = await storage.getItem(`streak_${userId}`);
      const lastDate = await storage.getItem(`last_streak_date_${userId}`);

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (lastDate === today) {
        setStreak(parseInt(storedStreak || '0'));
      } else if (lastDate === yesterday) {
        setStreak(parseInt(storedStreak || '0'));
      } else {
        // Streak broken
        setStreak(0);
        await storage.setItem(`streak_${userId}`, 0);
      }
    };
    loadStreak();
  }, [userId]);

  // Update Streak when daily missions completed
  useEffect(() => {
    const updateStreak = async () => {
      if (!userId || missions.length === 0) return;

      const dailyMissions = missions.filter(m => m.type === 'daily');
      if (dailyMissions.length === 0) return;

      const isAllComplete = dailyMissions.every(m => m.user_status?.mission_status === 'completed');

      if (isAllComplete) {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = await storage.getItem(`last_streak_date_${userId}`);

        if (lastDate !== today) {
          const currentStreak = await storage.getItem(`streak_${userId}`);
          const newStreak = (parseInt(currentStreak || '0') || 0) + 1;

          await storage.setItem(`streak_${userId}`, newStreak);
          await storage.setItem(`last_streak_date_${userId}`, today);
          setStreak(newStreak);
        }
      }
    };
    updateStreak();
  }, [missions, userId]);

  // Fetch missions
  const fetchMissions = useCallback(async () => {
    // Sync ID if needed (although profile likely syncs it first, safe to check)
    let internalId = await storage.getItem('internalUserId');
    if (!internalId) {
      // If no internal ID, wait or fallback (profile should handle sync)
      // But assuming profile handles it, we can just check storage.
      // However, to be robust, let's just use what we have (userId state).
      // Actually, useEffect at line 90 sets userId from storage.
      // We should ensure that useEffect gets the RIGHT storage key.
    }

    // NOTE: The initial useEffect loads 'userId'. We must ensure it loads 'internalUserId'.
    const idToUse = await storage.getItem('internalUserId') || userId;

    if (!idToUse) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserMissions(idToUse);

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
          setStatusModal({
            visible: true,
            type: 'success',
            title: 'Mission Complete!',
            message: `You earned +${rewards?.exp || 0} XP and +${rewards?.points || 0} Gems!`,
          });
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
      setStatusModal({
        visible: true,
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update mission progress. Please try again.',
      });
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
        setStatusModal({
          visible: true,
          type: 'success',
          title: 'Mission Complete!',
          message: `You earned +${rewards?.exp || 0} XP and +${rewards?.points || 0} Gems!`,
        });
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
          setStatusModal({
            visible: true,
            type: 'success',
            title: 'Mission Complete!',
            message: `You earned +${rewards?.exp || 0} XP and +${rewards?.points || 0} Gems!`,
          });
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
    streak, // Export streak
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
    statusModal,
    closeStatusModal,
  };
};

export type IuseMissionPage = ReturnType<typeof useMissionPage>;

