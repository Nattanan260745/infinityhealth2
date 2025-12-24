import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  userName: string;
  userAvatar: string;
  date: string;
}

export function Header({ userName, userAvatar, date }: HeaderProps) {
  return (
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      paddingHorizontal: 20, 
      paddingVertical: 16,
      backgroundColor: 'red' 
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
      <TouchableOpacity>
        <Ionicons name="notifications" size={26} color="#F5A623" />
      </TouchableOpacity>
    </View>
  );
}
