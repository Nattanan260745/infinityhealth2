import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DashBoardCard from '@/components/SummaryDashBoard/DashBoardCard';
import { MetricType, StatCard } from '@/interface/infinityhealth.interface';
import Filter from '@/components/SummaryDashBoard/Filter';
import ChartSection from '@/components/SummaryDashBoard/ChartSection';
import { useDashBoardPage } from '@/hook/useDashBoardPage';
import DashBoardEditModal from '@/components/SummaryDashBoard/DashBoardEditModal';
import SuccessModal from '@/components/SummaryDashBoard/SuccessModal';
import { saveHealthData, getHealthTrackRange, syncClerkUser } from '@/service/InfinityhealthApi';
import storage from '@/utils/storage';
import { useUser } from '@clerk/clerk-expo';


import { useRouter } from 'expo-router';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
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
      // 1. Check for User ID with Fallback Sync
      let userId = await storage.getItem('internalUserId');
      if (!userId) {
        userId = await storage.getItem('userId');
      }

      if (!userId) {
        console.log('[Dashboard] User ID missing. Attempting immediate emergency sync...');

        // Emergency Sync: If we have a Clerk user, sync right now
        if (user && user.primaryEmailAddress?.emailAddress) {
          try {
            const syncRes = await syncClerkUser(
              user.primaryEmailAddress.emailAddress,
              user.firstName || 'User',
              user.lastName || '',
              user.imageUrl || ''
            ) as any;

            if (syncRes.success && syncRes.user) {
              userId = String(syncRes.user.id);
              await storage.setItem('internalUserId', userId);
              await storage.setItem('userId', userId);
              console.log('[Dashboard] Emergency sync successful. ID:', userId);
            }
          } catch (syncErr) {
            console.error('[Dashboard] Emergency sync failed:', syncErr);
          }
        }
      }

      if (!userId) {
        Alert.alert(
          'Synchronization Incomplete',
          'Your account is still being registered with our server. Please wait a few seconds and try again.'
        );
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
      };

      // Only include fields that have values in cards to avoid overwriting with null/0 prematurely 
      // if we want the backend to merge (though our backend usually overwrites).
      // Our frontend now merges better, so we can send what we have.

      const weight = getCardValue('Weight');
      const height = getCardValue('Height');
      const water = getCardValue('Water');
      const sleep = getCardValue('Sleep');
      const steps = getCardValue('Steps');

      if (weight !== null) basePayload.weight = weight;
      if (height !== null) basePayload.height = height;
      if (water !== null) basePayload.water = water;
      if (sleep !== null) {
        basePayload.sleep_hours = sleep;
        basePayload.sleepHours = sleep;
      }
      if (steps !== null) {
        basePayload.steps_count = steps;
        basePayload.stepsCount = steps;
      }

      // Update specific metric
      switch (editingMetric) {
        case 'Weight': basePayload.weight = numVal; break;
        case 'Height': basePayload.height = numVal; break;
        case 'Water':
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
      const errorMsg = error.response?.data?.message || error.message || 'Could not save data. Please try again.';
      Alert.alert('Update Failed', errorMsg);
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
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' }}>
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
