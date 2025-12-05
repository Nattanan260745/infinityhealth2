import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { CalendarDay } from '@/src/types';

interface CalendarWeekProps {
  days: CalendarDay[];
  selectedDate: number;
  onSelectDate: (date: number) => void;
}

export function CalendarWeek({ days, selectedDate, onSelectDate }: CalendarWeekProps) {
  return (
    <View style={{ marginTop: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16, paddingHorizontal: 20 }}>
        Calendar
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {days.map((item, index) => {
          const isSelected = selectedDate === item.date;
          return (
            <TouchableOpacity
              key={item.date}
              onPress={() => onSelectDate(item.date)}
              style={{
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 12,
                minWidth: 48,
                marginRight: index < days.length - 1 ? 10 : 0,
                backgroundColor: isSelected ? '#7DD1E0' : '#F1F3F5',
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
                  color: isSelected ? '#FFFFFF' : '#9CA3AF',
                }}
              >
                {item.day}
              </Text>
              <Text
                style={{
                  fontSize: 18,
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
      </ScrollView>
    </View>
  );
}
