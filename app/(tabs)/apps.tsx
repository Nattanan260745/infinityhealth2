import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

type MetricType = 'Weight' | 'Height' | 'BMI' | 'Water' | 'Sleep' | 'Steps';

interface StatCard {
  id: MetricType;
  icon: string;
  iconColor: string;
  value: string;
  unit: string;
  bgColor: string;
}

const statCards: StatCard[] = [
  { id: 'Weight', icon: 'bag-handle', iconColor: '#22C55E', value: '80', unit: 'kilogram', bgColor: '#DCFCE7' },
  { id: 'Height', icon: 'swap-vertical', iconColor: '#F59E0B', value: '175', unit: 'cm', bgColor: '#FEF9C3' },
  { id: 'BMI', icon: 'options', iconColor: '#14B8A6', value: '26.12', unit: '', bgColor: '#CCFBF1' },
  { id: 'Water', icon: 'water', iconColor: '#3B82F6', value: '1500', unit: 'millilitre', bgColor: '#DBEAFE' },
  { id: 'Sleep', icon: 'moon', iconColor: '#EAB308', value: '7', unit: 'hours', bgColor: '#FEF3C7' },
  { id: 'Steps', icon: 'footsteps', iconColor: '#10B981', value: '8000', unit: 'steps', bgColor: '#D1FAE5' },
];

const chartData = [
  { date: '1/8', value: 45 },
  { date: '2/8', value: 78 },
  { date: '3/8', value: 65 },
  { date: '4/8', value: 55 },
  { date: '5/8', value: 48 },
  { date: '6/8', value: 80 },
];

const filterTabs: MetricType[] = ['Weight', 'Height', 'BMI', 'Water', 'Sleep'];

export default function DashboardScreen() {
  const [selectedTab, setSelectedTab] = useState<MetricType>('Weight');

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: Platform.OS === 'web' ? 40 : 60,
          paddingBottom: 30,
          paddingHorizontal: 20,
        }}
      >
        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
          Summary Dashboard
        </Text>

        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {statCards.map((card) => (
            <View
              key={card.id}
              style={{
                width: CARD_WIDTH,
                backgroundColor: card.bgColor,
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name={card.icon as any} size={18} color={card.iconColor} />
                <Text style={{ marginLeft: 6, fontSize: 14, color: '#4B5563' }}>{card.id}</Text>
              </View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937' }}>
                {card.value}
              </Text>
              {card.unit && (
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{card.unit}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8, marginBottom: 20 }}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: selectedTab === tab ? '#1F2937' : '#F3F4F6',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: selectedTab === tab ? '#FFFFFF' : '#6B7280',
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chart Section */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: '#F3F4F6',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {/* Chart Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>{selectedTab}</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginTop: 4 }}>
                {statCards.find(c => c.id === selectedTab)?.value} {selectedTab === 'Weight' ? 'kg' : statCards.find(c => c.id === selectedTab)?.unit}
              </Text>
            </View>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: '#FEE2E2', 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 12 
            }}>
              <Ionicons name="arrow-down" size={12} color="#EF4444" />
              <Text style={{ fontSize: 12, color: '#EF4444', marginLeft: 2 }}>0.8</Text>
            </View>
          </View>

          {/* Chart */}
          <View style={{ height: 150, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {/* Y-axis labels */}
            <View style={{ position: 'absolute', left: 0, top: 0, bottom: 20, justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, color: '#9CA3AF' }}>80</Text>
              <Text style={{ fontSize: 10, color: '#9CA3AF' }}>60</Text>
              <Text style={{ fontSize: 10, color: '#9CA3AF' }}>40</Text>
              <Text style={{ fontSize: 10, color: '#9CA3AF' }}>20</Text>
            </View>

            {/* Bars */}
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', marginLeft: 30 }}>
              {chartData.map((item, index) => {
                const barHeight = (item.value / maxValue) * 100;
                const isHighlighted = index === 1 || index === 5;
                return (
                  <View key={index} style={{ alignItems: 'center' }}>
                    <View
                      style={{
                        width: 20,
                        height: barHeight,
                        backgroundColor: isHighlighted 
                          ? (index === 1 ? '#86EFAC' : '#93C5FD')
                          : '#E5E7EB',
                        borderRadius: 4,
                        marginBottom: 8,
                      }}
                    />
                    <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{item.date}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Arrow indicator */}
          <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
            <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
