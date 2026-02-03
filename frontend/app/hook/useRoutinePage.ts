import { useState, useEffect, useCallback, useMemo } from "react";
import storage from "../utils/storage";
import {
  getUserRoutinesByDate,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  completeRoutine,
  getUserGoalsByDate,
  createGoal,
  updateGoal,
  deleteGoal,
  getUserRoutines,
  getUserGoals
} from "../service/InfinityhealthApi";
import { useFocusEffect } from 'expo-router';

// Types
export type TabType = 'routines' | 'goals';
export type ViewMode = 'list' | 'calendar';

export interface RoutineItem {
  id: number;
  title: string;
  time: string; // Display time (e.g. 10:00)
  date: string; // YYYY-MM-DD
  completed: boolean;
  notifications: boolean;
  scheduledDate?: string; // ISO string from backend
  scheduledTime?: string; // string from backend
}

// Theme Colors
export const routineColors = {
  // Primary
  primary: '#7DD1E0',
  primaryLight: '#E0F7FA',

  // Background
  background: '#FFFFFF',
  backgroundSecondary: '#F3F4F6',
  backgroundHero: '#FEF3C7',

  // Text
  textPrimary: '#1F2937',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  textPlaceholder: '#9CA3AF',

  // Border
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Status - Completed
  completedBg: '#F0FDF4',
  completedBorder: '#D1FAE5',
  completedText: '#059669',
  completedIcon: '#10B981',

  // Status - Pending
  pendingBorder: '#EF4444',

  // Danger
  danger: '#EF4444',
  dangerBg: '#FEE2E2',

  // Switch
  switchTrackOff: '#E5E7EB',
};

