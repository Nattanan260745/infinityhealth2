import { useState, useEffect, useCallback, useRef } from "react";
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

    // Use Ref to avoid stale closures in fetchData
    const stepCountRef = useRef(currentStepCount);
    useEffect(() => {
        stepCountRef.current = currentStepCount;
    }, [currentStepCount]);

    // Update Steps card when Pedometer updates
    useEffect(() => {
        // Update if we have meaningful steps OR if pedometer is ready
        // Allow cached steps to show even if sensor is still "checking"
        if (currentStepCount > 0 || isPedometerAvailable === 'true') {
            setStatCards(prev => prev.map(card => {
                if (card.id === 'Steps') {
                    // Use the greater of current or existing? Usually current is authority.
                    const newVal = currentStepCount.toString();
                    if (card.value !== newVal) {
                        return { ...card, value: newVal };
                    }
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

            const todayLocal = toLocalYMD(new Date());

            const [todayRes, rangeRes] = await Promise.all([
                getHealthTrackToday(userId, todayLocal),
                getHealthTrackRange(userId, startDateStr, endDateStr)
            ]);

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

                // Debugging Step Count Logic
                const currentRefSteps = stepCountRef.current;
                // Fix: Handle 0 correctly (0 || undefined -> undefined)
                const apiSteps = (data.stepsCount !== undefined && data.stepsCount !== null)
                    ? data.stepsCount
                    : ((data.steps_count !== undefined && data.steps_count !== null) ? data.steps_count : 0);

                // Determine final value
                const finalSteps = currentRefSteps > 0 ? currentRefSteps : apiSteps;

                const newCards: StatCard[] = [
                    { id: 'Weight', icon: 'bag-handle', iconColor: '#009E0B', value: data.weight?.toString() || '-', unit: 'kg', bgColor: '#DAEDDC' },
                    { id: 'Height', icon: 'swap-vertical', iconColor: '#009E0B', value: data.height?.toString() || '-', unit: 'cm', bgColor: '#D8F4DC' },
                    { id: 'BMI', icon: 'options', iconColor: '#FF5100', value: bmi, unit: '', bgColor: '#FFE2D7' },
                    { id: 'Water', icon: 'water', iconColor: '#00BFFF', value: data.water?.toString() || '-', unit: 'ml', bgColor: '#D8F4FF' },
                    { id: 'Sleep', icon: 'moon', iconColor: '#FFEA00', value: (data.sleepHours || data.sleep_hours)?.toString() || '-', unit: 'hr', bgColor: '#FAF5DE' },
                    {
                        id: 'Steps',
                        icon: 'footsteps',
                        iconColor: '#6004FF',
                        // Initial propose: Ref or API
                        value: finalSteps.toString(),
                        unit: 'steps',
                        bgColor: '#EAE1F9'
                    },
                ];

                setStatCards(prevCards => {
                    return newCards.map(newCard => {
                        if (newCard.id === 'Steps') {
                            const prevCard = prevCards.find(c => c.id === 'Steps');
                            const prevVal = parseInt(prevCard?.value || '0');
                            const newVal = parseInt(newCard.value || '0');

                            // If we have a higher value in UI already (from Pedometer event), keep it!
                            // This prevents API (0) from overwriting Pedometer (46)
                            if (!isNaN(prevVal) && prevVal > newVal) {
                                return { ...newCard, value: prevCard!.value };
                            }
                        }
                        return newCard;
                    });
                });
            } else {
                console.log('[Dashboard Hook] No display data found');
            }

            // Update Chart (Range Data)
            if (rangeRes.success && rangeRes.data) {

                // DEDUPLICATION LOGIC: Group by Date and Merge

                // กลุ่มข้อมูลตามวันและเลือกเฉพาะข้อมูลล่าสุดของแต่ละวัน (timestamp ล่าสุด)
                const latestPerDayMap = new Map<string, HealthTrack>();

                rangeRes.data.forEach((item: HealthTrack) => {
                    let dateKey = '';
                    let itemDate: Date;

                    if (item.date) {
                        itemDate = new Date(item.date);
                        dateKey = itemDate.toISOString().split('T')[0];
                    } else if ((item as any)['trackingDate']) {
                        itemDate = new Date((item as any)['trackingDate']);
                        dateKey = itemDate.toISOString().split('T')[0];
                    } else {
                        return;
                    }

                    if (!latestPerDayMap.has(dateKey)) {
                        latestPerDayMap.set(dateKey, item);
                    } else {
                        const existing = latestPerDayMap.get(dateKey)!;
                        const existingDate = new Date(existing.date || (existing as any)['trackingDate']);

                        // เอา record ที่ timestamp ใหม่กว่า
                        if (itemDate > existingDate) {
                            latestPerDayMap.set(dateKey, item);
                        }
                    }
                });


                // Convert Map back to Array (เฉพาะข้อมูลล่าสุดของแต่ละวัน)
                const dedupedData = Array.from(latestPerDayMap.values());

                // RE-EVALUATE TODAY'S DATA from deduped list if needed
                // If todayRes was empty or zero, check if we have a better merged version in dedupedData
                if (displayData) {
                    const todayStr = toLocalYMD(new Date());
                    const betterToday = latestPerDayMap.get(todayStr);
                    if (betterToday) {
                        displayData = betterToday;
                    }
                } else {
                    // Try to find today in unique map
                    const todayStr = toLocalYMD(new Date());
                    displayData = latestPerDayMap.get(todayStr) || null;
                }

                // Update Cards again with potentially better DisplayData
                if (displayData) {
                    const data = displayData;
                    const weight = typeof data.weight === 'number' ? data.weight : NaN;
                    const height = typeof data.height === 'number' ? data.height : NaN;
                    const bmi = (!isNaN(weight) && !isNaN(height) && height > 0)
                        ? (weight / ((height / 100) ** 2)).toFixed(2)
                        : '-';

                    // Logic again for Range block (if needed, but usually Today block covers it)
                    // ... simpler setStatCards here if needed, but let's assume Today block is primary for Steps

                    // Update Cards again but preserve Steps if logic requires
                    setStatCards(prevCards => {
                        // Re-construct cards based on NEW displayData
                        return prevCards.map(card => {
                            // Only update non-Steps or handle Steps carefully
                            if (card.id === 'Weight') return { ...card, value: data.weight?.toString() || '-' };
                            if (card.id === 'Height') return { ...card, value: data.height?.toString() || '-' };
                            if (card.id === 'BMI') return { ...card, value: bmi };
                            if (card.id === 'Water') return { ...card, value: data.water?.toString() || '-' };
                            if (card.id === 'Sleep') return { ...card, value: (data.sleepHours || data.sleep_hours)?.toString() || '-' };

                            // Steps: Don't overwrite if prev is higher?
                            if (card.id === 'Steps') {
                                const apiVal = data.stepsCount || data.steps_count || 0;
                                const prevVal = parseInt(card.value || '0');

                                if (!isNaN(prevVal) && prevVal > apiVal) return card;
                                return { ...card, value: apiVal.toString() };
                            }
                            return card;
                        });
                    });
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