import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImagePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onTakePhoto: () => void;
    onChooseFromGallery: () => void;
}

const { width } = Dimensions.get('window');

export default function ImagePickerModal({ visible, onClose, onTakePhoto, onChooseFromGallery }: ImagePickerModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.titleContainer}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="camera" size={24} color="#7DD1E0" />
                        </View>
                        <Text style={styles.title}>Change Profile Photo</Text>
                    </View>

                    <TouchableOpacity style={styles.optionButton} onPress={onTakePhoto}>
                        <View style={[styles.optionIcon, { backgroundColor: '#E0F2FE' }]}>
                            <Ionicons name="camera-outline" size={22} color="#0EA5E9" />
                        </View>
                        <Text style={styles.optionText}>Take Photo</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionButton} onPress={onChooseFromGallery}>
                        <View style={[styles.optionIcon, { backgroundColor: '#F3E8FF' }]}>
                            <Ionicons name="images-outline" size={22} color="#A855F7" />
                        </View>
                        <Text style={styles.optionText}>Choose from Gallery</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.85,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        // alignItems: 'center', // Remove to allow full width flex
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        justifyContent: 'center'
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ECFEFF', // Cyan 50
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    optionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    cancelButton: {
        marginTop: 20,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
});
