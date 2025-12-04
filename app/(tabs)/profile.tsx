import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const menuItems = [
  { id: 1, icon: 'person-outline', title: 'Edit Profile', color: '#3B82F6' },
  { id: 2, icon: 'notifications-outline', title: 'Notifications', color: '#F59E0B' },
  { id: 3, icon: 'shield-checkmark-outline', title: 'Privacy & Security', color: '#10B981' },
  { id: 4, icon: 'help-circle-outline', title: 'Help & Support', color: '#8B5CF6' },
  { id: 5, icon: 'information-circle-outline', title: 'About', color: '#6B7280' },
];

const stats = [
  { label: 'Days Active', value: '28' },
  { label: 'Goals Done', value: '45' },
  { label: 'Streak', value: '7' },
];

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'web' ? 40 : 60,
          paddingBottom: 30,
        }}
      >
        {/* Profile Header */}
        <View style={{ alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#E0F2FE',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/100?img=47' }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>
            John Doe
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            john.doe@example.com
          </Text>
        </View>

        {/* Stats */}
        <View style={{
          flexDirection: 'row',
          marginHorizontal: 20,
          backgroundColor: '#F9FAFB',
          borderRadius: 16,
          padding: 16,
          marginBottom: 24,
        }}>
          {stats.map((stat, index) => (
            <View key={stat.label} style={{
              flex: 1,
              alignItems: 'center',
              borderRightWidth: index < stats.length - 1 ? 1 : 0,
              borderRightColor: '#E5E7EB',
            }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>
                {stat.value}
              </Text>
              <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Premium Banner */}
        <TouchableOpacity style={{
          marginHorizontal: 20,
          backgroundColor: '#FEF3C7',
          borderRadius: 16,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 24,
        }}>
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#F59E0B',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
            <Ionicons name="star" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
              Upgrade to Premium
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
              Unlock all features and benefits
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 12 }}>
            SETTINGS
          </Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
              }}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: `${item.color}15`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={{ flex: 1, fontSize: 16, color: '#1F2937' }}>
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={{
          marginHorizontal: 20,
          marginTop: 24,
          backgroundColor: '#FEE2E2',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#EF4444' }}>
            Log Out
          </Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={{
          textAlign: 'center',
          color: '#9CA3AF',
          fontSize: 12,
          marginTop: 24,
        }}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
