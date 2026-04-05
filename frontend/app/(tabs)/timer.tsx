import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimer } from '../hook/useTimer';

export default function TimerPage() {
    const { time, isRunning, start, pause, reset, formattedTime } = useTimer();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Stopwatch</Text>
            </View>

            <View style={styles.timerContainer}>
                {/* Outer Circular Progress Ring approximation */}
                <View style={[styles.circle, isRunning && styles.circleActive]}>
                    <Text style={styles.timeText}>
                        {formattedTime.hours !== '00' ? `${formattedTime.hours}:` : ''}
                        {formattedTime.minutes}:{formattedTime.seconds}
                    </Text>
                    {time > 0 && !isRunning && (
                        <Text style={styles.pausedText}>PAUSED</Text>
                    )}
                </View>
            </View>

            <View style={styles.controlsContainer}>
                {/* Reset Button */}
                <TouchableOpacity 
                    style={[styles.smallButton, time === 0 && styles.buttonDisabled]} 
                    onPress={reset}
                    disabled={time === 0}
                >
                    <Ionicons name="refresh" size={24} color={time === 0 ? "#9CA3AF" : "#4B5563"} />
                </TouchableOpacity>

                {/* Main Play/Pause Button */}
                <TouchableOpacity 
                    style={[styles.mainButton, isRunning ? styles.pauseButton : styles.playButton]} 
                    onPress={isRunning ? pause : start}
                >
                    <Ionicons 
                        name={isRunning ? "pause" : "play"} 
                        size={40} 
                        color="#FFFFFF" 
                        style={{ marginLeft: isRunning ? 0 : 6 }} // center play icon visually
                    />
                </TouchableOpacity>

                {/* Placeholder for symmetry */}
                <View style={styles.smallButtonPlaceholder} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    header: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    timerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 4,
        borderColor: '#E5E7EB',
    },
    circleActive: {
        borderColor: '#7DD1E0',
    },
    timeText: {
        fontSize: 56,
        fontWeight: '300',
        color: '#1F2937',
        fontVariant: ['tabular-nums'], // keeps numbers monospaced
    },
    pausedText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#EF4444',
        letterSpacing: 2,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60,
        gap: 24,
    },
    mainButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    playButton: {
        backgroundColor: '#7DD1E0',
    },
    pauseButton: {
        backgroundColor: '#F87171',
    },
    smallButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#F3F4F6',
    },
    smallButtonPlaceholder: {
        width: 50,
        height: 50,
    }
});
