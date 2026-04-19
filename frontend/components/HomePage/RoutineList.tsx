import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StatusIcon } from './StatusIcon';
import type { Routine } from '@/src/types';

interface RoutineListProps {
  routines: Routine[];
}

export function RoutineList({ routines }: RoutineListProps) {
  if (!routines || routines.length === 0) {
    return (
      <View style={{ marginTop: 24, paddingHorizontal: 20, paddingBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
          Upcoming Routines
        </Text>
        <View style={{
          padding: 24,
          backgroundColor: '#F9FAFB',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{ color: '#6B7280', fontSize: 14 }}>No Upcoming Routines</Text>
        </View>
      </View>
    );
  }

  const isOverdue = (routine: Routine) => {
    if (routine.status === 'completed' || routine.status === 'cancelled') return false;
    // Assuming time is "HH:MM" 24-hour format logic
    if (!routine.time || !routine.time.includes(':')) return false;

    const [hStr, mStr] = routine.time.split(':');
    const scheduledHours = parseInt(hStr, 10);
    const scheduledMinutes = parseInt(mStr, 10);

    if (isNaN(scheduledHours) || isNaN(scheduledMinutes)) return false;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    if (currentHours > scheduledHours) return true;
    if (currentHours === scheduledHours && currentMinutes > scheduledMinutes) return true;

    return false;
  };

  const getRoutineStyle = (routine: Routine) => {
    if (isOverdue(routine)) {
      return {
        backgroundColor: '#FEF2F2', // Red-50
        borderColor: '#F87171', // Red-400
      };
    }

    switch (routine.status) {
      case 'completed':
        return {
          backgroundColor: '#ECFDF5',
          borderColor: '#D1FAE5',
        };
      case 'cancelled':
        return {
          backgroundColor: '#F3F4F6', // Gray/Cancelled
          borderColor: '#E5E7EB',
        };
      default:
        return {
          backgroundColor: '#FFFFFF',
          borderColor: '#F3F4F6',
        };
    }
  };

  const getTextColor = (routine: Routine) => {
    if (isOverdue(routine)) return '#B91C1C'; // Red-700

    switch (routine.status) {
      case 'completed':
        return '#059669';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#1F2937';
    }
  };

  const getTimeColor = (routine: Routine) => {
    if (isOverdue(routine)) return '#EF4444'; // Red-500

    switch (routine.status) {
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#F87171';
      default:
        return '#9CA3AF';
    }
  };

  return (
    <View style={{ marginTop: 24, paddingHorizontal: 20, paddingBottom: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
        Upcoming Routines
      </Text>

      {routines.map((routine) => {
        const style = getRoutineStyle(routine);
        return (
          <TouchableOpacity
            key={routine.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderRadius: 16,
              marginBottom: 12,
              backgroundColor: style.backgroundColor,
              borderWidth: 1,
              borderColor: style.borderColor,
            }}
          >
            <StatusIcon status={routine.status} isOverdue={isOverdue(routine)} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: getTextColor(routine),
                  textDecorationLine: routine.status === 'completed' ? 'line-through' : 'none',
                }}
              >
                {routine.title}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  marginTop: 2,
                  color: getTimeColor(routine),
                }}
              >
                {routine.time}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
