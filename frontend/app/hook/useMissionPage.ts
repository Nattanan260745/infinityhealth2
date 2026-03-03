import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import storage from '../utils/storage';
import {
  getUserMissions,
  completeMission,
  updateMissionProgress,
  getUserProfile
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
  presets?: any[];
}

export const useMissionPage = () => {
  const [selectedTab, setSelectedTab] = useState<TabType>('daily');
  const [missions, setMissions] = useState<MissionWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userXP, setUserXP] = useState<number>(0);
  const [userGems, setUserGems] = useState<number>(0);

  const [userDailyXP, setUserDailyXP] = useState<number>(0); // Added
  const [userDailyGems, setUserDailyGems] = useState<number>(0); // Added
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
      if (id) {
        setUserId(id);
      }
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
  const fetchMissions = useCallback(async (silent = false) => {
    // Sync ID if needed (although profile likely syncs it first, safe to check)
    let internalId = await storage.getItem('internalUserId');
    if (!internalId) {
      // If no internal ID, wait or fallback (profile should handle sync)
    }

    // Use internalUserId from storage with fallback to local state
    let idToUse = await storage.getItem('internalUserId') || userId;

    if (!idToUse) {
      setIsLoading(false);
      return;
    }

    if (!silent) setIsLoading(true);
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

    // Fetch User Profile for latest Stats
    if (idToUse) {
      try {
        const profileRes = await getUserProfile(idToUse);
        if (profileRes.success && profileRes.data) {
          setUserXP(profileRes.data.exp || 0);
          setUserGems(profileRes.data.points || 0);
          setUserDailyXP(profileRes.data.dailyExp || 0); // Added
          setUserDailyGems(profileRes.data.dailyPoints || 0); // Added
          // Also update level if changed
          if (profileRes.data.level_id) setUserLevel(profileRes.data.level_id);
        }
      } catch (e) {
        console.error('Failed to fetch profile stats', e);
      }
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

    // Lock Logic:
    // 1. Challenge visible ONLY for current level (Handled in filter).
    // 2. Locked if User XP is not full.
    // XP Cap for level L is L * 1000.
    // So if userLevel == X, they need X * 1000 XP to unlock the challenge.
    const xpRequired = userLevel * 1000;

    // Only apply lock logic to Challenge missions
    const isLocked = mission.type === 'challenge' && userXP < xpRequired;

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
      presets: mission.presets,
    };
  };

  // Filter missions by selected tab
  const filteredMissions = missions
    .filter(m => {
      // 1. Basic Type Filter
      if (m.type !== selectedTab) return false;

      // 2. Challenge specific filter: Show ONLY current level's challenge
      if (selectedTab === 'challenge') {
        const minLevel = m.min_level || 1;
        return minLevel === userLevel;
      }

      return true;
    })
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
  // Stats (Using Daily Stats for Display based on user request)
  const totalXP = userDailyXP;
  const totalGems = userDailyGems;

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
      await fetchMissions(true);
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
        await fetchMissions(true);
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
      await fetchMissions(true);
    } catch (err) {
      console.error('Quick update error:', err);
      // Revert optimistic update if needed or just re-fetch
      await fetchMissions(true);
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

