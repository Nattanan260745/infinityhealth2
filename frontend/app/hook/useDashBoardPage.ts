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

const filterTabs: MetricType[] = ['Weight', 'Height', 'BMI', 'Water', 'Sleep', 'Steps'];

export const useDashBoardPage = () => {
    const [selectedTab, setSelectedTab] = useState<MetricType>('Weight');
    const [statCards, setStatCards] = useState<StatCard[]>(defaultStatCards);
    const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
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
                const bmi = data.weight && data.height ? (data.weight / ((data.height / 100) ** 2)).toFixed(2) : '-';

                setStatCards([
                    { id: 'Weight', icon: 'bag-handle', iconColor: '#009E0B', value: data.weight?.toString() || '-', unit: 'kg', bgColor: '#DAEDDC' },
                    { id: 'Height', icon: 'swap-vertical', iconColor: '#009E0B', value: data.height?.toString() || '-', unit: 'cm', bgColor: '#D8F4DC' },
                    { id: 'BMI', icon: 'options', iconColor: '#FF5100', value: bmi, unit: '', bgColor: '#FFE2D7' },
                    { id: 'Water', icon: 'water', iconColor: '#00BFFF', value: (data.water_glass * 250).toString() || '-', unit: 'ml', bgColor: '#D8F4FF' }, // Approx 250ml per glass
                    { id: 'Sleep', icon: 'moon', iconColor: '#FFEA00', value: data.sleep_hours?.toString() || '-', unit: 'hr', bgColor: '#FAF5DE' },
                    { id: 'Steps', icon: 'footsteps', iconColor: '#6004FF', value: data.steps?.toString() || '-', unit: 'steps', bgColor: '#EAE1F9' },
                ]);
            }

            // Update Chart (Range Data)
            if (rangeRes.success && rangeRes.data) {
                // Map data based on selectedTab
                const mappedData = rangeRes.data.map((item: HealthTrack) => {
                    const dateStr = new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' });
                    let val = 0;

                    switch (selectedTab) {
                        case 'Weight': val = item.weight || 0; break;
                        case 'Height': val = item.height || 0; break;
                        case 'Water': val = (item.water_glass || 0) * 250; break;
                        case 'Sleep': val = item.sleep_hours || 0; break;
                        case 'Steps': val = item.steps || 0; break;
                        case 'BMI':
                            val = item.weight && item.height ? parseFloat((item.weight / ((item.height / 100) ** 2)).toFixed(2)) : 0;
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
        }, [selectedTab]) // Re-fetch or re-calc when tab changes. optimizing to only calc chart would be better but this is simple.
    );

    const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 100;

    // Calculate trend
    let trendValue = 0;
    let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';

    if (chartData.length >= 2) {
        const latest = chartData[chartData.length - 1].value;
        const previous = chartData[chartData.length - 2].value;
        const diff = latest - previous;

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
    }
}