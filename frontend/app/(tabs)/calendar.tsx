import React from 'react';
import { View, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useCalendar } from '@/hook/useCalendar';
import {
    CalendarHeader,
    MonthNavigation,
    DaySelector,
    TaskGroup,
    MonthPickerModal,
    EmptyState,
    SelectedDateInfo,
    MonthGrid,
} from '@/components/Calendar';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarScreen() {
    const {
        today,
        year,
        month,
        selectedDay,
        setSelectedDay,
        showMonthPicker,
        setShowMonthPicker,
        monthDays,
        selectedDateTasks,
        routineTasks,
        goalTasks,
        goToPreviousMonth,
        goToNextMonth,
        selectMonth,
        goToPreviousYear,
        goToNextYear,
        isToday,
        toggleTask,
    } = useCalendar();

    const [viewMode, setViewMode] = React.useState<'week' | 'month'>('week');

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>

            <View style={{ backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'web' ? 40 : 60 }}>
                <View style={{ position: 'relative' }}>
                    <CalendarHeader />
                    <TouchableOpacity
                        onPress={() => setViewMode(mode => mode === 'week' ? 'month' : 'week')}
                        style={{
                            position: 'absolute',
                            right: 20,
                            top: 4,
                            padding: 4,
                        }}
                    >
                        <Ionicons
                            name={viewMode === 'week' ? "calendar-outline" : "grid-outline"}
                            size={24}
                            color="#4B5563"
                        />
                    </TouchableOpacity>
                </View>

                <MonthNavigation
                    month={month}
                    year={year}
                    onPrevious={goToPreviousMonth}
                    onNext={goToNextMonth}
                    onOpenPicker={() => setShowMonthPicker(true)}
                />

                {viewMode === 'week' ? (
                    <DaySelector
                        days={monthDays}
                        selectedDay={selectedDay}
                        onSelectDay={setSelectedDay}
                        isToday={isToday}
                    />
                ) : (
                    <MonthGrid
                        days={monthDays}
                        selectedDay={selectedDay}
                        month={month}
                        year={year}
                        onSelectDay={setSelectedDay}
                        isToday={isToday}
                    />
                )}
            </View>
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    // paddingTop: Platform.OS === 'web' ? 40 : 60,
                    paddingBottom: 100, // Safe space for nav bar
                    flexGrow: 1,
                }}
            >


                <SelectedDateInfo month={month} day={selectedDay} year={year} />

                {selectedDateTasks.length > 0 ? (
                    <View style={{ paddingHorizontal: 20 }}>
                        <TaskGroup
                            title="Routine"
                            tasks={routineTasks}
                            onToggleTask={(id) => toggleTask(id, 'routine')}
                        />
                        <TaskGroup
                            title="Goal"
                            tasks={goalTasks}
                            onToggleTask={(id) => toggleTask(id, 'goal')}
                        />
                    </View>
                ) : (
                    <EmptyState />
                )}
            </ScrollView>

            <MonthPickerModal
                visible={showMonthPicker}
                year={year}
                month={month}
                todayMonth={today.getMonth()}
                todayYear={today.getFullYear()}
                onClose={() => setShowMonthPicker(false)}
                onSelectMonth={selectMonth}
                onPreviousYear={goToPreviousYear}
                onNextYear={goToNextYear}
            />
        </View>
    );
}
// yahoo
