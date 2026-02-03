import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Header } from '../components/HomePage/Header';
import { MissionCard } from '../components/HomePage/MissionCard';
import { CalendarWeek } from '../components/HomePage/CalendarWeek';
import { RoutineList } from '../components/HomePage/RoutineList';
import { CalendarDay, Mission, Routine } from '@/src/types';
import { useHomePage } from '../hook/useHomePage';
import { Ionicons } from '@expo/vector-icons';


interface HomePageProps {

}

const HomePage: React.FC<HomePageProps> = (props) => {
    const useHomePageController = useHomePage();

    // Format today's date
    const today = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: '2-digit'
    };
    // Example: "Today 12 Nov 27" -> "Monday, 5 Jan 26" (or similar)
    // Custom format to match "Today 12 Nov 27" style roughly:
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }); // e.g. Monday
    const dayNum = today.getDate();
    const month = today.toLocaleDateString('en-US', { month: 'short' });
    const year = today.getFullYear().toString().slice(-2);
    const formattedDate = `Today ${dayNum} ${month} ${year}`;


    return (
        <View style={useHomePageController.styles.container}>
            <View style={{ paddingTop: Platform.OS === 'web' ? 20 : 50, paddingHorizontal: 20, backgroundColor: '#FFFFFF' }}>
                <Header
                    userName={useHomePageController.userName}
                    userAvatar={useHomePageController.userAvatar}
                    date={formattedDate}
                />
            </View>


            <ScrollView
                style={{ flex: 1, }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    // paddingTop: Platform.OS === 'web' ? 20 : 50,
                    paddingBottom: 20
                }}
            >


                <MissionCard
                    useHomePageController={useHomePageController}
                // missions={missions}
                // currentIndex={currentMission}
                // onIndexChange={setCurrentMission}
                />

                <CalendarWeek
                    days={useHomePageController.weekDays}
                    selectedDate={useHomePageController.selectedDate}
                    onSelectDate={useHomePageController.setSelectedDate}
                />

                <RoutineList routines={useHomePageController.routines} />
            </ScrollView>
        </View>
    );
};



export default HomePage;