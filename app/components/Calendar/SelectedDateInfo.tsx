import React from 'react';
import { View, Text } from 'react-native';
import { MONTHS } from '@/app/hook/useCalendar';

interface SelectedDateInfoProps {
    month: number;
    day: number;
    year: number;
}

export const SelectedDateInfo: React.FC<SelectedDateInfoProps> = ({ month, day, year }) => {
    return (
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
                {MONTHS[month]} {day}, {year}
            </Text>
        </View>
    );
};

