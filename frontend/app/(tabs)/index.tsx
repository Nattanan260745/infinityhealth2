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
import { useTutorial } from '../context/TutorialContext';
import TutorialTarget from '../components/shared/TutorialTarget';
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

                { id: 'profile_summary', title: 'โปรไฟล์ของคุณ', description: 'ที่นี่คุณจะเห็นเลเวล, แต้มสะสม และอวาตาร์ของคุณ ยิ่งออกกำลังกายมาก เลเวลยิ่งสูงนะ!', targetKey: 'home_header' },
                { id: 'missions', title: 'ป้ายภารกิจ (เลื่อนซ้าย-ขวาได้นะ!)', description: 'ท้าทายตนเองด้วยภารกิจต่างๆ เพื่อรับแต้มและ EXP เพิ่มเติม 💡 คุณสามารถใช้นิ้วปัดเลื่อนซ้าย-ขวาที่กล่องนี้ เพื่อดูหมวดหมู่ออกกำลังกายและกิจวัตรอื่นๆ ต่อได้เวลาใช้งานจริงครับ', targetKey: 'home_missions' },
                { id: 'routines', title: 'กิจวัตรประจำวัน', description: 'ตารางเวลาการดูแลสุขภาพที่คุณตั้งไว้ จะปรากฏที่นี่เพื่อให้คุณไม่พลาดทุกกิจกรรม', targetKey: 'home_routines' },

                { id: 'tab_calendar', title: 'ปฏิทินกิจวัตร', description: 'ดูปฏิทินและเช็คตารางกิจวัตรประจำวันที่คุณตั้งไว้ในแต่ละวันได้ที่นี่', targetKey: 'tab_calendar' },

                { id: 'dashboard_edit', title: 'ปุ่มแก้ไขข้อมูล', description: 'กดที่ปุ่มรูปดินสอนี้เพื่ออัปเดตข้อมูลน้ำหนัก ส่วนสูง หรือปริมาณการดื่มน้ำ', targetKey: 'dashboard_edit_button', screen: '/DashBoardPage' },
                { id: 'dashboard_card', title: 'หน้าภาพรวมสุขภาพ (Dashboard)', description: 'เมื่อบันทึกข้อมูลแล้ว ค่าปัจจุบันของคุณจะถูกอัปเดตและแสดงสรุปผลให้เห็นบนหน้าจอนี้', targetKey: 'dashboard_weight_card', screen: '/DashBoardPage' },

                { id: 'profile_level_card', title: 'แถบค่าประสบการณ์ (Level)', description: 'ดูการเติบโตของคุณได้ที่หน้า Profile! ทุกครั้งที่ทำภารกิจหรือกิจวัตรสำเร็จ คุณจะได้รับ EXP เพื่ออัปเลเวลตัวเองนะ', targetKey: 'profile_level_card', screen: '/profile' },
            ]);
        }
    }, [isComplete, isLoading]);

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
                <TutorialTarget tutorialKey="home_header">
                    <Header
                        userName={homePageController.userName}
                        userAvatar={homePageController.userAvatar}
                        date={formattedDate}
                        unreadCount={homePageController.unreadCount}
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