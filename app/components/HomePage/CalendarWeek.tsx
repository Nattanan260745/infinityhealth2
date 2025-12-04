import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { CalendarDay } from '@/src/types';

interface CalendarWeekProps {
  days: CalendarDay[];
  selectedDate: number;
  onSelectDate: (date: number) => void;
}

export function CalendarWeek({ days, selectedDate, onSelectDate }: CalendarWeekProps) {
  return (
    <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
        Calendar
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'red' }}>
        {days.map((item) => {
          const isSelected = selectedDate === item.date;
          return (
            <TouchableOpacity
              key={item.date}
              onPress={() => onSelectDate(item.date)}
              style={{
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 10,
                borderRadius: 12,
                minWidth: 42,
                backgroundColor: isSelected ? '#374151' : '#FFFFFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isSelected ? 0 : 0.05,
                shadowRadius: 2,
                elevation: isSelected ? 0 : 1,

              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: '#9CA3AF',
                }}
              >
                {item.day}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginTop: 4,
                  color: isSelected ? '#FFFFFF' : '#1F2937',
                }}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
