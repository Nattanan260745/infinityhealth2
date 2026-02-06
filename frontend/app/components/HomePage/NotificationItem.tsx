import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';

export interface NotificationItemProps {
    id: string | number;
    title: string;
    subtitle: string;
    time: string;
    type: string;
    isRead: boolean;
    onPress: () => void;
    onDelete: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ id, title, subtitle, time, type, isRead, onPress, onDelete }) => {
    // Config based on type
    const getConfig = () => {
        // If READ, use Gray/Dimmed colors
        if (isRead) {
            return { icon: 'mail-open-outline', color: '#9CA3AF', bgColor: '#F3F4F6', iconColor: '#9CA3AF' };
        }

        switch (type) {
            case 'ROUTINE_REMINDER':
            case 'planner':
                return { icon: 'calendar', color: '#EF4444', bgColor: '#FEE2E2', iconColor: '#B91C1C' }; // Red-ish
            case 'MISSION_COMPLETED':
            case 'mission':
                return { icon: 'clipboard', color: '#F59E0B', bgColor: '#FEF3C7', iconColor: '#B45309' }; // Yellow/Orange
            case 'SYSTEM':
            case 'success':
                return { icon: 'information-circle', color: '#10B981', bgColor: '#D1FAE5', iconColor: '#047857' }; // Green
            case 'LEVEL_UP':
            case 'rankup':
                return { icon: 'trending-up', color: '#3B82F6', bgColor: '#DBEAFE', iconColor: '#1D4ED8' }; // Blue
            default:
                return { icon: 'notifications', color: '#6B7280', bgColor: '#F3F4F6', iconColor: '#374151' };
        }
    };

    const config = getConfig();
    const DELETE_WIDTH = 80;
    const translateX = React.useRef(new Animated.Value(0)).current;

    const onGestureEvent = Animated.event<PanGestureHandlerGestureEvent>(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationX } = event.nativeEvent;
            let toValue = 0;
            if (translationX < -40) {
                toValue = -DELETE_WIDTH;
            } else {
                toValue = 0;
            }

            Animated.spring(translateX, {
                toValue,
                useNativeDriver: true,
                friction: 5,
                tension: 40
            }).start();
            translateX.setOffset(toValue);
            translateX.setValue(0);
        }
    };

    const deleteTranslateX = translateX.interpolate({
        inputRange: [-DELETE_WIDTH, 0],
        outputRange: [0, DELETE_WIDTH],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.wrapper}>
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
                activeOffsetX={[-10, 10]}
            >
                <Animated.View style={styles.container}>
                    {/* The Content Card */}
                    <Pressable onPress={onPress} style={[styles.innerContainer, isRead && styles.readContainer]}>
                        <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
                            <Ionicons name={config.icon as any} size={24} color={config.color} />
                            {!isRead && (
                                <View style={styles.unreadDot} />
                            )}
                        </View>
                        <View style={styles.contentContainer}>
                            <View style={styles.headerRow}>
                                <Text style={[styles.title, isRead && styles.readText]}>{title}</Text>
                                <Text style={styles.time}>{time}</Text>
                            </View>
                            <Text style={[styles.subtitle, isRead && styles.readText]} numberOfLines={2}>{subtitle}</Text>
                        </View>
                    </Pressable>

                    {/* The Delete Button Overlay */}
                    <Animated.View style={[styles.deleteButtonContainer, { transform: [{ translateX: deleteTranslateX }] }]}>
                        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={32} color="#FFFFFF" />
                        </TouchableOpacity>
                    </Animated.View>

                </Animated.View>
            </PanGestureHandler>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
    },
    container: {
        width: '100%',
    },
    innerContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    readContainer: {
        backgroundColor: '#FAFAFA',
        borderColor: 'transparent',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        position: 'relative',
    },
    unreadDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#F74C06',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    contentContainer: {
        flex: 1,
        paddingRight: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    readText: {
        color: '#9CA3AF',
        fontWeight: 'normal',
    },
    time: {
        fontSize: 12,
        color: '#9CA3AF',
        marginLeft: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    deleteButtonContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: 80,
    },
    deleteButton: {
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    }
});
