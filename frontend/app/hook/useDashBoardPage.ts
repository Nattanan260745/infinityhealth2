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

import { usePedometer } from "./usePedometer";

export const useDashBoardPage = () => {
    const { currentStepCount, isPedometerAvailable } = usePedometer();
    const [selectedTab, setSelectedTab] = useState<MetricType>('Weight');
    const [statCards, setStatCards] = useState<StatCard[]>(defaultStatCards);
    const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

    // Update Steps card when Pedometer updates
    useEffect(() => {
        if (isPedometerAvailable === 'true' && currentStepCount > 0) {
            setStatCards(prev => prev.map(card => {
                if (card.id === 'Steps') {
                    return { ...card, value: currentStepCount.toString() };
                }
                return card;
            }));
        }
    }, [currentStepCount, isPedometerAvailable]);

    const fetchData = async () => {
        setIsLoading(true);
        setSelectedPointIndex(null);
        try {
            let userId = await storage.getItem('internalUserId');
            if (!userId) {
                userId = await storage.getItem('userId');
            }
            if (!userId) {
                console.log('No user ID found');
                return;
            }

            // Calculate dates for range (last 7 days) - Local Date Strings
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 6);

            const toLocalYMD = (date: Date) => {
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            };

            const endDateStr = toLocalYMD(end);
            const startDateStr = toLocalYMD(start);

            console.log('[Dashboard] Fetching for User:', userId);
            console.log('[Dashboard] Date Range:', startDateStr, 'to', endDateStr);

            const todayLocal = toLocalYMD(new Date());

            const [todayRes, rangeRes] = await Promise.all([
                getHealthTrackToday(userId, todayLocal),
                getHealthTrackRange(userId, startDateStr, endDateStr)
            ]);

            console.log('[Dashboard] Today Res Success:', todayRes.success, 'Data:', JSON.stringify(todayRes.data));
            console.log('[Dashboard] Range Res Success:', rangeRes.success, 'Data Length:', rangeRes.data?.length);
            if (rangeRes.data && rangeRes.data.length > 0) {
                console.log('[Dashboard] Range Data Sample:', JSON.stringify(rangeRes.data[0]));
                console.log('[Dashboard] Range Data Last:', JSON.stringify(rangeRes.data[rangeRes.data.length - 1]));
            }

            // Determine data to show for Today
            let displayData = todayRes.success ? todayRes.data : null;

            // Fallback: If today's specific endpoint returns nothing, check if we have it in the range data
            if (!displayData && rangeRes.success && Array.isArray(rangeRes.data)) {
                // Try to find matching date
                displayData = rangeRes.data.find((item: HealthTrack) => {
                    if (!item.date) return false;
                    return item.date === endDateStr || item.date.startsWith(endDateStr);
                }) || null;
            }

            // Update Cards (Today's Data)
            if (displayData) {
                const data = displayData;
                const weight = typeof data.weight === 'number' ? data.weight : NaN;
                const height = typeof data.height === 'number' ? data.height : NaN;
                const bmi = (!isNaN(weight) && !isNaN(height) && height > 0)
                    ? (weight / ((height / 100) ** 2)).toFixed(2)
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

                // DEDUPLICATION LOGIC: Group by Date and Merge
                const uniqueDataMap = new Map<string, HealthTrack>();

                rangeRes.data.forEach((item: HealthTrack) => {
                    let dateKey = '';
                    if (item.date) {
                        // Parse YYYY-MM-DD
                        dateKey = item.date.split('T')[0];
                    } else if ((item as any)['trackingDate']) {
                        dateKey = new Date((item as any).trackingDate).toISOString().split('T')[0];
                    }

                    if (!dateKey) return;

                    if (!uniqueDataMap.has(dateKey)) {
                        uniqueDataMap.set(dateKey, item);
                    } else {
                        // Merge Strategy: Prefer non-zero/non-null values
                        const existing = uniqueDataMap.get(dateKey)!;
                        uniqueDataMap.set(dateKey, {
                            ...existing,
                            weight: (item.weight && item.weight > 0) ? item.weight : existing.weight,
                            height: (item.height && item.height > 0) ? item.height : existing.height,
                            water: (item.water && item.water > 0) ? item.water : existing.water,
                            sleepHours: (item.sleepHours && item.sleepHours > 0) ? item.sleepHours : existing.sleepHours,
                            sleep_hours: (item.sleep_hours && item.sleep_hours > 0) ? item.sleep_hours : existing.sleep_hours,
                            stepsCount: (item.stepsCount && item.stepsCount > 0) ? item.stepsCount : existing.stepsCount,
                            steps_count: (item.steps_count && item.steps_count > 0) ? item.steps_count : existing.steps_count,
                        });
                    }
                });

                // Convert Map back to Array
                const dedupedData = Array.from(uniqueDataMap.values());

                // RE-EVALUATE TODAY'S DATA from deduped list if needed
                // If todayRes was empty or zero, check if we have a better merged version in dedupedData
                if (displayData) {
                    const todayStr = toLocalYMD(new Date());
                    const betterToday = uniqueDataMap.get(todayStr);
                    if (betterToday) {
                        displayData = betterToday;
                    }
                } else {
                    // Try to find today in unique map
                    const todayStr = toLocalYMD(new Date());
                    displayData = uniqueDataMap.get(todayStr) || null;
                }

                // Update Cards again with potentially better DisplayData
                if (displayData) {
                    const data = displayData;
                    const weight = typeof data.weight === 'number' ? data.weight : NaN;
                    const height = typeof data.height === 'number' ? data.height : NaN;
                    const bmi = (!isNaN(weight) && !isNaN(height) && height > 0)
                        ? (weight / ((height / 100) ** 2)).toFixed(2)
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

                // Map data based on selectedTab
                const mappedData = dedupedData.map((item: HealthTrack) => {
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