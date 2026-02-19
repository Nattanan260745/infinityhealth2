import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, RefreshControl, TouchableOpacity } from 'react-native';
import { Header } from '../components/HomePage/Header';
import { MissionCard } from '../components/HomePage/MissionCard';
import { CalendarWeek } from '../components/HomePage/CalendarWeek';
import { RoutineList } from '../components/HomePage/RoutineList';
import { CalendarDay, Mission, Routine } from '@/src/types';
import { useHomePage } from '../hook/useHomePage';
import { Ionicons } from '@expo/vector-icons';
import { useGoogleFit } from '../hooks/useGoogleFit';


interface HomePageProps {

}

const HomePage: React.FC<HomePageProps> = (props) => {
    const homePageController = useHomePage();
    const { steps, isAuthorized, authorize } = useGoogleFit();

    // Format today's date
    const today = new Date();
    // Custom format to match "Today 12 Nov 27" style roughly:
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }); // e.g. Monday
    const dayNum = today.getDate();
    const month = today.toLocaleDateString('en-US', { month: 'short' });
    const year = today.getFullYear().toString().slice(-2);
    const formattedDate = `Today ${dayNum} ${month} ${year}`;


    return (
        <View style={homePageController.styles.container}>
            <View style={{ paddingTop: Platform.OS === 'web' ? 20 : 50, paddingHorizontal: 20, backgroundColor: '#FFFFFF' }}>
                <Header
                    userName={homePageController.userName}
                    userAvatar={homePageController.userAvatar}
                    date={formattedDate}
                    unreadCount={homePageController.unreadCount}
                />
            </View>


            <ScrollView
                style={{ flex: 1, }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    // paddingTop: Platform.OS === 'web' ? 20 : 50,
                    paddingBottom: 20
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={homePageController.refreshing}
                        onRefresh={homePageController.onRefresh}
                        tintColor="#7DD1E0"
                    />
                }
            >


                <MissionCard useHomePageController={homePageController} />

                <CalendarWeek
                    days={homePageController.weekDays}
                    selectedDate={homePageController.selectedDate}
                    onSelectDate={homePageController.setSelectedDate}
                />

                <RoutineList routines={homePageController.routines} />
            </ScrollView>
        </View>
    );
};



export default HomePage;