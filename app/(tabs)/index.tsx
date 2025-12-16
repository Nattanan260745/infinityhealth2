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

    const {styles, weekDays, routines, missions, selectedDate, setSelectedDate, currentMission, setCurrentMission } = useHomePage();
    const [showNotification, setShowNotification] = useState(false);

    return (
        <View style={styles.container}>
            <View style={{paddingTop: Platform.OS === 'web' ? 20 : 50, paddingHorizontal: 20, backgroundColor: '#FFFFFF' }}>
                <Header
                    userName="Tutor"
                    userAvatar="https://i.pravatar.cc/100?img=47"
                    date="Today 12 Nov 27"
                    onNotificationPress={() => setShowNotification(true)}
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
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.notificationContainer}>
                                <View style={styles.notificationHeader}>
                                    <Text style={styles.notificationTitle}>การแจ้งเตือน</Text>
                                    <TouchableOpacity onPress={() => setShowNotification(false)}>
                                        <Ionicons name="close" size={24} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView style={{ maxHeight: 300 }}>
                                    {notifications.map((notif) => (
                                        <View 
                                            key={notif.id} 
                                            style={[
                                                styles.notificationItem,
                                                !notif.read && styles.unreadNotification
                                            ]}
                                        >
                                            <View style={styles.notificationDot}>
                                                {!notif.read && <View style={styles.unreadDot} />}
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.notificationText}>{notif.title}</Text>
                                                <Text style={styles.notificationTime}>{notif.time}</Text>
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



export default HomePage;