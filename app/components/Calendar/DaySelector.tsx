import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MonthDay } from '@/app/hook/useCalendar';

interface DaySelectorProps {
    days: MonthDay[];
    selectedDay: number;
    onSelectDay: (day: number) => void;
    isToday: (date: number) => boolean;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
    days,
    selectedDay,
    onSelectDay,
    isToday,
}) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'flex-start' }}
            style={{ marginBottom: 24, maxHeight: 80 }}
        >
            {days.map((item) => {
                const selected = selectedDay === item.date;
                const isTodayDate = isToday(item.date);
                return (
                    <TouchableOpacity
                        key={item.date}
                        onPress={() => onSelectDay(item.date)}
                        style={{
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderRadius: 12,
                            minWidth: 50,
                            height: 70,
                            
                            marginRight: 8,
                            backgroundColor: selected ? '#7DD1E0' : isTodayDate ? '#374151' : 'transparent',
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
                        <View style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: item.hasTask
                                ? (selected || isTodayDate ? '#FFFFFF' : '#7DD1E0')
                                : 'transparent',
                            marginTop: 4,
                        }} />
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

