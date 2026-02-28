import { useState, useEffect, useCallback, useRef } from "react";
import { MetricType, StatCard, HealthTrack } from "../interface/infinityhealth.interface";
import { getHealthTrackToday, getHealthTrackRange, saveHealthData } from "../service/InfinityhealthApi";
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

import { useGoogleFit } from "../hooks/useGoogleFit";

export const useDashBoardPage = () => {
    const { steps: googleFitSteps, setBaselineSteps, isAuthorized } = useGoogleFit();
    const [selectedTab, setSelectedTab] = useState<MetricType>('Weight');
    const [statCards, setStatCards] = useState<StatCard[]>(defaultStatCards);
    const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

    // Use Ref to avoid stale closures in fetchData
    const stepCountRef = useRef(googleFitSteps);
    useEffect(() => {
        stepCountRef.current = googleFitSteps;
    }, [googleFitSteps]);

    // Update Steps card when Google Fit updates (now works even if not authorized by Fit)
    useEffect(() => {
        if (googleFitSteps >= 0) {
            setStatCards(prev => prev.map(card => {
                if (card.id === 'Steps') {
                    const newVal = googleFitSteps;
                    const currentValStr = card.value;
                    const currentVal = (currentValStr && currentValStr !== '-') ? parseInt(currentValStr, 10) : 0;

                    // ONLY update if it's an increase (fixes the "stays at 1" or "downgrade" issue)
                    if (newVal > currentVal) {
                        return { ...card, value: newVal.toString() };
                    }
                }
                return card;
            }));
        }
    }, [googleFitSteps]);

    // AUTO-SAVE Steps debounced logic
    const lastSavedSteps = useRef<number>(0);
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (googleFitSteps > 0 && Math.abs(googleFitSteps - lastSavedSteps.current) >= 50) {
                try {
                    let userId = await storage.getItem('internalUserId') || await storage.getItem('userId');
                    if (userId) {
                        const now = new Date();
                        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                        await saveHealthData(userId, {
                            date: today,
                            steps_count: googleFitSteps,
                            stepsCount: googleFitSteps
                        });
                        lastSavedSteps.current = googleFitSteps;
                        console.log(`[Dashboard Hook] Auto-saved steps: ${googleFitSteps}`);
                    }
                } catch (e) {
                    console.log('[Dashboard Hook] Auto-save steps failed');
                }
            }
        }, 10000); // 10 seconds debounce
        return () => clearTimeout(timer);
    }, [googleFitSteps]);

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

            // Update Cards (Today's Data or Defaults)
            const currentRefSteps = stepCountRef.current;
            const data = (displayData || {}) as any; // Use empty object with any cast to avoid lint errors

            // Fallback to latest history for weight/height/water/sleep if today is missing
            let fallbackData: any = {};
            if (!displayData && rangeRes.success && rangeRes.data && Array.isArray(rangeRes.data) && rangeRes.data.length > 0) {
                const history = rangeRes.data as any[];
                // Find most recent record that has the metric, starting from most recent day
                const findLatest = (key: string, altKey?: string) => {
                    const found = history.find((item: any) => (item[key] !== undefined && item[key] !== null && item[key] !== 0) || (altKey && item[altKey] !== undefined && item[altKey] !== null && item[altKey] !== 0));
                    return found ? (found[key] || (altKey ? found[altKey] : undefined)) : undefined;
                };
                fallbackData = {
                    weight: findLatest('weight'),
                    height: findLatest('height'),
                    water: findLatest('water'),
                    sleep_hours: findLatest('sleep_hours', 'sleepHours'),
                };
                console.log('[Dashboard Hook] Using fallback data from history:', fallbackData);
            }

            // Pull weight/height/etc from data with aggressive fallback per field
            const getValueWithFallback = (dataKey: string, fallbackKey?: string) => {
                const val = data[dataKey] !== undefined && data[dataKey] !== null && data[dataKey] !== 0
                    ? data[dataKey]
                    : (fallbackKey ? fallbackData[fallbackKey] : fallbackData[dataKey]);
                return val;
            };

            // Persistent metrics (Carry over from history)
            const weight = getValueWithFallback('weight');
            const height = getValueWithFallback('height');

            // Daily Cumulative metrics (Should be 0 if today is missing)
            const getDailyValue = (dataKey: string, fallbackKey?: string) => {
                const val = data[dataKey] !== undefined && data[dataKey] !== null && data[dataKey] !== 0
                    ? data[dataKey]
                    : 0; // Don't fallback to yesterday for steps/water/sleep
                return val;
            };

            const water = getDailyValue('water');
            const sleep = getDailyValue('sleepHours', 'sleep_hours');

            const bmi = (typeof weight === 'number' && typeof height === 'number' && height > 0)
                ? (weight / ((height / 100) ** 2)).toFixed(2)
                : '-';

            const apiSteps = (data.stepsCount !== undefined && data.stepsCount !== null)
                ? data.stepsCount
                : ((data.steps_count !== undefined && data.steps_count !== null) ? data.steps_count : 0);

            // Determine final value
            const finalSteps = currentRefSteps > apiSteps ? currentRefSteps : apiSteps;

            // SYNC UPWARD: If API has higher steps, update local baseline to avoid downgrades/jumps
            if (apiSteps > currentRefSteps) {
                setBaselineSteps(apiSteps);
                lastSavedSteps.current = apiSteps;
            }

            const newCards: StatCard[] = [
                { id: 'Weight', icon: 'bag-handle', iconColor: '#009E0B', value: weight?.toString() || '-', unit: 'kg', bgColor: '#DAEDDC' },
                { id: 'Height', icon: 'swap-vertical', iconColor: '#009E0B', value: height?.toString() || '-', unit: 'cm', bgColor: '#D8F4DC' },
                { id: 'BMI', icon: 'options', iconColor: '#FF5100', value: bmi, unit: '', bgColor: '#FFE2D7' },
                { id: 'Water', icon: 'water', iconColor: '#00BFFF', value: water?.toString() || '-', unit: 'ml', bgColor: '#D8F4FF' },
                { id: 'Sleep', icon: 'moon', iconColor: '#FFEA00', value: sleep?.toString() || '-', unit: 'hr', bgColor: '#FAF5DE' },
                { id: 'Steps', icon: 'footsteps', iconColor: '#6004FF', value: finalSteps.toString(), unit: 'steps', bgColor: '#EAE1F9' },
            ];

            setStatCards(prevCards => {
                return newCards.map(newCard => {
                    if (newCard.id === 'Steps') {
                        const prevCard = prevCards.find(c => c.id === 'Steps');
                        const prevValStr = prevCard?.value;
                        const prevVal = (prevValStr && prevValStr !== '-') ? parseInt(prevValStr, 10) : 0;
                        const newVal = parseInt(newCard.value || '0', 10);

                        if (!isNaN(prevVal) && prevVal > newVal) {
                            return { ...newCard, value: prevVal.toString() };
                        }
                    }
                    return newCard;
                });
            });

            if (!displayData) {
                console.log('[Dashboard Hook] No display data found (Initialized with defaults/local steps/history)');
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
                        // Use local YMD for consistency across components
                        dateKey = toLocalYMD(itemDate);
                    } else if ((item as any)['trackingDate']) {
                        itemDate = new Date((item as any)['trackingDate']);
                        dateKey = toLocalYMD(itemDate);
                    } else {
                        return;
                    }

                    if (!latestPerDayMap.has(dateKey)) {
                        latestPerDayMap.set(dateKey, item);
                    } else {
                        const existing = latestPerDayMap.get(dateKey)!;
                        const existingDate = new Date(existing.date || (existing as any)['trackingDate']);

                        // Use the record with the more recent timestamp
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

                    // Pull fallback from history for metrics missing in today's best record
                    const weight = (typeof data.weight === 'number' && data.weight > 0) ? data.weight : fallbackData.weight;
                    const height = (typeof data.height === 'number' && data.height > 0) ? data.height : fallbackData.height;
                    const water = (typeof data.water === 'number') ? data.water : fallbackData.water;
                    const sleep = (data.sleepHours || data.sleep_hours) || fallbackData.sleep_hours;

                    const bmi = (!isNaN(weight) && !isNaN(height) && height > 0)
                        ? (weight / ((height / 100) ** 2)).toFixed(2)
                        : '-';

                    setStatCards(prevCards => {
                        return prevCards.map(card => {
                            if (card.id === 'Weight') return { ...card, value: weight?.toString() || '-' };
                            if (card.id === 'Height') return { ...card, value: height?.toString() || '-' };
                            if (card.id === 'BMI') return { ...card, value: bmi };
                            if (card.id === 'Water') return { ...card, value: water?.toString() || '-' };
                            if (card.id === 'Sleep') return { ...card, value: sleep?.toString() || '-' };

                            if (card.id === 'Steps') {
                                const apiVal = data.stepsCount || data.steps_count || 0;
                                const currentLocalSteps = stepCountRef.current;
                                const finalSteps = currentLocalSteps > apiVal ? currentLocalSteps : apiVal;
                                return { ...card, value: finalSteps.toString() };
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