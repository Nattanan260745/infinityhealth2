import { CalendarDay, Routine, Mission } from "@/src/types";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { HealthCheckResponse } from "../interface/infinityhealth.interface";
import { getHealthCheck } from "../service/InfinityhealthApi";

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#FFFFFF'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: 300,
        maxHeight: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    unreadNotification: {
        backgroundColor: '#F0FDFA',
    },
    notificationDot: {
        width: 20,
        alignItems: 'center',
        paddingTop: 6,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#7DD1E0',
    },
    notificationText: {
        fontSize: 14,
        color: '#1F2937',
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});

const weekDays: CalendarDay[] = [
    { day: 'Sun', date: 14 },
    { day: 'Mon', date: 15 },
    { day: 'Tue', date: 16 },
    { day: 'Wed', date: 17 },
    { day: 'Thu', date: 18 },
    { day: 'Fri', date: 19 },
    { day: 'Sat', date: 20 },
];

const routines: Routine[] = [
    { id: 1, title: 'Clean Up', time: '13.00 A.M.', status: 'pending' },
    { id: 2, title: 'Go Shopping', time: '12.00 A.M.', status: 'completed' },
    { id: 3, title: 'Clean Up', time: '11.00 A.M.', status: 'cancelled' },
];

const missions: Mission[] = [
    { id: 1, title: 'Missions', subtitle: "Complete daily tasks", icon: '🎯' },
    { id: 2, title: 'Health Tracking', subtitle: 'Track your health', icon: '❤️' },
    { id: 3, title: 'Exercise', subtitle: 'Workout routines', icon: '💪' },
    { id: 4, title: 'Routine', subtitle: 'Self-Care Planner', icon: '📋' },
];

export const useHomePage = () => {
    const [selectedDate, setSelectedDate] = useState(15);
    const [currentMission, setCurrentMission] = useState(0);
    const [isLoad, setisLoad] = useState<boolean>(false);

    const getHealthCheckApi = async () => {
        if (isLoad) return;
        setisLoad(true);

        try {
            const res: HealthCheckResponse = await getHealthCheck();
            if (res) {
                setisLoad(false);
                console.log('Health check response:', res.status);
            }

        } catch (error) {
            console.error('Error fetching health check:', error);
            setisLoad(false);
        }
    }


    useEffect(() => {
        getHealthCheckApi();
    }, [])

    // useEffect(() => {
    //   console.log('selectedDate', selectedDate);
    // }, [selectedDate])
    


    return {
        styles,
        weekDays,
        routines,
        missions,
        selectedDate,
        setSelectedDate,
        currentMission,
        setCurrentMission,

        isLoad
    }
}

export type IuseHomePage = ReturnType<typeof useHomePage>;