import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

export interface NotificationItemProps {
    id: string | number;
    title: string;
    subtitle: string;
    time: string;
    type: 'planner' | 'mission' | 'success' | 'rankup'; // To determine icon
    onDelete: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ id, title, subtitle, time, type, onDelete }) => {

    // Config based on type
    const getConfig = () => {
        switch (type) {
            case 'planner':
                return { icon: 'calendar', color: '#EF4444', bgColor: '#FEE2E2', iconColor: '#B91C1C' }; // Red-ish for Planner
            case 'mission':
                return { icon: 'clipboard', color: '#F59E0B', bgColor: '#FEF3C7', iconColor: '#B45309' }; // Yellow/Orange for Mission
            case 'success':
                return { icon: 'star', color: '#10B981', bgColor: '#D1FAE5', iconColor: '#047857' }; // Green for Success
            case 'rankup':
                return { icon: 'trending-up', color: '#3B82F6', bgColor: '#DBEAFE', iconColor: '#1D4ED8' }; // Blue for Rank Up
            default:
                return { icon: 'notifications', color: '#6B7280', bgColor: '#F3F4F6', iconColor: '#374151' };
        }
    };

    const config = getConfig();

    const renderRightActions = (progress: any, dragX: any) => {
        const trans = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                <Animated.View style={{ transform: [{ scale: trans }], alignItems: 'center' }}>
                    <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold', marginTop: 4 }}>Delete</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable renderRightActions={renderRightActions}>
            <View style={styles.container}>
                <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
                    <Ionicons name={config.icon as any} size={24} color={config.color} />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>{title}</Text>
                    </View>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                    {/* <Text style={styles.time}>{time}</Text> */}
                    {/* Time can be part of subtitle or separate, user design shows subtitle like '02.00 PM - Clean up' */}
                </View>
            </View>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#F3F4F6', // Light gray background like the image
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4B5563', // Gray-600
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280', // Gray-500
    },
    time: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
    deleteButton: {
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 90,
        height: '100%',
        borderRadius: 16, // Match container radius? Maybe problematic with swipe. 
        // Usually swipe actions are behind. But Swipeable from Gesture Handler handles this.
        // We might need a wrapper specifically for the swipe styling to match the card height/margins.
        marginBottom: 12,
        marginLeft: 8,
    }
});
