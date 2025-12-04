import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatusIconProps {
  status: 'pending' | 'completed' | 'cancelled';
}

export function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case 'completed':
      return (
        <View style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: '#10B981',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      );
    case 'cancelled':
      return (
        <View style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: '#F87171',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons name="close" size={16} color="white" />
        </View>
      );
    default:
      return (
        <View style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#D1D5DB',
          backgroundColor: '#FFFFFF',
        }} />
      );
  }
}
