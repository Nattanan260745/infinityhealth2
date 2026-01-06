import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Header } from '../components/HomePage/Header';
import { MissionCard } from '../components/HomePage/MissionCard';
import { CalendarWeek } from '../components/HomePage/CalendarWeek';
import { RoutineList } from '../components/HomePage/RoutineList';
import { CalendarDay, Mission, Routine } from '@/src/types';
import { useHomePage } from '../hook/useHomePage';
import { Ionicons } from '@expo/vector-icons';


interface HomePageProps {

}

const notifications = [
    { id: 1, title: 'ถึงเวลาดื่มน้ำแล้ว! 💧', time: '10 นาทีที่แล้ว', read: false },
    { id: 2, title: 'อย่าลืมออกกำลังกายวันนี้ 🏃', time: '30 นาทีที่แล้ว', read: false },
    { id: 3, title: 'ยินดีด้วย! คุณทำภารกิจสำเร็จ 🎉', time: '1 ชั่วโมงที่แล้ว', read: true },
    { id: 4, title: 'เป้าหมายการนอนวันนี้สำเร็จ 😴', time: '2 ชั่วโมงที่แล้ว', read: true },
];

const HomePage: React.FC<HomePageProps> = (props) => {
    const useHomePageController = useHomePage();
    const [showNotification, setShowNotification] = useState(false);

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
                    userAvatar="https://i.pravatar.cc/100?img=47"
                    date={formattedDate}
                    onNotificationPress={() => setShowNotification(true)}
                    onLogoutPress={useHomePageController.handleLogout}
                />
            </View>

            {/* Notification Modal */}
            <Modal
                visible={showNotification}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowNotification(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowNotification(false)}>
                    <View style={useHomePageController.styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={useHomePageController.styles.notificationContainer}>
                                <View style={useHomePageController.styles.notificationHeader}>
                                    <Text style={useHomePageController.styles.notificationTitle}>การแจ้งเตือน</Text>
                                    <TouchableOpacity onPress={() => setShowNotification(false)}>
                                        <Ionicons name="close" size={24} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView style={{ maxHeight: 300 }}>
                                    {notifications.map((notif) => (
                                        <View
                                            key={notif.id}
                                            style={[
                                                useHomePageController.styles.notificationItem,
                                                !notif.read && useHomePageController.styles.unreadNotification
                                            ]}
                                        >
                                            <View style={useHomePageController.styles.notificationDot}>
                                                {!notif.read && <View style={useHomePageController.styles.unreadDot} />}
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={useHomePageController.styles.notificationText}>{notif.title}</Text>
                                                <Text style={useHomePageController.styles.notificationTime}>{notif.time}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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