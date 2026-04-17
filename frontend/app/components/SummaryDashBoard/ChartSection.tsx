import { MetricType, StatCard } from '@/app/interface/infinityhealth.interface';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Circle, Text as SvgText, G, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";

interface ChartSectionProps {
    selectedTab: MetricType
    chartData: { date: string; value: number }[]
    maxValue: number
    statCards: StatCard[]
    trendValue: number
    trendDirection: 'up' | 'down' | 'neutral'
    onDataPointClick?: (data: any) => void
    selectedPointIndex?: number | null
}

const screenWidth = Dimensions.get("window").width;

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

    const labels = props.chartData.map(d => d.date);
    const rawData = props.chartData.map(d => d.value);
    const data = rawData.map(v => (typeof v === 'number' && isFinite(v)) ? v : 0);

    // Dynamic Y-Axis Segments
    const max = Math.max(...data, 0);
    const min = Math.min(...data, max);
    let segments = 4;

    if (isFinite(max) && isFinite(min)) {
        if (max - min < 5 && max - min > 0) {
            segments = Math.ceil(max - min);
        } else if (max - min === 0) {
            segments = 1;
        }
    }
    // Ensure segments is valid
    if (isNaN(segments) || segments < 1) segments = 4;

    // Filter labels
    const filteredLabels = labels.map((label, index) => {
        if (labels.length <= 4) return label; // Show all if few
        if (index === 0) return label; // First
        if (index === labels.length - 1) return label; // Last
        if (index === Math.floor(labels.length / 2)) return label; // Middle
        return '';
    });

    const chartConfig = {
        backgroundGradientFrom: "#FFFFFF",
        backgroundGradientTo: "#FFFFFF",
        color: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        decimalPlaces: (props.selectedTab === 'Weight' || props.selectedTab === 'Sleep' || props.selectedTab === 'BMI') ? 1 : 0,
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        propsForBackgroundLines: {
            strokeDasharray: "",
            stroke: "#E5E7EB"
        }
    };

    // Check if there is actual data to show (non-zero)
    const hasData = props.chartData.length > 0 && props.chartData.some(d => d.value > 0);

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
                overflow: 'hidden'
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
            <View style={{ alignItems: 'flex-start', height: 260, justifyContent: 'center', marginLeft: -15 }}>
                {hasData ? (
                    <View>
                        <LineChart
                            data={{
                                labels: labels,
                                datasets: [{ data: data }]
                            }}
                            width={screenWidth - 85}
                            height={260} // Increased height for labels
                            segments={segments} // Dynamic segments
                            chartConfig={{
                                ...chartConfig,
                                // Dynamic color based on metric type
                                color: (opacity = 1) => {
                                    if (props.selectedTab === 'Weight' || props.selectedTab === 'BMI') return `rgba(16, 185, 129, ${opacity})`; // Green
                                    if (props.selectedTab === 'Sleep') return `rgba(245, 158, 11, ${opacity})`; // Yellow
                                    if (props.selectedTab === 'Water') return `rgba(59, 130, 246, ${opacity})`; // Blue
                                    return `rgba(139, 92, 246, ${opacity})`; // Violet (Steps)
                                },
                                propsForDots: {
                                    r: "4",
                                    strokeWidth: "2",
                                }
                            }}
                            renderDotContent={({ x, y, index, indexData }) => {
                                const isSelected = index === props.selectedPointIndex;
                                const dotColor = props.selectedTab === 'Weight' || props.selectedTab === 'BMI' ? "#10B981" :
                                    props.selectedTab === 'Sleep' ? "#F59E0B" :
                                        props.selectedTab === 'Water' ? "#3B82F6" : "#8B5CF6";

                                return (
                                    <G key={index} onPress={() => props.onDataPointClick && props.onDataPointClick({ index, value: indexData })}>
                                        {/* Hitbox for full column clickability */}
                                        <Rect
                                            x={x - 20}
                                            y={10}
                                            width={40}
                                            height={240}
                                            fill="rgba(0,0,0,0.01)"
                                        />

                                        {/* The Dot */}
                                        <Circle
                                            cx={x}
                                            cy={y}
                                            r={isSelected ? 7 : 4}
                                            fill={isSelected ? dotColor : "#FFFFFF"}
                                            stroke={isSelected ? "#FFFFFF" : dotColor}
                                            strokeWidth={isSelected ? 3 : 2}
                                        />

                                        {/* The Label */}
                                        <SvgText
                                            x={x}
                                            y={240} // Positioned at bottom
                                            textAnchor="middle"
                                            fontSize="12"
                                            fontWeight={isSelected ? "bold" : "normal"}
                                            fill={isSelected ? "#374151" : "#9CA3AF"}
                                        >
                                            {props.chartData[index]?.date}
                                        </SvgText>
                                    </G>
                                );
                            }}
                            onDataPointClick={props.onDataPointClick}
                            bezier
                            style={{ borderRadius: 16 }}
                            withDots={true}
                            withInnerLines={true}
                            withOuterLines={false}
                            withVerticalLines={false}
                            withVerticalLabels={false} // Hide default labels
                            formatYLabel={(y) => {
                                try {
                                    return parseFloat(y).toFixed(props.selectedTab === 'Weight' || props.selectedTab === 'BMI' || props.selectedTab === 'Sleep' ? 1 : 0);
                                } catch (e) {
                                    return y;
                                }
                            }}
                        />
                    </View>
                ) : (
                    <View style={{ width: '100%', alignItems: 'center', paddingLeft: 15 }}>
                        <Text style={{ color: '#9CA3AF', marginBottom: 20 }}>No data available for this period</Text>
                    </View>
                )}
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