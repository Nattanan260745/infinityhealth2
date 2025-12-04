import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface Task {
  id: number;
  title: string;
  time?: string;
  completed: boolean;
  category: 'routine' | 'goal';
}

// Tasks organized by date (key format: 'YYYY-MM-DD')
const tasksByDate: Record<string, Task[]> = {
  // December 2025
  '2025-12-01': [
    { id: 1, title: 'Morning Meditation', time: '6.00 AM', completed: true, category: 'routine' },
    { id: 2, title: 'Team Meeting', time: '10.00 AM', completed: true, category: 'routine' },
    { id: 3, title: 'Drink 8 glasses of water', completed: false, category: 'goal' },
  ],
  '2025-12-02': [
    { id: 4, title: 'Yoga Class', time: '7.00 AM', completed: true, category: 'routine' },
    { id: 5, title: 'Read 20 pages', completed: false, category: 'goal' },
  ],
  '2025-12-04': [
    { id: 6, title: 'Go Shopping', time: '2.00 PM', completed: true, category: 'routine' },
    { id: 7, title: 'Clean up', time: '4.00 PM', completed: false, category: 'routine' },
    { id: 8, title: 'Exercise for 30 minutes', completed: true, category: 'goal' },
    { id: 9, title: 'No Sugar', completed: false, category: 'goal' },
  ],
  '2025-12-06': [
    { id: 10, title: 'Dentist Appointment', time: '9.00 AM', completed: false, category: 'routine' },
    { id: 11, title: 'Read 30 pages', completed: false, category: 'goal' },
  ],
  '2025-12-08': [
    { id: 12, title: 'Gym Session', time: '6.00 AM', completed: true, category: 'routine' },
    { id: 13, title: 'Walk 10,000 steps', completed: true, category: 'goal' },
  ],
  '2025-12-10': [
    { id: 14, title: 'Project Deadline', time: '5.00 PM', completed: false, category: 'routine' },
    { id: 15, title: 'Finish report', completed: false, category: 'goal' },
  ],
  '2025-12-15': [
    { id: 16, title: 'Birthday Party', time: '6.00 PM', completed: false, category: 'routine' },
    { id: 17, title: 'Call parents', completed: true, category: 'goal' },
  ],
  '2025-12-20': [
    { id: 18, title: 'Christmas Shopping', time: '10.00 AM', completed: false, category: 'routine' },
    { id: 19, title: 'Wrap gifts', completed: false, category: 'goal' },
  ],
  '2025-12-25': [
    { id: 20, title: 'Christmas Celebration', time: '12.00 PM', completed: false, category: 'routine' },
    { id: 21, title: 'Family dinner', time: '7.00 PM', completed: false, category: 'routine' },
  ],
  '2025-12-31': [
    { id: 22, title: 'New Year Eve Party', time: '8.00 PM', completed: false, category: 'routine' },
    { id: 23, title: 'Set 2026 goals', completed: false, category: 'goal' },
  ],
};

