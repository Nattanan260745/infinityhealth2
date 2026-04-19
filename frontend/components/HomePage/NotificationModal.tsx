import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationItem } from './NotificationItem';

interface NotificationModalProps {
    visible: boolean;
    onClose: () => void;
    notifications: any[];
    onDelete: (id: number) => void;
    onClearAll: () => void;
    onMarkAllAsRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
    visible,
    onClose,
    notifications,
    onDelete,
    onClearAll,
    onMarkAllAsRead
}) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.modalOverlay} 
                activeOpacity={1} 
                onPress={onClose}
            >
                <TouchableOpacity 
                    activeOpacity={1} 
                    style={styles.notificationContainer}
                >
                    <View style={styles.notificationHeader}>
                        <View>
                            <Text style={styles.notificationTitle}>Notifications</Text>
                            {unreadCount > 0 && (
                                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                                    You have {unreadCount} unread messages
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <NotificationItem
                                    key={notif.id}
                                    {...notif}
                                    onDelete={() => onDelete(notif.id)}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
                                <Text style={styles.emptyText}>No notifications yet</Text>
                            </View>
                        )}
                    </ScrollView>

                    {notifications.length > 0 && (
                        <View style={styles.footer}>
                            <TouchableOpacity 
                                style={[styles.footerButton, { backgroundColor: '#F3F4F6' }]}
                                onPress={onMarkAllAsRead}
                            >
                                <Text style={[styles.footerButtonText, { color: '#4B5563' }]}>Read All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.footerButton, { backgroundColor: '#FEE2E2' }]}
                                onPress={onClearAll}
                            >
                                <Text style={[styles.footerButtonText, { color: '#EF4444' }]}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    notificationContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        width: '100%',
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    notificationTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    emptyContainer: {
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingTop: 16,
        gap: 12,
    },
    footerButton: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerButtonText: {
        fontSize: 14,
        fontWeight: '700',
    }
});
