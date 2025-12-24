import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MONTHS } from '@/app/hook/useCalendar';

interface MonthPickerModalProps {
    visible: boolean;
    year: number;
    month: number;
    todayMonth: number;
    todayYear: number;
    onClose: () => void;
    onSelectMonth: (monthIndex: number) => void;
    onPreviousYear: () => void;
    onNextYear: () => void;
}

export const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
    visible,
    year,
    month,
    todayMonth,
    todayYear,
    onClose,
    onSelectMonth,
    onPreviousYear,
    onNextYear,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                activeOpacity={1}
                onPress={onClose}
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
                        <TouchableOpacity onPress={onPreviousYear}>
                            <Ionicons name="chevron-back" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>
                            {year}
                        </Text>
                        <TouchableOpacity onPress={onNextYear}>
                            <Ionicons name="chevron-forward" size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {MONTHS.map((monthName, index) => {
                            const isCurrentMonth = index === month;
                            const isTodayMonth = index === todayMonth && year === todayYear;
                            return (
                                <TouchableOpacity
                                    key={monthName}
                                    onPress={() => onSelectMonth(index)}
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
                        onPress={onClose}
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
    );
};

