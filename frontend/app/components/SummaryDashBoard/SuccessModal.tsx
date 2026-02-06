import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SuccessModalProps {
    visible: boolean;
    message: string;
    onClose: () => void;
}

export default function SuccessModal({ visible, message, onClose }: SuccessModalProps) {
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Reset values
            scaleValue.setValue(0);
            opacityValue.setValue(0);

            // Animate In
            Animated.parallel([
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleValue, {
                    toValue: 1,
                    friction: 5,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto close after 1.5 seconds
            const timer = setTimeout(() => {
                handleClose();
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const handleClose = () => {
        Animated.timing(opacityValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.container,
                        {
                            opacity: opacityValue,
                            transform: [{ scale: scaleValue }],
                        },
                    ]}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="checkmark-circle" size={64} color="#10B981" />
                    </View>
                    <Text style={styles.title}>Success!</Text>
                    <Text style={styles.message}>{message}</Text>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent dark background
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: 'white',
        width: 280,
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});
