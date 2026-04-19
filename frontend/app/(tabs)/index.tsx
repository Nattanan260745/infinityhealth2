import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, RefreshControl, TouchableOpacity } from 'react-native';
import { Header } from '@/components/HomePage/Header';
import { MissionCard } from '@/components/HomePage/MissionCard';
import { CalendarWeek } from '@/components/HomePage/CalendarWeek';
import { RoutineList } from '@/components/HomePage/RoutineList';
import { CalendarDay, Mission, Routine } from '@/src/types';
import { useHomePage } from '@/hook/useHomePage';
import { Ionicons } from '@expo/vector-icons';
import { useGoogleFit } from '@/hooks/useGoogleFit';
import { useTutorial } from '@/context/TutorialContext';
import TutorialTarget from '@/components/shared/TutorialTarget';
import { useEffect } from 'react';


interface HomePageProps {

}

const HomePage: React.FC<HomePageProps> = (props) => {
    const homePageController = useHomePage();
    const { steps, isAuthorized, authorize } = useGoogleFit();
    const { startTutorial, isComplete, isLoading } = useTutorial();

    useEffect(() => {
        if (!isLoading && !isComplete) {
            startTutorial([
                { id: 'welcome', title: 'ยินดีต้อนรับสู่ InfinityHealth!', description: 'มาเริ่มต้นดูแลสุขภาพของคุณด้วยภารกิจสนุกๆ กันเถอะ!' },

                { id: 'missions', title: 'ป้ายภารกิจ', description: 'ท้าทายตนเองด้วยภารกิจต่างๆ เพื่อรับ Point และ EXP เพิ่มเติม', targetKey: 'home_missions' },
                { id: 'routines', title: 'กิจวัตรประจำวัน', description: 'ตารางเวลาการดูแลสุขภาพที่คุณตั้งไว้ จะปรากฏที่นี่เพื่อให้คุณไม่พลาดทุกกิจกรรม', targetKey: 'home_routines' },

                { id: 'tab_calendar', title: 'ปฏิทินกิจวัตร', description: 'ดูปฏิทินและเช็คตารางกิจวัตรประจำวันที่คุณตั้งไว้ในแต่ละวันได้ที่นี่', targetKey: 'tab_calendar' },

                { id: 'dashboard_edit', title: 'ปุ่มแก้ไขข้อมูล', description: 'กดที่ไอคอนแก้ไขนี้เพื่ออัปเดตข้อมูลต่างๆในการ์ด', targetKey: 'dashboard_edit_button', screen: '/DashBoardPage' },
                { id: 'dashboard_card', title: 'การ์ดสรุปข้อมูลร่างกาย', description: 'เมื่อบันทึกข้อมูลแล้ว ค่าปัจจุบันของคุณจะถูกอัปเดตและแสดงสรุปผลให้เห็นบนการ์ดนี้', targetKey: 'dashboard_weight_card', screen: '/DashBoardPage' },

                { id: 'add_routine', title: 'ปุ่มเพิ่มกิจวัตร', description: 'กดที่ปุ่มนี้เพื่อสร้างกิจวัตรใหม่ เช่น ดื่มน้ำ, นัดหมาย หรือกิจกรรมอื่นๆ', targetKey: 'add_routine_button', screen: '/components/HomePage/subHomePage/routine' },

                { id: 'profile_level_card', title: 'แถบค่า EXP', description: 'ทุกครั้งที่ทำภารกิจ คุณจะได้รับ EXP เพื่ออัปเลเวลตัวเองนะ', targetKey: 'profile_level_card', screen: '/profile' },
                { id: 'profile_points', title: 'คะแนนรวมทั้งหมด', description: 'ที่นี่จะแสดงจำนวนคะแนนทั้งหมดที่คุณได้รับมาจากการทำกิจกรรมต่างๆ', targetKey: 'profile_points_card', screen: '/profile' },
                { id: 'profile_rank_up', title: 'เงื่อนไขการเลื่อนระดับ (Rank Up)', description: 'เมื่อคุณสะสม EXP จนเต็มระดับ, มีคะแนนครบ และสำเร็จภารกิจ Challenge คุณสามารถกดปุ่มนี้เพื่อ Rank Up สู่ระดับถัดไปได้!', targetKey: 'profile_rank_up_card', screen: '/profile' },
            ]);
        }
    }, [isComplete, isLoading]);

    // Format today's date
    return (
        <View style={homePageController.styles.container}>
            <View style={{ paddingTop: Platform.OS === 'web' ? 20 : 50, paddingHorizontal: 20, backgroundColor: '#FFFFFF' }}>
                <TutorialTarget tutorialKey="home_header">
                    <Header
                        userName={homePageController.userName}
                        userAvatar={homePageController.userAvatar}
                        date={(() => {
                            const found = homePageController.weekDays.find(d => d.date === homePageController.selectedDate);
                            if (found && found.fullDate) {
                                return new Date(found.fullDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                });
                            }
                            return new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        })()}
                    />
                </TutorialTarget>
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


                <TutorialTarget tutorialKey="home_missions" borderRadius={24}>
                    <MissionCard useHomePageController={homePageController} />
                </TutorialTarget>

                <CalendarWeek
                    days={homePageController.weekDays}
                    selectedDate={homePageController.selectedDate}
                    onSelectDate={homePageController.setSelectedDate}
                />

                <TutorialTarget tutorialKey="home_routines" borderRadius={24}>
                    <RoutineList routines={homePageController.routines} />
                </TutorialTarget>
            </ScrollView>
        </View>
    );
};



export default HomePage;
