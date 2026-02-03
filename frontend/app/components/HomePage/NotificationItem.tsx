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

import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';

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
    const DELETE_WIDTH = 80;
    const translateX = React.useRef(new Animated.Value(0)).current;

    const onGestureEvent = Animated.event<PanGestureHandlerGestureEvent>(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationX } = event.nativeEvent;
            // Snapping logic
            // If dragged left enough (e.g., -40), snap to open (-DELETE_WIDTH)
            // Otherwise snap back to 0
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

            // Hack: If we snap to open, lock the value so further drags start from there?
            // Actually PanGesture resets translationX to 0 on new gesture.
            // Complex handling needed for true 'stateful' drawer properly.
            // Simplified: Just use offset.
            translateX.setOffset(toValue);
            translateX.setValue(0);
        }
    };

    // BUT simplify: PanGesture is tricky for persistent state without re-renders.
    // Let's rely on interpolated Clamp for visual, but we need state to know if "Open".
    // Actually, Re-implementing Swipeable logic custom is error prone.
    // Let's use a simpler "Overlay" approach with standard Animated.

    // RE-EVALUATION: The user wants "Delete Button Appears, Content Static".
    // This is EXACTLY standard Swipeable IF we use the 'container' as background and 'children' as foreground?
    // NO. Standard Swipeable moves the FOREGROUND.
    // We want FOREGROUND (Card) to stay.
    // That means Card is NOT the swipeable part?
    // OR we translate Card by 0?

    // Let's stick to the Custom PanGesture for exact control.
    // Actually, simpler logic:
    // Drag -> updates displacement.
    // UI:
    //  - Layer 1 (Bottom): Delete Button (Absolute Right).
    //  - Layer 2 (Top): content Card.
    // Animation: Move Layer 1 Left? OR Move Layer 2 Left?
    // User said: "Mission stays still". Content = Layer 2. So Layer 2 Static.
    // Then Layer 1 (Delete Button) must move LEFT *over* Layer 2?
    // "Slide to make delete button appear"
    // Visual: Delete button enters from Right Edge, covering content.

    const deleteTranslateX = translateX.interpolate({
        inputRange: [-DELETE_WIDTH, 0],
        outputRange: [0, DELETE_WIDTH], // 0 = fully visible (at right edge), DELETE_WIDTH = hidden offscreen right
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.wrapper}>
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
                activeOffsetX={[-10, 10]} // Only activate horizontal
            >
                <Animated.View style={styles.container}>
                    {/* The Content Card (Static visually, but acts as gestures source) */}
                    <View style={[styles.innerContainer]}>
                        <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
                            <Ionicons name={config.icon as any} size={24} color={config.color} />
                        </View>
                        <View style={styles.contentContainer}>
                            <View style={styles.headerRow}>
                                <Text style={styles.title}>{title}</Text>
                            </View>
                            <Text style={styles.subtitle}>{subtitle}</Text>
                        </View>
                    </View>

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
        overflow: 'hidden', // Clip the sliding button
        backgroundColor: 'transparent', // Let inner container handle background
    },
    container: {
        width: '100%', // Ensure gesture surface fills width
    },
    innerContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        alignItems: 'center',
        width: '100%', // Ensure content fills width
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
        paddingRight: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4B5563',
        flexShrink: 1,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        flexShrink: 1,
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
        // Square edge requested
    }
});
