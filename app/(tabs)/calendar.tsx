import React from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { useCalendar } from '../hook/useCalendar';
import {
    CalendarHeader,
    MonthNavigation,
    DaySelector,
    TaskGroup,
    MonthPickerModal,
    EmptyState,
    SelectedDateInfo,
} from '../components/Calendar';

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

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>

            <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'red', paddingTop: Platform.OS === 'web' ? 40 : 60 }}>
                <CalendarHeader />
                <MonthNavigation
                    month={month}
                    year={year}
                    onPrevious={goToPreviousMonth}
                    onNext={goToNextMonth}
                    onOpenPicker={() => setShowMonthPicker(true)}
                />

                <DaySelector
                    days={monthDays}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                    isToday={isToday}
                />
            </View>
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    // paddingTop: Platform.OS === 'web' ? 40 : 60,
                    // paddingBottom: 30,
                    flexGrow: 1,
                }}
            >


                <SelectedDateInfo month={month} day={selectedDay} year={year} />

                {selectedDateTasks.length > 0 ? (
                    <View style={{ paddingHorizontal: 20 }}>
                        <TaskGroup title="Routine" tasks={routineTasks} onToggleTask={toggleTask} />
                        <TaskGroup title="Goal" tasks={goalTasks} onToggleTask={toggleTask} />
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