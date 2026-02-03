import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    icon?: React.ReactNode;
    showCancel?: boolean;
}

export default function CustomAlert({
    visible,
    title,
    message,
    onClose,
    onConfirm,
    confirmText = "OK",
    icon,
    showCancel = true
}: CustomAlertProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            {/* Blue Line Indicator */}
                            <LinearGradient
                                colors={['#4F46E5', '#7C3AED']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.headerLine}
                            />

                            <View style={styles.content}>
                                {icon && (
                                    <View style={{ marginBottom: 16 }}>
                                        {icon}
                                    </View>
                                )}
                                <Text style={styles.title}>{title}</Text>
                                <Text style={styles.message}>{message}</Text>
                            </View>

                            <View style={styles.buttonContainer}>
                                {onConfirm && (
                                    <TouchableOpacity
                                        onPress={onConfirm}
                                        style={[styles.buttonWrapper, showCancel && { marginRight: 10 }]}
                                    >
                                        <LinearGradient
                                            colors={['#4F46E5', '#7C3AED']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.button}
                                        >
                                            <Text style={styles.buttonText}>{confirmText}</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}

                                {showCancel && (
                                    <TouchableOpacity onPress={onClose} style={[styles.buttonWrapper, !onConfirm && { flex: 1 }]}>
                                        <View style={[styles.button, styles.closeButton]}>
                                            <Text style={[styles.buttonText, { color: '#6B7280' }]}>
                                                {onConfirm ? 'Cancel' : 'Close'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        width: '100%',
        maxWidth: 320,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    headerLine: {
        height: 6,
        width: '100%',
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        padding: 20,
        paddingTop: 0,
        justifyContent: 'center',
    },
    buttonWrapper: {
        flex: 1,
    },
    button: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButton: {
        backgroundColor: '#F3F4F6',
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
        color: 'white',
    },
});
