import { MetricType, StatCard } from '@/app/interface/infinityhealth.interface';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChartSectionProps {
    selectedTab: MetricType
    chartData: { date: string; value: number }[]
    maxValue: number
    statCards: StatCard[]
    trendValue: number
    trendDirection: 'up' | 'down' | 'neutral'
}

const ChartSection: React.FC<ChartSectionProps> = (props) => {
    // Determine trend color and icon
    let trendColor = '#6B7280'; // Gray
    let trendBg = '#F3F4F6';
    let iconName: any = 'remove';

    if (props.trendDirection === 'up') {
        trendColor = '#059669'; // Green
        trendBg = '#D1FAE5';
        iconName = 'arrow-up';
    } else if (props.trendDirection === 'down') {
        trendColor = '#EF4444'; // Red
        trendBg = '#FEE2E2';
        iconName = 'arrow-down';
    }

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
                {props.trendDirection !== 'neutral' && (
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: trendBg,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12
                    }}>
                        <Ionicons name={iconName} size={12} color={trendColor} />
                        <Text style={{ fontSize: 12, color: trendColor, marginLeft: 2 }}>{props.trendValue}</Text>
                    </View>
                )}
            </View>

            {/* Chart */}
            <View style={{ height: 150, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                {/* Y-axis labels */}
                {/* Y-axis labels */}
                <View style={{ position: 'absolute', left: 0, top: 0, bottom: 20, justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{Math.round(props.maxValue)}</Text>
                    <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{Math.round(props.maxValue * 0.75)}</Text>
                    <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{Math.round(props.maxValue * 0.5)}</Text>
                    <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{Math.round(props.maxValue * 0.25)}</Text>
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