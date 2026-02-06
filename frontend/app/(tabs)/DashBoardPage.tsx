import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DashBoardCard from '../components/SummaryDashBoard/DashBoardCard';
import { MetricType, StatCard } from '../interface/infinityhealth.interface';
import Filter from '../components/SummaryDashBoard/Filter';
import ChartSection from '../components/SummaryDashBoard/ChartSection';
import { useDashBoardPage } from '../hook/useDashBoardPage';
import DashBoardEditModal from '../components/SummaryDashBoard/DashBoardEditModal';
import SuccessModal from '../components/SummaryDashBoard/SuccessModal';
import { saveHealthData, getHealthTrackRange } from '../service/InfinityhealthApi';
import storage from '../utils/storage';


import { useRouter } from 'expo-router';

export default function DashboardPage() {
  const router = useRouter();
  const { selectedTab, setSelectedTab, maxValue, chartData, statCards, filterTabs, trendValue, trendDirection, fetchData, handleDataPointClick, selectedPointIndex } = useDashBoardPage();

  /* Modal State */
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMetric, setEditingMetric] = useState<MetricType | null>(null);

  /* Success Modal State */
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleEdit = (metric: MetricType) => {
    setEditingMetric(metric);
    setModalVisible(true);
  };

  const handleSave = async (value: string) => {
    try {
      let userId = await storage.getItem('internalUserId');
      if (!userId) {
        userId = await storage.getItem('userId');
      }
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        return;
      }

      // Check for valid number
      console.log('Validating value:', value);
      const numVal = parseFloat(value);
      if (isNaN(numVal)) {
        Alert.alert('Invalid Input', 'Please enter a valid number.');
        return;
      }

      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      // Widen the range to avoid potential backend bugs with single-day 'today-today' queries
      // Fetch last 3 days
      const past = new Date(now);
      past.setDate(now.getDate() - 3);
      const pastDate = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;

      // Try to get existing record ID for update using Range Query
      let existingId = undefined;
      try {
        const rangeRes = await getHealthTrackRange(userId, pastDate, today);
        if (rangeRes.success && rangeRes.data && rangeRes.data.length > 0) {
          const found = rangeRes.data.find((d: any) => d.date === today || d.date?.startsWith(today));
          if (found) {
            existingId = (found as any).id || found._id;
            console.log('[Dashboard] Found existing record via Wide Range Query, ID:', existingId);
          }
        }
      } catch (err) {
        console.log('[Dashboard] Could not fetch existing record via wide range:', err);
      }

      // Construct base payload from existing cards to avoid missing fields
      const getCardValue = (id: string) => {
        const card = statCards.find(c => c.id === id);
        if (!card || card.value === '-') return null; // Return null instead of 0
        return parseFloat(card.value) || 0;
      };

      const basePayload: any = {
        date: today,
        ...(existingId ? { id: existingId } : {}), // If we found an ID, include it to force Update
        weight: getCardValue('Weight'),
        height: getCardValue('Height'),
        water: getCardValue('Water'),
        sleep_hours: getCardValue('Sleep'),
        sleepHours: getCardValue('Sleep'),
        steps_count: getCardValue('Steps'),
        stepsCount: getCardValue('Steps'),
      };

      // Update specific metric
      switch (editingMetric) {
        case 'Weight': basePayload.weight = numVal; break;
        case 'Height': basePayload.height = numVal; break;
        case 'Water':
          // Water is cumulative usually, but if user edits manually, maybe they mean total?
          // Let's assume they are setting the TOTAL value they want to see, or we can treat as 'add'?
          // Usually 'Edit' implies 'Set to'. If they want to add water, they use quick adds.
          // But here, let's treat it as SET TO for Weight/Height/Sleep.
          // For consistency, let's treat manual input as SET TO for all.
          basePayload.water = numVal;
          break;
        case 'Sleep':
          basePayload.sleep_hours = numVal;
          basePayload.sleepHours = numVal;
          break;
        case 'Steps':
          // Steps usually auto-tracked, but if manual override:
          basePayload.steps_count = numVal;
          basePayload.stepsCount = numVal;
          break;
        default: break;
      }

      console.log('[Dashboard] Saving FULL payload:', JSON.stringify(basePayload));
      const response = await saveHealthData(userId, basePayload);

      if (response && response.success) {
        // Refresh data
        await fetchData();
        setModalVisible(false);

        // Show Success Modal
        setSuccessMessage(`${editingMetric} updated successfully!`);
        setSuccessModalVisible(true);

        setEditingMetric(null);
      } else {
        throw new Error(response?.message || 'Update failed');
      }

    } catch (error: any) {
      console.error('Failed to save health data:', error);
      Alert.alert('Update Failed', error.message || 'Could not save data. Please try again.');
    }
  };

  // Get current value for modal
  const getCurrentValue = () => {
    if (!editingMetric) return '';
    const card = statCards.find(c => c.id === editingMetric);
    const val = card ? card.value : '';
    return val === '-' ? '' : val;
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
          paddingBottom: 100,
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

      {/* Success Modal */}
      <SuccessModal
        visible={successModalVisible}
        message={successMessage}
        onClose={() => setSuccessModalVisible(false)}
      />
    </View>
  );
}
