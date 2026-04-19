import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { MonthDay, DAYS } from '@/hook/useCalendar';

interface DaySelectorProps {
    days: MonthDay[];
    selectedDay: number;
    onSelectDay: (day: number) => void;
    isToday: (date: number) => boolean;
}

const ITEM_WIDTH = 60;
const ITEM_SPACING = 8;
const FULL_ITEM_SIZE = ITEM_WIDTH + ITEM_SPACING;
const SCREEN_WIDTH = Dimensions.get('window').width;

export const DaySelector: React.FC<DaySelectorProps> = ({
    days,
    selectedDay,
    onSelectDay,
    isToday,
}) => {
    const flatListRef = useRef<FlatList>(null);
    const lastScrolledMonth = useRef<string | null>(null);

    const todayIndex = days.findIndex(d => isToday(d.date));

    // Scroll to today ONLY when days array (month) changes significantly
    useEffect(() => {
        if (todayIndex !== -1 && flatListRef.current) {
            // Construct a simple key for the current set of days (e.g. "1-31")
            // A primitive check: if days[0].date is 1, it's start of month.
            // Better: use the first day to generate a unique key for the month view.
            if (days.length === 0) return;

            // Assume days are sorted. Use first day to id the month.
            // But 'days' might completely change object references.
            // We need to know if we are looking at a "new month".
            // Since we don't have month/year props here, let's use the first day's date + length.
            // Actually 'days' prop changes when month changes.

            // Generate a unique ID for the current month view
            // e.g. "Start:1-End:31" (Risk: same for all 31-day months?)
            // We need something more unique.
            // Let's rely on the fact that 'days' changes when we switch months.
            // But we want to avoid re-scrolling if just a task changed.

            // We can just check if we have already scrolled for this specific `todayIndex` and specific `days` length?
            // No, the issue is that `useCalendar` might re-create `days` array on every render.
            // But `todayIndex` should remain stable if we are in the same month.

            // Fix: Create a unique key for the month based on the first day
            // But we don't have month index here.

            // Let's try simpler: Only scroll if we haven't scrolled for this `todayIndex` YET?
            // No, if user scrolls away, we don't want to snap back.

            // Let's assume the parent only passes new `days` when month changes or data updates.
            // Data update re-triggering scroll IS the problem.

            // Soln: Use a ref that stores the "month ID".
            // Since we don't have month ID, we can construct one if `days` has weekday info?
            // `days[0]` is { day: 'Sun', date: 1, ... }
            // The combination of days[0].day (weekday) and days.length is unique for a specific month in a year usually.
            const monthKey = `${days.length}-${days[0]?.day}`;

            if (lastScrolledMonth.current !== monthKey) {
                // Determine offset
                const offset = (todayIndex * FULL_ITEM_SIZE) - (SCREEN_WIDTH / 2) + (ITEM_WIDTH / 2);
                const validOffset = Math.max(0, offset);

                flatListRef.current.scrollToOffset({
                    offset: validOffset,
                    animated: false // Use false for instant snap on layout, or true for smooth
                });

                lastScrolledMonth.current = monthKey;
            }
        }
    }, [days, todayIndex]);

    const renderItem = ({ item }: { item: MonthDay }) => {
        const selected = selectedDay === item.date;
        const isTodayDate = isToday(item.date);
        return (
            <TouchableOpacity
                onPress={() => onSelectDay(item.date)}
                style={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingVertical: 10,
                    width: ITEM_WIDTH,
                    height: 70,
                    marginRight: ITEM_SPACING,
                    borderRadius: 12,
                    backgroundColor: selected ? '#7DD1E0' : isTodayDate ? '#374151' : 'transparent',
                }}
            >
                <Text
                    style={{
                        fontSize: 12,
                        color: selected || isTodayDate ? '#FFFFFF' : '#9CA3AF',
                        marginBottom: 4,
                    }}
                >
                    {item.day}
                </Text>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: selected || isTodayDate ? '#FFFFFF' : '#1F2937',
                    }}
                >
                    {item.date}
                </Text>
                <View style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: item.hasTask
                        ? (selected || isTodayDate ? '#FFFFFF' : '#7DD1E0')
                        : 'transparent',
                    marginTop: 4,
                }} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ marginBottom: 24, maxHeight: 80 }}>
            <FlatList
                ref={flatListRef}
                data={days}
                renderItem={renderItem}
                keyExtractor={(item) => `${item.date}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                getItemLayout={(data, index) => ({
                    length: FULL_ITEM_SIZE,
                    offset: FULL_ITEM_SIZE * index,
                    index,
                })}
                initialScrollIndex={todayIndex !== -1 ? todayIndex : 0}
                onScrollToIndexFailed={(info) => {
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                        flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                    });
                }}
            />
        </View>
    );
};

