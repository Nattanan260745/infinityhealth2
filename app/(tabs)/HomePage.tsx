import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Header } from '../components/HomePage/Header';
import { MissionCard } from '../components/HomePage/MissionCard';
import { CalendarWeek } from '../components/HomePage/CalendarWeek';
import { RoutineList } from '../components/HomePage/RoutineList';
import { CalendarDay, Mission, Routine } from '@/src/types';
import { useHomePage } from '../hook/useHomePage';



interface HomePageProps {

}

const HomePage: React.FC<HomePageProps> = (props) => {

    const { weekDays, routines, missions, selectedDate, setSelectedDate, currentMission, setCurrentMission } = useHomePage();

    return (
        <View style={styles.container}>
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: Platform.OS === 'web' ? 20 : 50,
                    paddingBottom: 20
                }}
            >
                <Header
                    userName="Tutor"
                    userAvatar="https://i.pravatar.cc/100?img=47"
                    date="Today 12 Nov 27"
                />

                <MissionCard
                    missions={missions}
                    currentIndex={currentMission}
                    onIndexChange={setCurrentMission}
                />

                <CalendarWeek
                    days={weekDays}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                />

                <RoutineList routines={routines} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#FFFFFF'
    },
});

export default HomePage;