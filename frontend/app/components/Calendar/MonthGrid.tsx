import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { MonthDay, DAYS } from '@/app/hook/useCalendar';

interface MonthGridProps {
    days: MonthDay[];
    selectedDay: number;
    month: number;
    year: number;
    onSelectDay: (day: number) => void;
    isToday: (date: number) => boolean;
}

export const MonthGrid: React.FC<MonthGridProps> = ({
    days,
    selectedDay,
    month,
    year,
    onSelectDay,
    isToday,
}) => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const screenWidth = Dimensions.get('window').width;
    const paddingHorizontal = 20;
    const availableWidth = screenWidth - (paddingHorizontal * 2);
    const itemSize = availableWidth / 7;

    return (
        <View style={{ paddingHorizontal: paddingHorizontal, marginBottom: 24 }}>
            {/* Days Header */}
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {DAYS.map((day, index) => (
                    <View key={index} style={{ width: itemSize, alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#9CA3AF', fontWeight: '500' }}>
                            {day}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {/* Empty slots for days before start of month */}
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                    <View key={`empty-${index}`} style={{ width: itemSize, height: itemSize }} />
                ))}

                {days.map((item) => {
                    const selected = selectedDay === item.date;
                    const isTodayDate = isToday(item.date);

                    return (
                        <TouchableOpacity
                            key={item.date}
                            onPress={() => onSelectDay(item.date)}
                            style={{
                                width: itemSize,
                                height: itemSize,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 8,
                            }}
                        >
                            <View style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: selected ? '#7DD1E0' : isTodayDate ? '#374151' : 'transparent',
                            }}>
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontWeight: selected || isTodayDate ? 'bold' : 'normal',
                                        color: selected || isTodayDate ? '#FFFFFF' : '#1F2937',
                                    }}
                                >
                                    {item.date}
                                </Text>
                            </View>
                            <View style={{
                                width: 4,
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: item.hasTask
                                    ? (selected || isTodayDate ? 'transparent' : '#7DD1E0') // Don't show dot if selected (optional design choice, usually dot is below date)
                                    : 'transparent',
                                position: 'absolute',
                                bottom: 4,
                            }} />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};
