import { useState } from "react";

// Types
export type TabType = 'routines' | 'goals';

export interface RoutineItem {
  id: number;
  title: string;
  time: string;
  date: string;
  completed: boolean;
  notifications: boolean;
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
  pendingBorder: '#D1D5DB',
  
  // Danger
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  
  // Switch
  switchTrackOff: '#E5E7EB',
};

// Initial Data
const initialRoutines: RoutineItem[] = [
  { id: 1, title: 'Clean up', time: '12.00 AM', date: '2024-01-15', completed: true, notifications: true },
  { id: 2, title: 'Meeting', time: '1.00 PM', date: '2024-01-15', completed: true, notifications: true },
  { id: 3, title: 'Clean up', time: '2.00 PM', date: '2024-01-15', completed: false, notifications: false },
  { id: 4, title: 'Go Sleep', time: '10.00 PM', date: '2024-01-15', completed: false, notifications: true },
];

const initialGoals: RoutineItem[] = [
  { id: 5, title: 'Exercise for 30 minutes', time: '', date: '20/10/2568', completed: true, notifications: false },
  { id: 6, title: 'Eat healthy food', time: '', date: '20/10/2568', completed: true, notifications: false },
  { id: 7, title: 'No sugar', time: '', date: '20/10/2568', completed: false, notifications: false },
];

export const useRoutinePage = () => {
  // Tab state
  const [selectedTab, setSelectedTab] = useState<TabType>('routines');
  
  // Data state
  const [routines, setRoutines] = useState<RoutineItem[]>(initialRoutines);
  const [goals, setGoals] = useState<RoutineItem[]>(initialGoals);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineItem | null>(null);
  const [deletingRoutine, setDeletingRoutine] = useState<RoutineItem | null>(null);
  
  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formNotifications, setFormNotifications] = useState(true);

  // Computed values
  const currentList = selectedTab === 'routines' ? routines : goals;
  const setCurrentList = selectedTab === 'routines' ? setRoutines : setGoals;
  const isGoalsTab = selectedTab === 'goals';

  // Handlers
  const handleAddPress = () => {
    setEditingRoutine(null);
    setFormTitle('');
    setFormDate('');
    setFormTime('');
    setFormNotifications(true);
    setShowAddModal(true);
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

  const handleSave = () => {
    if (!formTitle.trim()) return;

    if (editingRoutine) {
      setCurrentList(currentList.map(r => 
        r.id === editingRoutine.id 
          ? { ...r, title: formTitle, date: formDate, time: formTime, notifications: formNotifications }
          : r
      ));
    } else {
      const newRoutine: RoutineItem = {
        id: Date.now(),
        title: formTitle,
        date: formDate || 'DD/MM/YYYY',
        time: formTime || '--:--',
        completed: false,
        notifications: formNotifications,
      };
      setCurrentList([...currentList, newRoutine]);
    }
    setShowAddModal(false);
  };

  const handleDelete = () => {
    if (deletingRoutine) {
      setCurrentList(currentList.filter(r => r.id !== deletingRoutine.id));
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

  const toggleComplete = (id: number) => {
    setCurrentList(currentList.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
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
    // Colors
    colors: routineColors,
    
    // Tab
    selectedTab,
    setSelectedTab,
    isGoalsTab,
    
    // Data
    currentList,
    
    // Modals
    showAddModal,
    showDeleteModal,
    editingRoutine,
    
    // Form
    formTitle,
    setFormTitle,
    formDate,
    setFormDate,
    formTime,
    setFormTime,
    formNotifications,
    setFormNotifications,
    
    // Handlers
    handleAddPress,
    handleEditPress,
    handleDeletePress,
    handleSave,
    handleDelete,
    handleCloseAddModal,
    handleCloseDeleteModal,
    toggleComplete,
    
    // Text helpers
    getModalTitle,
    getFormLabel,
    getFormPlaceholder,
    getAddButtonText,
    getDeleteMessage,
  };
};
