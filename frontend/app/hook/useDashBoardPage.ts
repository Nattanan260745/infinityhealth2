import { useState, useEffect, useCallback } from "react";
import { MetricType, StatCard, HealthTrack } from "../interface/infinityhealth.interface";
import { getHealthTrackToday, getHealthTrackRange } from "../service/InfinityhealthApi";
import storage from "../utils/storage";
import { useFocusEffect } from "expo-router";

const defaultStatCards: StatCard[] = [
    { id: 'Weight', icon: 'bag-handle', iconColor: '#009E0B', value: '-', unit: 'kg', bgColor: '#DAEDDC' },
    { id: 'Height', icon: 'swap-vertical', iconColor: '#009E0B', value: '-', unit: 'cm', bgColor: '#D8F4DC' },
    { id: 'BMI', icon: 'options', iconColor: '#FF5100', value: '-', unit: '', bgColor: '#FFE2D7' },
    { id: 'Water', icon: 'water', iconColor: '#00BFFF', value: '-', unit: 'ml', bgColor: '#D8F4FF' },
    { id: 'Sleep', icon: 'moon', iconColor: '#FFEA00', value: '-', unit: 'hr', bgColor: '#FAF5DE' },
    { id: 'Steps', icon: 'footsteps', iconColor: '#6004FF', value: '-', unit: 'steps', bgColor: '#EAE1F9' },
];

const filterTabs: MetricType[] = ['Weight', 'BMI', 'Water', 'Sleep', 'Steps'];

export const useDashBoardPage = () => {
    const [selectedTab, setSelectedTab] = useState<MetricType>('Weight');
    const [statCards, setStatCards] = useState<StatCard[]>(defaultStatCards);
    const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setSelectedPointIndex(null);
        try {
            const userId = await storage.getItem('userId');
            if (!userId) {
                console.log('No user ID found');
                return;
            }

            // Calculate dates for range (last 7 days)
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 6);

            const [todayRes, rangeRes] = await Promise.all([
                getHealthTrackToday(userId),
                getHealthTrackRange(userId, startDate.toISOString(), endDate.toISOString())
            ]);

            // Update Cards (Today's Data)
            if (todayRes.success && todayRes.data) {
                const data = todayRes.data;
                const bmi = (data.weight && data.height && !isNaN(data.weight) && !isNaN(data.height))
                    ? (data.weight / ((data.height / 100) ** 2)).toFixed(2)
                    : '-';

                setStatCards([
                    { id: 'Weight', icon: 'bag-handle', iconColor: '#009E0B', value: data.weight?.toString() || '-', unit: 'kg', bgColor: '#DAEDDC' },
                    { id: 'Height', icon: 'swap-vertical', iconColor: '#009E0B', value: data.height?.toString() || '-', unit: 'cm', bgColor: '#D8F4DC' },
                    { id: 'BMI', icon: 'options', iconColor: '#FF5100', value: bmi, unit: '', bgColor: '#FFE2D7' },
                    { id: 'Water', icon: 'water', iconColor: '#00BFFF', value: data.water?.toString() || '-', unit: 'ml', bgColor: '#D8F4FF' },
                    { id: 'Sleep', icon: 'moon', iconColor: '#FFEA00', value: (data.sleepHours || data.sleep_hours)?.toString() || '-', unit: 'hr', bgColor: '#FAF5DE' },
                    { id: 'Steps', icon: 'footsteps', iconColor: '#6004FF', value: (data.stepsCount || data.steps_count)?.toString() || '-', unit: 'steps', bgColor: '#EAE1F9' },
                ]);
            }

            // Update Chart (Range Data)
            if (rangeRes.success && rangeRes.data) {
                // Map data based on selectedTab
                const mappedData = rangeRes.data.map((item: HealthTrack) => {
                    let dateStr = '';
                    if (item.date) {
                        // Parse date safely
                        // Try YYYY-MM-DD
                        const parts = item.date.split('-');
                        if (parts.length >= 3) {
                            dateStr = `${parseInt(parts[1])}/${parseInt(parts[2].substring(0, 2))}`;
                        } else {
                            // Try parsing as normal date
                            const d = new Date(item.date);
                            if (!isNaN(d.getTime())) {
                                dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' });
                            } else {
                                // Fallback: just show first 5 chars or raw
                                dateStr = item.date.substring(5, 10).replace('-', '/');
                            }
                        }
                    } else if ((item as any)['trackingDate']) { // Fallback if property is trackingDate
                        const d = new Date((item as any).trackingDate);
                        if (!isNaN(d.getTime())) {
                            dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' });
                        }
                    }

                    let val = 0;

                    switch (selectedTab) {
                        case 'Weight': val = item.weight || 0; break;
                        case 'Height': val = item.height || 0; break;
                        case 'Water': val = item.water || 0; break;
                        case 'Sleep': val = item.sleepHours || item.sleep_hours || 0; break;
                        case 'Steps': val = item.stepsCount || item.steps_count || 0; break;
                        case 'BMI':
                            // Check if weight and height exist and are valid numbers
                            if (typeof item.weight === 'number' && typeof item.height === 'number' && item.height > 0) {
                                val = parseFloat((item.weight / ((item.height / 100) ** 2)).toFixed(2));
                            } else {
                                val = 0;
                            }
                            break;
                        default: val = 0;
                    }
                    return { date: dateStr, value: val };
                });
                // Sort by date just in case
                setChartData(mappedData.reverse());
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [selectedTab])
    );

    const handleDataPointClick = (data: any) => {
        if (data.index === undefined) return;
        if (selectedPointIndex === data.index) {
            setSelectedPointIndex(null);
        } else {
            setSelectedPointIndex(data.index);
        }
    };



    const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 100;

    // Calculate trend
    let trendValue = 0;
    let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';

    // Determine which points to compare
    let currentVal = 0;
    let prevVal = 0;
    let hasComparison = false;

    if (selectedPointIndex !== null) {
        // Compare clicked point with previous point
        if (selectedPointIndex > 0 && selectedPointIndex < chartData.length) {
            currentVal = chartData[selectedPointIndex].value;
            prevVal = chartData[selectedPointIndex - 1].value;
            hasComparison = true;
        } else {
            // Index 0 or invalid
            currentVal = chartData[selectedPointIndex]?.value || 0;
            hasComparison = false; // No prev data to compare
        }
    } else {
        // Default: Last vs 2nd Last
        if (chartData.length >= 2) {
            currentVal = chartData[chartData.length - 1].value;
            prevVal = chartData[chartData.length - 2].value;
            hasComparison = true;
        }
    }

    if (hasComparison) {
        const diff = currentVal - prevVal;
        trendValue = Math.abs(parseFloat(diff.toFixed(2)));
        if (diff > 0) trendDirection = 'up';
        else if (diff < 0) trendDirection = 'down';
    }

    return {
        selectedTab,
        setSelectedTab,
        maxValue,
        chartData,
        statCards,
        filterTabs,
        trendValue,
        trendDirection,
        fetchData,
        handleDataPointClick, // Export handler
        selectedPointIndex,   // Export state
    }
}