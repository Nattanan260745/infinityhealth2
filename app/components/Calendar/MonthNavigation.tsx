import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MONTHS } from '@/app/hook/useCalendar';

interface MonthNavigationProps {
    month: number;
    year: number;
    onPrevious: () => void;
    onNext: () => void;
    onOpenPicker: () => void;
}

export const MonthNavigation: React.FC<MonthNavigationProps> = ({
    month,
    year,
    onPrevious,
    onNext,
    onOpenPicker,
}) => {
    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginBottom: 20,
        }}>
            <TouchableOpacity
                onPress={onPrevious}
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
                onPress={onOpenPicker}
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
                onPress={onNext}
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
    );
};