export const useRoutinePage = () => {
  // Tab state
  const [selectedTab, setSelectedTab] = useState<TabType>('routines');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Data state
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [goals, setGoals] = useState<RoutineItem[]>([]);
  const [allRoutines, setAllRoutines] = useState<any[]>([]);
  const [allGoals, setAllGoals] = useState<any[]>([]);

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineItem | null>(null);
  const [deletingRoutine, setDeletingRoutine] = useState<RoutineItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]); // Default to today YYYY-MM-DD
  const [formTime, setFormTime] = useState('');
  const [formNotifications, setFormNotifications] = useState(true);

  // Computed values
  const currentList = selectedTab === 'routines' ? routines : goals;
  const isGoalsTab = selectedTab === 'goals';

  // Load User ID
  useEffect(() => {
    const loadUser = async () => {
      const id = await storage.getItem('userId');
      setUserId(id);
    };
    loadUser();
  }, []);

  // Fetch Data
  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Fetch ALL data once (bypass broken /date endpoints which return 500)
      const [routineRes, goalRes] = await Promise.all([
        getUserRoutines(userId),
        getUserGoals(userId)
      ]);

      if (routineRes.success && Array.isArray(routineRes.data)) {
        // Set All for Calendar
        setAllRoutines(routineRes.data);

        // Filter for specific date
        const dayRoutines = routineRes.data.filter((r: any) => {
          if (!r.scheduledDate) return false;
          // Handle potentially different date formats if needed, but assuming ISO
          const rDate = new Date(r.scheduledDate).toISOString().split('T')[0];
          return rDate === formDate;
        });

        const mappedRoutines = dayRoutines.map((r: any) => ({
          id: r.id,
          title: r.title,
          time: r.scheduledTime,
          date: new Date(r.scheduledDate).toISOString().split('T')[0],
          completed: r.completed,
          notifications: true,
          scheduledDate: r.scheduledDate,
          scheduledTime: r.scheduledTime
        }));
        setRoutines(mappedRoutines);
      } else {
        setRoutines([]);
        setAllRoutines([]);
      }

      if (goalRes.success && Array.isArray(goalRes.data)) {
        // Set All for Calendar
        setAllGoals(goalRes.data);

        // Filter for specific date
        const dayGoals = goalRes.data.filter((g: any) => {
          if (!g.goalDate) return false;
          const gDate = new Date(g.goalDate).toISOString().split('T')[0];
          return gDate === formDate;
        });

        const mappedGoals = dayGoals.map((g: any) => ({
          id: g.id,
          title: g.title,
          time: '',
          date: new Date(g.goalDate).toISOString().split('T')[0],
          completed: g.completed,
          notifications: false,
          scheduledDate: g.goalDate
        }));
        setGoals(mappedGoals);
      } else {
        setGoals([]);
        setAllGoals([]);
      }

    } catch (e) {
      console.error("Fetch routine error", e);
    } finally {
      setLoading(false);
    }
  }, [userId, formDate]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Compute Marked Dates for Calendar
  const markedDates = useMemo(() => {
    const marks: any = {};
    const list = isGoalsTab ? allGoals : allRoutines;
    const dateField = isGoalsTab ? 'goalDate' : 'scheduledDate';

    list.forEach((item: any) => {
      if (!item[dateField]) return;
      const date = new Date(item[dateField]).toISOString().split('T')[0];

      if (!marks[date]) {
        marks[date] = { dots: [] };
      }
      if (marks[date].dots.length < 3) {
        const color = item.completed ? routineColors.completedIcon : routineColors.danger;
        // Only add dot if not already there (optional, but keep simple)
        marks[date].dots.push({ key: item.id, color: color });
      }
    });

    // Selected
    marks[formDate] = {
      ...marks[formDate] || {},
      selected: true,
      selectedColor: routineColors.primary
    };

    return marks;
  }, [allRoutines, allGoals, isGoalsTab, formDate]);

  // Handlers
  const handleAddPress = () => {
    setEditingRoutine(null);
    setFormTitle('');
    // Keep formDate as current view date
    setFormTime('');
    setFormNotifications(true);
    setShowAddModal(true);
  };

  const handleDayPress = (day: any) => {
    setFormDate(day.dateString);
  };

  const handleEditPress = (routine: RoutineItem) => {
    setEditingRoutine(routine);
    setFormTitle(routine.title);
    setFormDate(routine.date);
    setFormTime(routine.time);
    setFormNotifications(routine.notifications);
    setShowAddModal(true);
  };

  const handleDeletePress = (routine: RoutineItem) => {
    setDeletingRoutine(routine);
    setShowDeleteModal(true);
  };

  // Error state
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!formTitle.trim() || !userId) return;
    setError(null);

    // Validate Time for Routines (Not Goals)
    if (!isGoalsTab && !formTime) {
      setError("Please select a time for your routine.");
      return;
    }

    try {
      if (isGoalsTab) {
        if (editingRoutine) {
          await updateGoal(editingRoutine.id, {
            title: formTitle,
            goal_date: new Date(formDate).toISOString(),
            completed: editingRoutine.completed
          });
        } else {
          await createGoal({
            user_id: userId,
            title: formTitle,
            goal_date: new Date(formDate).toISOString()
          });
        }
      } else {
        if (editingRoutine) {
          await updateRoutine(editingRoutine.id, {
            title: formTitle,
            scheduled_time: formTime,
            scheduled_date: new Date(formDate).toISOString(),
            completed: editingRoutine.completed
          });
        } else {
          await createRoutine({
            user_id: userId,
            title: formTitle,
            scheduled_time: formTime, // Ensure we use the selected time
            scheduled_date: new Date(formDate).toISOString()
          });
        }
      }
      setShowAddModal(false);
      fetchData(); // Refresh
    } catch (error) {
      console.error("Save item error", error);
    }
  };

  const handleDelete = async () => {
    if (deletingRoutine && userId) {
      try {
        if (isGoalsTab) {
          await deleteGoal(deletingRoutine.id);
        } else {
          await deleteRoutine(deletingRoutine.id);
        }
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
    setShowDeleteModal(false);
    setDeletingRoutine(null);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const toggleComplete = async (id: number) => {
    if (isGoalsTab) {
      setGoals(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    } else {
      setRoutines(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    }

    try {
      const list = isGoalsTab ? goals : routines;
      const item = list.find(i => i.id === id);
      if (item) {
        if (isGoalsTab) {
          await updateGoal(id, { completed: !item.completed });
        } else {
          await updateRoutine(id, { completed: !item.completed });
        }
      }
      // Re-fetch to update calendar marks
      fetchData();
    } catch (e) {
      console.error("Toggle complete error", e);
      fetchData(); // Revert
    }
  };

  // Modal titles
  const getModalTitle = () => {
    if (editingRoutine) {
      return isGoalsTab ? 'Edit Goal' : 'Edit Daily Routine';
    }
    return isGoalsTab ? 'Add Goal' : 'Add Routines';
  };

  const getFormLabel = () => isGoalsTab ? 'Goal' : 'To-do List';
  const getFormPlaceholder = () => isGoalsTab ? 'Read a book for 1 hours' : 'Value';
  const getAddButtonText = () => `Add ${isGoalsTab ? 'Goal' : 'Routine'}`;
  const getDeleteMessage = () => `This action cannot be undone. The ${isGoalsTab ? 'goal' : 'routine'} will be permanently deleted.`;

  return {
    colors: routineColors,
    selectedTab,
    setSelectedTab,
    viewMode,
    setViewMode,
    isGoalsTab,
    currentList,
    markedDates,
    handleDayPress,
    showAddModal,
    showDeleteModal,
    editingRoutine,
    formTitle,
    setFormTitle,
    formDate,
    setFormDate,
    formTime,
    setFormTime,
    formNotifications,
    setFormNotifications,
    handleAddPress,
    handleEditPress,
    handleDeletePress,
    handleSave,
    handleDelete,
    handleCloseAddModal,
    handleCloseDeleteModal,
    toggleComplete,
    error, // Export error state
    getModalTitle,
    getFormLabel,
    getFormPlaceholder,
    getAddButtonText,
    getDeleteMessage,
  };
};
