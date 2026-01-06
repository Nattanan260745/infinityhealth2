import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from "react-native-chart-kit";
import { getHealthTrackRange } from './service/InfinityhealthApi'; // Fixed import path
import storage from './utils/storage';
import { MetricType, HealthTrack } from './interface/infinityhealth.interface';

const screenWidth = Dimensions.get("window").width;

export default function HealthDetail() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const metric = (params.metric as MetricType) || 'Weight';

    const [period, setPeriod] = useState<'7D' | '30D' | '90D'>('7D');
    const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
    const [history, setHistory] = useState<HealthTrack[]>([]);
    const [stats, setStats] = useState({ avg: '-', min: '-', max: '-' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [metric, period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const userId = await storage.getItem('userId');
            if (!userId) return;

            const daysMap = { '7D': 7, '30D': 30, '90D': 90 };
            const days = daysMap[period];

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - days);

            const res = await getHealthTrackRange(userId, startDate.toISOString(), endDate.toISOString());

            if (res.success && res.data) {
                const rawData = res.data;
                setHistory(rawData); // Store full raw data for list

                // Map for Chart
                const mapped = rawData.map(item => {
                    const d = new Date(item.date || (item as any).trackingDate);
                    const dateStr = !isNaN(d.getTime())
                        ? d.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' })
                        : '';

                    let val = 0;
                    switch (metric) {
                        case 'Weight': val = item.weight || 0; break;
                        case 'Height': val = item.height || 0; break;
                        case 'Water': val = item.water || 0; break;
                        case 'Sleep': val = item.sleepHours || 0; break;
                        case 'Steps': val = item.stepsCount || 0; break;
                        case 'BMI':
                            if (typeof item.weight === 'number' && typeof item.height === 'number' && item.height > 0) {
                                const bmiVal = item.weight / ((item.height / 100) ** 2);
                                val = parseFloat(bmiVal.toFixed(2));
                            } else {
                                val = 0;
                            }
                            break;
                    }
                    return { date: dateStr, value: val };
                });

                // Sort for chart (Ascending)
                // Adjust if api returns desc
                // Assuming API returns asc or we sort:
                mapped.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Rough sort if safe

                setChartData(mapped);

                // Stats
                const values = mapped.map(v => v.value).filter(v => v > 0);
                if (values.length > 0) {
                    const sum = values.reduce((a, b) => a + b, 0);
                    const avg = values.length ? sum / values.length : 0;
                    const min = Math.min(...values);
                    const max = Math.max(...values);

                    setStats({
                        avg: avg.toFixed(1),
                        min: isFinite(min) ? min.toFixed(1) : '-',
                        max: isFinite(max) ? max.toFixed(1) : '-'
                    });
                }
            }
        } catch (error) {
            console.error("Detail fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    const chartConfig = {
        backgroundGradientFrom: "#FFFFFF",
        backgroundGradientTo: "#FFFFFF",
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green theme
        strokeWidth: 2,
        barPercentage: 0.7,
        decimalPlaces: 1,
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 8 }}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>{metric} Details</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Period Tabs */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                    {(['7D', '30D', '90D'] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setPeriod(tab)}
                            style={{
                                paddingHorizontal: 20,
                                paddingVertical: 8,
                                backgroundColor: period === tab ? '#1F2937' : '#F3F4F6',
                                borderRadius: 20,
                                marginHorizontal: 5
                            }}
                        >
                            <Text style={{ color: period === tab ? '#FFFFFF' : '#4B5563', fontWeight: '600' }}>
                                {tab === '7D' ? '7 Days' : tab === '30D' ? '30 Days' : '3 Months'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Chart */}
                <View style={{ alignItems: 'center', paddingHorizontal: 10 }}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#10B981" />
                    ) : chartData.length > 0 ? (
                        <LineChart
                            data={{
                                labels: chartData.map((d, i) => (i === 0 || i === chartData.length - 1 || i === Math.floor(chartData.length / 2)) ? d.date : ''),
                                datasets: [{ data: chartData.map(d => d.value) }]
                            }}
                            width={screenWidth - 20}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={{ borderRadius: 16 }}
                            withDots={false}
                        />
                    ) : (
                        <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#9CA3AF' }}>No data available for this period</Text>
                        </View>
                    )}
                </View>

                {/* Stats Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20, paddingHorizontal: 20 }}>
                    <View style={{ alignItems: 'center', backgroundColor: '#F0F9FF', padding: 15, borderRadius: 12, flex: 1, marginHorizontal: 5 }}>
                        <Text style={{ color: '#6B7280', fontSize: 12 }}>Average</Text>
                        <Text style={{ color: '#0369A1', fontSize: 18, fontWeight: 'bold' }}>{stats.avg}</Text>
                    </View>
                    <View style={{ alignItems: 'center', backgroundColor: '#F0FDFA', padding: 15, borderRadius: 12, flex: 1, marginHorizontal: 5 }}>
                        <Text style={{ color: '#6B7280', fontSize: 12 }}>Min</Text>
                        <Text style={{ color: '#047857', fontSize: 18, fontWeight: 'bold' }}>{stats.min}</Text>
                    </View>
                    <View style={{ alignItems: 'center', backgroundColor: '#FEF2F2', padding: 15, borderRadius: 12, flex: 1, marginHorizontal: 5 }}>
                        <Text style={{ color: '#6B7280', fontSize: 12 }}>Max</Text>
                        <Text style={{ color: '#B91C1C', fontSize: 18, fontWeight: 'bold' }}>{stats.max}</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
