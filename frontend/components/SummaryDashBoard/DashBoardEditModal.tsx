import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { MetricType } from '@/interface/infinityhealth.interface';
import { Ionicons } from '@expo/vector-icons';

interface DashBoardEditModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (value: string) => void;
    metricType: MetricType | null;
    currentValue?: string;
    unit?: string;
}

const cardIcons: Record<string, any> = {
    Weight: require('@/assets/images/weight.png'),
    Height: require('@/assets/images/height.png'),
    Water: require('@/assets/images/water.png'),
    Sleep: require('@/assets/images/sleep.png'),
    Steps: require('@/assets/images/step.png'),
};

export default function DashBoardEditModal({
    visible,
    onClose,
    onSave,
    metricType,
    currentValue,
    unit
}: DashBoardEditModalProps) {
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            setError(null);
            // Pre-fill with number only if possible, or empty
            const isCumulative = ['Water', 'Steps'].includes(metricType || '');
            if (isCumulative) {
                setValue(''); // Start empty for cumulative metrics
            } else {
                const numVal = currentValue ? currentValue.replace(/[^0-9.]/g, '') : '';
                setValue(numVal);
            }
        }
    }, [visible, currentValue, metricType]);

    if (!metricType) return null;

    const getTitle = () => {
        switch (metricType) {
            case 'Weight': return 'Edit Weight';
            case 'Height': return 'Edit Height';
            case 'Water': return 'Add Water';
            case 'Sleep': return 'Edit Sleep';
            case 'Steps': return 'Add Steps';
            default: return 'Edit';
        }
    };

    const getInputLabel = () => {
        switch (metricType) {
            case 'Weight': return 'Weight (kg)';
            case 'Height': return 'Height (cm)';
            case 'Water': return 'Amount (ml)';
            case 'Sleep': return 'Hours';
            case 'Steps': return 'Count';
            default: return 'Value';
        }
    };

    const getRecommendation = () => {
        switch (metricType) {
            case 'Water': return 'Recommended: 2000-3000 ml per day';
            case 'Sleep': return 'Recommended: 7-9 hours per night';
            case 'Steps': return 'Recommended: 10,000 steps per day';
            default: return '';
        }
    };

    const validateInput = (val: string): string | null => {
        if (!val.trim()) return 'Value cannot be empty.';

        const num = parseFloat(val);
        if (isNaN(num)) return 'Invalid number.';

        switch (metricType) {
            case 'Weight':
                if (num < 1 || num > 500) return 'Weight must be between 1 and 500 kg.';
                break;
            case 'Height':
                if (num < 10 || num > 300) return 'Height must be between 10 and 300 cm.';
                break;
            case 'Sleep':
                if (num < 0 || num > 24) return 'Sleep must be between 0 and 24 hours.';
                break;
            case 'Water':
                if (num < 1 || num > 5000) return 'Water amount must be between 1 and 5000 ml.';
                break;
            case 'Steps':
                if (num < 1 || num > 100000) return 'Steps must be between 1 and 100,000.';
                break;
        }
        return null;
    };

    const handleNumericInput = (text: string) => {
        let validText = '';
        // Determine if we allow decimals based on metric
        const isFloat = ['Weight', 'Height', 'Sleep', 'BMI'].includes(metricType || '');

        if (isFloat) {
            // Allow digits and one dot
            validText = text.replace(/[^0-9.]/g, '');
            // Prevent multiple dots
            if ((validText.match(/\./g) || []).length > 1) {
                return;
            }
            // Limit decimal places to 2
            if (validText.includes('.')) {
                const [int, dec] = validText.split('.');
                if (dec && dec.length > 2) {
                    return;
                }
            }
        } else {
            // Integers only for Water, Steps
            validText = text.replace(/[^0-9]/g, '');
        }
        setValue(validText);

        // Clear error when user types valid input (optional: could validate on fly)
        if (error) setError(null);
    };

    const handleSave = () => {
        const validationError = validateInput(value);
        if (validationError) {
            setError(validationError);
            return;
        }
        onSave(value);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.overlay}>
                        {/* Stop propagation when tapping the content card */}
                        <TouchableWithoutFeedback>
                            <View style={styles.container}>
                                {/* Header */}
                                <View style={styles.header}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {cardIcons[metricType] && (
                                            <Image
                                                source={cardIcons[metricType]}
                                                style={{ width: 24, height: 24, marginRight: 8 }}
                                                resizeMode="contain"
                                            />
                                        )}
                                        <Text style={styles.title}>{getTitle()}</Text>
                                    </View>
                                </View>

                                {/* Input */}
                                <Text style={styles.label}>{getInputLabel()}</Text>
                                <TextInput
                                    ref={(input) => {
                                        if (input && visible) {
                                            setTimeout(() => input.focus(), 100);
                                        }
                                    }}
                                    value={value}
                                    onChangeText={handleNumericInput}
                                    keyboardType="decimal-pad" // Changed to decimal-pad to allow dots on iOS
                                    placeholder={unit ? `0 ${unit}` : '0'}
                                    style={[styles.input, error ? styles.inputError : null]}
                                />
                                {error && (
                                    <Text style={styles.errorText}>{error}</Text>
                                )}

                                {getRecommendation() ? (
                                    <Text style={styles.recommendation}>{getRecommendation()}</Text>
                                ) : null}

                                {/* Save Button */}
                                <TouchableOpacity
                                    style={[
                                        styles.saveButton,
                                        { backgroundColor: '#FDBA74' },
                                        // Optional: Disable button visually if needed, currently handling via onSave check
                                    ]}
                                    onPress={handleSave}
                                >
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 25, // Rounder as per design
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
    },
    inputError: {
        borderColor: '#EF4444',
        borderWidth: 1,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginBottom: 8,
        marginTop: -4,
        marginLeft: 4,
    },
    recommendation: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
        marginBottom: 16,
    },
    saveButton: {
        marginTop: 12,
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    saveButtonText: {
        color: '#854D0E', // Darker text for contrast on yellow button
        fontWeight: '600',
        fontSize: 16,
    },
});
