import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DashBoardCard from '../components/SummaryDashBoard/DashBoardCard';
import { MetricType, StatCard } from '../interface/infinityhealth.interface';
import Filter from '../components/SummaryDashBoard/Filter';
import ChartSection from '../components/SummaryDashBoard/ChartSection';
import { useDashBoardPage } from '../hook/useDashBoardPage';


export default function DashboardPage() {

  const { selectedTab, setSelectedTab, maxValue, chartData, statCards, filterTabs, trendValue, trendDirection } = useDashBoardPage();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header - Fixed at top */}
      <View style={{
        paddingTop: Platform.OS === 'web' ? 40 : 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
      }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937' }}>
          Summary Dashboard
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        {/* Stats Grid */}
        <DashBoardCard statCards={statCards} />

        {/* Filter Tabs */}
        <Filter
          filterTabs={filterTabs}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />

        {/* Chart Section */}
        <ChartSection
          statCards={statCards}
          selectedTab={selectedTab}
          chartData={chartData}
          maxValue={maxValue}
          trendValue={trendValue}
          trendDirection={trendDirection}
        />
      </ScrollView>
    </View>
  );
}
