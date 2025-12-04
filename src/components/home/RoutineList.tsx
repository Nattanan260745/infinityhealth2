import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StatusIcon } from '../ui/StatusIcon';
import type { Routine } from '@/src/types';

interface RoutineListProps {
  routines: Routine[];
}

export function RoutineList({ routines }: RoutineListProps) {
  const getRoutineStyle = (status: Routine['status']) => {
    switch (status) {
      case 'completed':
        return {
          backgroundColor: '#ECFDF5',
          borderColor: '#D1FAE5',
        };
      case 'cancelled':
        return {
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
        };
      default:
        return {
          backgroundColor: '#FFFFFF',
          borderColor: '#F3F4F6',
        };
    }
  };

  const getTextColor = (status: Routine['status']) => {
    switch (status) {
      case 'completed':
        return '#059669';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#1F2937';
    }
  };

  const getTimeColor = (status: Routine['status']) => {
    switch (status) {
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
        const style = getRoutineStyle(routine.status);
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
            <StatusIcon status={routine.status} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: getTextColor(routine.status),
                  textDecorationLine: routine.status === 'completed' ? 'line-through' : 'none',
                }}
              >
                {routine.title}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  marginTop: 2,
                  color: getTimeColor(routine.status),
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
