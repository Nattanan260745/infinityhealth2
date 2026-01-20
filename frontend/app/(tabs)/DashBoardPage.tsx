import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DashBoardCard from '../components/SummaryDashBoard/DashBoardCard';
import { MetricType, StatCard } from '../interface/infinityhealth.interface';
import Filter from '../components/SummaryDashBoard/Filter';
import ChartSection from '../components/SummaryDashBoard/ChartSection';
import { useDashBoardPage } from '../hook/useDashBoardPage';
import DashBoardEditModal from '../components/SummaryDashBoard/DashBoardEditModal';
import { saveHealthData } from '../service/InfinityhealthApi';
import storage from '../utils/storage';


import { useRouter } from 'expo-router';

export default function DashboardPage() {
  const router = useRouter();
  const { selectedTab, setSelectedTab, maxValue, chartData, statCards, filterTabs, trendValue, trendDirection, fetchData, handleDataPointClick, selectedPointIndex } = useDashBoardPage();
  /* Modal State */
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMetric, setEditingMetric] = useState<MetricType | null>(null);

  const handleEdit = (metric: MetricType) => {
    setEditingMetric(metric);
    setModalVisible(true);
  };

  const handleSave = async (value: string) => {
    try {
      const userId = await storage.getItem('userId');
      if (!userId) {
        console.error('User not found');
        return;
      }

      // Check for valid number
      const numVal = parseFloat(value);
      if (isNaN(numVal)) {
        // simple validation or alert could go here
        setModalVisible(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0]; // Send YYYY-MM-DD
      const payload: any = {
        date: today,
      };

      // Map metric to payload key
      // Map metric to payload key
      switch (editingMetric) {
        case 'Weight': payload.weight = numVal; break;
        case 'Height': payload.height = numVal; break;
        case 'Water':
          // Water accumulates
          const currentWater = parseFloat((getCurrentValue() || '0').replace('-', '0')) || 0;
          payload.water = currentWater + numVal;
          break;
        case 'Sleep':
          // Sleep overwrites or accumulates? Usually daily sleep is entered as total or sessions.
          // Let's assume overwrite or single entry for now based on UI "Edit".
          // Actually user might want to add. But for "sleepHours", usually it's "I slept 8 hours".
          payload.sleepHours = numVal;
          payload.sleep_hours = numVal;
          break;
        case 'Steps':
          // Steps accumulate
          const currentSteps = parseFloat((getCurrentValue() || '0').replace('-', '0')) || 0;
          payload.stepsCount = currentSteps + numVal;
          payload.steps_count = currentSteps + numVal;
          break;
        default: break;
      }

      const response = await saveHealthData(userId, payload);
      if (response && response.success) {
        // Refresh data
        await fetchData();
      }

    } catch (error) {
      console.error('Failed to save health data:', error);
    } finally {
      setModalVisible(false);
      setEditingMetric(null);
    }
  };

  // Get current value for modal
  const getCurrentValue = () => {
    if (!editingMetric) return '';
    const card = statCards.find(c => c.id === editingMetric);
    return card ? card.value : '';
  };

  const getCurrentUnit = () => {
    if (!editingMetric) return '';
    const card = statCards.find(c => c.id === editingMetric);
    return card ? card.unit : '';
  };

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
        <DashBoardCard
          statCards={statCards}
          selectedId={selectedTab}
          onCardPress={(id) => {
            // If clicking specific metric in future, can navigate or select
            // For now maybe we keep navigation or just select chart tab?
            // Original: router.push({ pathname: '/health-detail', params: { metric: id } });
            // Let's keep detail view navigation, but maybe specific generic tap logic
            router.push({ pathname: '/health-detail', params: { metric: id } });
            setSelectedTab(id); // Also update chart selection
          }}
          onEdit={handleEdit}
        />

        {/* Filter Tabs (Metric) */}
        <Filter
          filterTabs={filterTabs}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />

        {/* Chart Section - Read Only */}
        <ChartSection
          statCards={statCards}
          selectedTab={selectedTab}
          chartData={chartData}
          maxValue={maxValue}
          trendValue={trendValue}
          trendDirection={trendDirection}
          onDataPointClick={handleDataPointClick}
          selectedPointIndex={selectedPointIndex}
        />
      </ScrollView>

      {/* Edit Modal */}
      <DashBoardEditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        metricType={editingMetric}
        currentValue={getCurrentValue()}
        unit={getCurrentUnit()}
      />
    </View>
  );
}