export default function CalendarScreen() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [tasks, setTasks] = useState(tasksByDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get all days of the current month
  const monthDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const days = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: DAYS[date.getDay()],
        date: i,
        hasTask: !!tasks[dateKey],
      });
    }
    return days;
  }, [year, month, tasks]);

  // Get date key for current selection
  const getDateKey = (d: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  // Get tasks for selected date
  const selectedDateTasks = tasks[getDateKey(selectedDay)] || [];
  const routineTasks = selectedDateTasks.filter(t => t.category === 'routine');
  const goalTasks = selectedDateTasks.filter(t => t.category === 'goal');

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  const selectMonth = (monthIndex: number) => {
    setCurrentDate(new Date(year, monthIndex, 1));
    setSelectedDay(1);
    setShowMonthPicker(false);
  };

  const goToPreviousYear = () => {
    setCurrentDate(new Date(year - 1, month, 1));
  };

  const goToNextYear = () => {
    setCurrentDate(new Date(year + 1, month, 1));
  };

  const isToday = (date: number) => {
    return (
      date === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const toggleTask = (taskId: number) => {
    const dateKey = getDateKey(selectedDay);
    setTasks(prev => ({
      ...prev,
      [dateKey]: prev[dateKey]?.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ) || [],
    }));
  };

  const renderTaskGroup = (title: string, taskList: Task[]) => {
    if (taskList.length === 0) return null;
    return (
      <View style={{ marginBottom: 24, }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: '#374151',
          marginBottom: 12,
          marginLeft: 4,
        }}>
          {title}
        </Text>
        {taskList.map((task) => (
          <TouchableOpacity
            key={task.id}
            onPress={() => toggleTask(task.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              paddingVertical: 18,
              borderRadius: 16,
              marginBottom: 12,
              backgroundColor: task.completed ? '#ECFDF5' : '#F9FAFB',
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                borderWidth: task.completed ? 0 : 2,
                borderColor: '#D1D5DB',
                backgroundColor: task.completed ? '#10B981' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              {task.completed && (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: task.completed ? '#059669' : '#374151',
                }}
              >
                {task.title}
              </Text>
              {task.time && (
                <Text
                  style={{
                    fontSize: 13,
                    color: task.completed ? '#34D399' : '#9CA3AF',
                    marginTop: 4,
                  }}
                >
                  {task.time}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'red' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'web' ? 40 : 60,
          paddingBottom: 30,
          flexGrow: 1,
        }}
      >
        {/* Header */}
        <Text style={{ 
          fontSize: 28, 
          fontWeight: 'bold', 
          color: '#1F2937', 
          textAlign: 'center',
          marginBottom: 24,
          fontStyle: 'italic',
        }}>
          Calendar
        </Text>

        {/* Month Navigation */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingHorizontal: 20,
          marginBottom: 20,
        }}>
          <TouchableOpacity
            onPress={goToPreviousMonth}
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 20, 
              backgroundColor: '#F3F4F6', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowMonthPicker(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: '#F3F4F6',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>
              {MONTHS[month]} {year}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#6B7280" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToNextMonth}
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 20, 
              backgroundColor: '#F3F4F6', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Scrollable Days */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'flex-start' }}
          style={{ marginBottom: 24, maxHeight: 80 }}
        >
          {monthDays.map((item) => {
            const selected = selectedDay === item.date;
            const isTodayDate = isToday(item.date);
            return (
              <TouchableOpacity
                key={item.date}
                onPress={() => setSelectedDay(item.date)}
                style={{
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  minWidth: 50,
                  height: 70,
                  marginRight: 8,
                  backgroundColor: selected ? '#10B981' : isTodayDate ? '#374151' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: selected || isTodayDate ? '#FFFFFF' : '#9CA3AF',
                    marginBottom: 4,
                  }}
                >
                  {item.day}
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: selected || isTodayDate ? '#FFFFFF' : '#1F2937',
                  }}
                >
                  {item.date}
                </Text>
                {/* Task indicator dot - always show space for it */}
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: item.hasTask 
                    ? (selected || isTodayDate ? '#FFFFFF' : '#10B981') 
                    : 'transparent',
                  marginTop: 4,
                }} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Date Info */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: '#6B7280' }}>
            {MONTHS[month]} {selectedDay}, {year}
          </Text>
        </View>

        {/* Tasks or Empty State */}
        {selectedDateTasks.length > 0 ? (
          <View style={{ paddingHorizontal: 20 }}>
            {renderTaskGroup('Routine', routineTasks)}
            {renderTaskGroup('Goal', goalTasks)}
          </View>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              No activities yet
            </Text>
            <Text style={{ fontSize: 14, color: '#D1D5DB' }}>
              Let's create your activities
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 20,
              width: '85%',
              maxWidth: 360,
            }}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              <TouchableOpacity onPress={goToPreviousYear}>
                <Ionicons name="chevron-back" size={24} color="#374151" />
              </TouchableOpacity>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>
                {year}
              </Text>
              <TouchableOpacity onPress={goToNextYear}>
                <Ionicons name="chevron-forward" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {MONTHS.map((monthName, index) => {
                const isCurrentMonth = index === month;
                const isTodayMonth = index === today.getMonth() && year === today.getFullYear();
                return (
                  <TouchableOpacity
                    key={monthName}
                    onPress={() => selectMonth(index)}
                    style={{
                      width: '33.33%',
                      paddingVertical: 12,
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 12,
                        backgroundColor: isCurrentMonth ? '#10B981' : isTodayMonth ? '#F3F4F6' : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: isCurrentMonth ? '600' : '400',
                          color: isCurrentMonth ? '#FFFFFF' : '#374151',
                        }}
                      >
                        {monthName.slice(0, 3)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setShowMonthPicker(false)}
              style={{
                marginTop: 16,
                paddingVertical: 12,
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
