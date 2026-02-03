import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Mission } from '../interface/infinityhealth.interface';
import { LinearGradient } from 'expo-linear-gradient';

interface ChallengeModalProps {
    visible: boolean;
    onClose: () => void;
    challenge: Mission | null;
    onGoToMission: () => void;
}

export default function ChallengeModal({
    visible,
    onClose,
    challenge,
    onGoToMission,
}: ChallengeModalProps) {
    if (!challenge) return null;

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
                            {/* Header Gradient */}
                            <LinearGradient
                                colors={['#4F46E5', '#7C3AED']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.iconContainer}
                            >
                                <Ionicons name="trophy" size={32} color="#FFD700" />
                            </LinearGradient>

                            <Text style={styles.title}>Level Up Challenge!</Text>

                            <Text style={styles.description}>
                                To reach Level {challenge.min_level + 1}, you must prove your strength.
                            </Text>

                            {/* Challenge Card */}
                            <View style={styles.challengeCard}>
                                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                                <Text style={styles.challengeDesc}>{challenge.description}</Text>
                                <View style={styles.rewardContainer}>
                                    <View style={styles.rewardBadge}>
                                        <Text style={styles.rewardText}>🏆 {challenge.reward_points} pts</Text>
                                    </View>
                                    <View style={styles.rewardBadge}>
                                        <Text style={styles.rewardText}>⭐ {challenge.reward_exp} EXP</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={onGoToMission}
                                activeOpacity={0.8}
                                style={{ width: '100%' }}
                            >
                                <LinearGradient
                                    colors={['#4F46E5', '#7C3AED']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.actionButton}
                                >
                                    <Text style={styles.actionButtonText}>Go to Mission</Text>
                                    <Ionicons name="arrow-forward" size={18} color="white" style={{ marginLeft: 8 }} />
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    challengeCard: {
        width: '100%',
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    challengeTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },
    challengeDesc: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 16,
        lineHeight: 20,
    },
    rewardContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    rewardBadge: {
        backgroundColor: '#EDE9FE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DDD6FE',
    },
    rewardText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#7C3AED',
    },
    actionButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    closeButtonText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '600',
    },
});
