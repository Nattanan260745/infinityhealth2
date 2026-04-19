import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimer } from '@/hook/useTimer';
import { WheelPicker } from '@/components/shared/WheelPicker';

export default function TimerPage() {
    const { 
        time, 
        isRunning, 
        isActive,
        start, 
        pause, 
        reset, 
        setTimeByHms, 
        formattedTime 
    } = useTimer();

    // Local states for the picker values
    const [h, setH] = useState(0);
    const [m, setM] = useState(0);
    const [s, setS] = useState(0);

    // Update local picker state when time changes (while NOT active/started)
    useEffect(() => {
        if (!isActive) {
            setH(parseInt(formattedTime.hours));
            setM(parseInt(formattedTime.minutes));
            setS(parseInt(formattedTime.seconds));
        }
    }, [time, isActive, formattedTime]);

    const handleValueChange = (newH: number, newM: number, newS: number) => {
        setH(newH);
        setM(newM);
        setS(newS);
        setTimeByHms(newH, newM, newS);
    };

    const hourData = Array.from({ length: 24 }, (_, i) => i);
    const minuteData = Array.from({ length: 60 }, (_, i) => i);
    const secondData = Array.from({ length: 60 }, (_, i) => i);

    const isStopped = isActive && !isRunning;
    const isInitial = !isActive;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Timer</Text>
            </View>

            <View style={styles.timerContainer}>
                {isInitial ? (
                    <View style={styles.pickerContainer}>
                        <View style={styles.wheelWrapper}>
                            <WheelPicker 
                                data={hourData} 
                                selectedValue={h} 
                                onValueChange={(val) => handleValueChange(val, m, s)}
                                label="h"
                            />
                        </View>
                        <View style={styles.wheelWrapper}>
                            <WheelPicker 
                                data={minuteData} 
                                selectedValue={m} 
                                onValueChange={(val) => handleValueChange(h, val, s)}
                                label="m"
                            />
                        </View>
                        <View style={styles.wheelWrapper}>
                            <WheelPicker 
                                data={secondData} 
                                selectedValue={s} 
                                onValueChange={(val) => handleValueChange(h, m, val)}
                                label="s"
                            />
                        </View>
                    </View>
                ) : (
                    <View style={[styles.circle, isRunning && styles.circleActive]}>
                        <Text style={styles.timeText}>
                            {formattedTime.hours !== '00' ? `${formattedTime.hours}:` : ''}
                            {formattedTime.minutes}:{formattedTime.seconds}
                        </Text>
                        {isStopped && (
                            <Text style={styles.pausedText}>PAUSED</Text>
                        )}
                    </View>
                )}
            </View>

            <View style={styles.controlsContainer}>
                {/* Reset Button */}
                <TouchableOpacity 
                    style={[styles.smallButton, !isActive && styles.buttonDisabled]} 
                    onPress={reset}
                    disabled={!isActive}
                >
                    <Ionicons 
                        name={isRunning ? "square" : "refresh"} 
                        size={isRunning ? 20 : 24} 
                        color={!isActive ? "#9CA3AF" : "#4B5563"} 
                    />
                </TouchableOpacity>

                {/* Main Play/Pause Button */}
                <TouchableOpacity 
                    style={[styles.mainButton, isRunning ? styles.pauseButton : styles.playButton, (time === 0 && !isRunning) && styles.buttonDisabled]} 
                    onPress={isRunning ? pause : start}
                    disabled={time === 0 && !isRunning}
                >
                    <Ionicons 
                        name={isRunning ? "pause" : "play"} 
                        size={40} 
                        color="#FFFFFF" 
                        style={{ marginLeft: isRunning ? 0 : 6 }} 
                    />
                </TouchableOpacity>

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
        paddingVertical: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    timerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerContainer: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 20,
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelWrapper: {
        flex: 1,
        height: '100%',
    },
    circle: {
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 6,
        borderColor: '#E5E7EB',
    },
    circleActive: {
        borderColor: '#7DD1E0',
    },
    timeText: {
        fontSize: 64,
        fontWeight: '300',
        color: '#1F2937',
        fontVariant: ['tabular-nums'],
    },
    pausedText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F87171',
        letterSpacing: 2,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 80,
        gap: 40,
    },
    mainButton: {
        width: 88,
        height: 88,
        borderRadius: 44,
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
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#F3F4F6',
        opacity: 0.6,
    },
    smallButtonPlaceholder: {
        width: 56,
        height: 56,
    }
});
