import { MetricType, StatCard } from '@/app/interface/infinityhealth.interface';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChartSectionProps {
    selectedTab: MetricType
    chartData: { date: string; value: number }[]
    maxValue: number
    statCards: StatCard[]
}

const ChartSection: React.FC<ChartSectionProps> = (props) => {
    return (
        <View
            style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 20,
                marginHorizontal: 20,
                borderWidth: 1,
                borderColor: '#F3F4F6',
                shadowColor: '#000',



                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            {/* Chart Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <View>
                    <Text style={{ fontSize: 14, color: '#6B7280' }}>{props.selectedTab}</Text>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginTop: 4 }}>
                        {props.statCards.find(c => c.id === props.selectedTab)?.value} {props.selectedTab === 'Weight' ? 'kg' : props.statCards.find(c => c.id === props.selectedTab)?.unit}
                    </Text>
                </View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#FEE2E2',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12
                }}>
                    <Ionicons name="arrow-down" size={12} color="#EF4444" />
                    <Text style={{ fontSize: 12, color: '#EF4444', marginLeft: 2 }}>0.8</Text>
                </View>
            </View>

            {/* Chart */}
            <View style={{ height: 150, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                {/* Y-axis labels */}
                <View style={{ position: 'absolute', left: 0, top: 0, bottom: 20, justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 10, color: '#9CA3AF' }}>80</Text>
                    <Text style={{ fontSize: 10, color: '#9CA3AF' }}>60</Text>
                    <Text style={{ fontSize: 10, color: '#9CA3AF' }}>40</Text>
                    <Text style={{ fontSize: 10, color: '#9CA3AF' }}>20</Text>
                </View>

                {/* Bars */}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', marginLeft: 30 }}>
                    {props.chartData.map((item, index) => {
                        const barHeight = (item.value / props.maxValue) * 100;
                        const isHighlighted = index === 1 || index === 5;
                        return (
                            <View key={index} style={{ alignItems: 'center' }}>
                                <View
                                    style={{
                                        width: 20,
                                        height: barHeight,
                                        backgroundColor: isHighlighted
                                            ? (index === 1 ? '#86EFAC' : '#93C5FD')
                                            : '#E5E7EB',
                                        borderRadius: 4,
                                        marginBottom: 8,
                                    }}
                                />
                                <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{item.date}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ChartSection;