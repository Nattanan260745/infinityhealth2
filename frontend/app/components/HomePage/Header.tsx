import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  userName: string;
  userAvatar: string;
  date: string;
  onNotificationPress?: () => void;
  onLogoutPress?: () => void;
}

export function Header({ userName, userAvatar, date, onNotificationPress, onLogoutPress }: HeaderProps) {
  return (
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      paddingVertical: 16,
      backgroundColor: '#FFFFFF' 
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={{ uri: userAvatar }}
          style={{ width: 44, height: 44, borderRadius: 22 }}
        />
        <View style={{ marginLeft: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937' }}>
            Hello, {userName}
          </Text>
          <Text style={{ fontSize: 12, color: '#9CA3AF' }}>{date}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={onNotificationPress}>
          <Ionicons name="notifications" size={26} color="#F5A623" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onLogoutPress}>
          <Ionicons name="log-out-outline" size={26} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
