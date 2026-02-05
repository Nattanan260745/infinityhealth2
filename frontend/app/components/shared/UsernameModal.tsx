import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';

interface UsernameModalProps {
    visible: boolean;
    currentName: string;
    onClose: () => void;
    onSave: (newName: string) => Promise<void>;
}

export default function UsernameModal({ visible, currentName, onClose, onSave }: UsernameModalProps) {
    const [name, setName] = useState(currentName);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setName(currentName);
        }
    }, [visible, currentName]);

    const handleSave = async () => {
        if (!name.trim()) return;
        setIsLoading(true);
        try {
            await onSave(name);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.container}
                    >
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.title}>Change Your Name</Text>
                                <Text style={styles.subtitle}>Enter your new display name</Text>

                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Your Name"
                                    autoFocus={true}
                                />

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={handleSave}
                                        style={[styles.button, styles.saveButton]}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <Text style={styles.saveText}>Save</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
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
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1F2937',
        marginBottom: 24,
        backgroundColor: '#F9FAFB',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    saveButton: {
        backgroundColor: '#7DD1E0',
    },
    cancelText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 16,
    },
    saveText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});
