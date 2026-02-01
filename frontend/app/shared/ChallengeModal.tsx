import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Mission } from '../interface/infinityhealth.interface';

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
                            {/* Header Icon */}
                            <View style={styles.iconContainer}>
                                <Ionicons name="trophy" size={32} color="#A855F7" />
                            </View>

                            <Text style={styles.title}>Level Up Challenge!</Text>

                            <Text style={styles.description}>
                                To reach Level {challenge.min_level + 1}, you must prove your strength.
                            </Text>

                            {/* Challenge Card */}
                            <View style={styles.challengeCard}>
                                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                                <Text style={styles.challengeDesc}>{challenge.description}</Text>
                                <View style={styles.rewardContainer}>
                                    <Text style={styles.rewardText}>🏆 {challenge.reward_points} Points</Text>
                                    <Text style={styles.rewardText}>⭐ {challenge.reward_exp} EXP</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={onGoToMission}
                                style={styles.actionButton}
                            >
                                <Text style={styles.actionButtonText}>Go to Mission</Text>
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3E8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    challengeCard: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    challengeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    challengeDesc: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
    },
    rewardContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    rewardText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#A855F7',
    },
    actionButton: {
        width: '100%',
        backgroundColor: '#A855F7',
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 12,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        paddingVertical: 8,
    },
    closeButtonText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '600',
    },
});
