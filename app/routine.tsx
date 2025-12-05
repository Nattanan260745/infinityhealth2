import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Platform, 
  Modal, 
  TextInput, 
  TouchableWithoutFeedback,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRoutinePage } from './hook/useRoutinePage';

export default function RoutineScreen() {
  const {
    colors,
    selectedTab,
    setSelectedTab,
    isGoalsTab,
    currentList,
    showAddModal,
    showDeleteModal,
    editingRoutine,
    formTitle,
    setFormTitle,
    formDate,
    setFormDate,
    formTime,
    setFormTime,
    formNotifications,
    setFormNotifications,
    handleAddPress,
    handleEditPress,
    handleDeletePress,
    handleSave,
    handleDelete,
    handleCloseAddModal,
    handleCloseDeleteModal,
    toggleComplete,
    getModalTitle,
    getFormLabel,
    getFormPlaceholder,
    getAddButtonText,
    getDeleteMessage,
  } = useRoutinePage();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Back Button - Fixed position */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ 
          position: 'absolute', 
          top: Platform.OS === 'ios' ? 50 : 40, 
          left: 20, 
          zIndex: 10,
          padding: 8,
        }}
      >
        <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseAddModal}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Modal Header */}
          <TouchableOpacity
            onPress={handleCloseAddModal}
            style={{ 
              position: 'absolute', 
              top: Platform.OS === 'ios' ? 50 : 40, 
              left: 20, 
              zIndex: 10,
              padding: 8,
            }}
          >
            <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>

          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Hero Image */}
            <View style={{
              height: 180,
              backgroundColor: colors.backgroundHero,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 80 }}>📝</Text>
            </View>

            <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
              <Text style={{ 
                fontSize: 28, 
                fontWeight: 'bold', 
                color: colors.textPrimary, 
                textAlign: 'center',
                marginBottom: 32,
              }}>
                {getModalTitle()}
              </Text>

              {/* Goal / To-do List Field */}
              <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                {getFormLabel()}
              </Text>
              <TextInput
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder={getFormPlaceholder()}
                placeholderTextColor={colors.textPlaceholder}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 14,
                  fontSize: 16,
                  color: colors.textPrimary,
                  marginBottom: 20,
                }}
              />

              {/* Date */}
              <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>Date</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.background,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 14,
                marginBottom: 20,
              }}>
                <TextInput
                  value={formDate}
                  onChangeText={setFormDate}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={colors.textPlaceholder}
                  style={{ flex: 1, fontSize: 16, color: colors.textPrimary }}
                />
                <Ionicons name="calendar" size={20} color={colors.textMuted} />
              </View>

              {/* Time - Only for Routines */}
              {!isGoalsTab && (
                <>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>Time</Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 14,
                    marginBottom: 20,
                  }}>
                    <TextInput
                      value={formTime}
                      onChangeText={setFormTime}
                      placeholder="--:--"
                      placeholderTextColor={colors.textPlaceholder}
                      style={{ flex: 1, fontSize: 16, color: colors.textPrimary }}
                    />
                    <Ionicons name="time" size={20} color={colors.textMuted} />
                  </View>

                  {/* Enable Notifications - Only for Routines */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 32,
                  }}>
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>Enable Notifications</Text>
                    <Switch
                      value={formNotifications}
                      onValueChange={setFormNotifications}
                      trackColor={{ false: colors.switchTrackOff, true: colors.primary }}
                      thumbColor={colors.background}
                    />
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          {/* Bottom Buttons */}
          <View style={{
            flexDirection: 'row',
            padding: 20,
            paddingBottom: Platform.OS === 'ios' ? 34 : 20,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
          }}>
            <TouchableOpacity
              onPress={handleCloseAddModal}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 25,
                borderWidth: 1,
                borderColor: colors.primary,
                marginRight: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 25,
                backgroundColor: colors.primary,
                marginLeft: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.background, fontSize: 16, fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseDeleteModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseDeleteModal}>
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <TouchableWithoutFeedback>
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 20,
                padding: 24,
                width: 300,
                alignItems: 'center',
              }}>
                {/* Trash Icon */}
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: colors.dangerBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Ionicons name="trash" size={28} color={colors.danger} />
                </View>

                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: colors.textPrimary,
                  marginBottom: 8,
                }}>
                  Delete?
                </Text>

                <Text style={{
                  fontSize: 14,
                  color: colors.textMuted,
                  textAlign: 'center',
                  marginBottom: 24,
                  lineHeight: 20,
                }}>
                  {getDeleteMessage()}
                </Text>

                <View style={{ flexDirection: 'row', width: '100%' }}>
                  <TouchableOpacity
                    onPress={handleDelete}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: colors.danger,
                      marginRight: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: colors.background, fontSize: 14, fontWeight: '600' }}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCloseDeleteModal}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      marginLeft: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Image */}
        <View style={{
          height: 200,
          backgroundColor: colors.backgroundHero,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 100 }}>📋</Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Header */}
          <Text style={{ 
            fontSize: 28, 
            fontWeight: 'bold', 
            color: colors.textPrimary, 
            textAlign: 'center', 
            marginTop: 24,
            marginBottom: 24,
          }}>
            Self-Care Planner
          </Text>

          {/* Tabs */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.background,
            borderRadius: 25,
            padding: 4,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <TouchableOpacity
              onPress={() => setSelectedTab('routines')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: selectedTab === 'routines' ? colors.background : 'transparent',
                borderWidth: selectedTab === 'routines' ? 1 : 0,
                borderColor: colors.border,
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontWeight: '600',
                fontSize: 14,
                color: selectedTab === 'routines' ? colors.primary : colors.textPlaceholder,
              }}>
                Routines
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab('goals')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: selectedTab === 'goals' ? colors.background : 'transparent',
                borderWidth: selectedTab === 'goals' ? 1 : 0,
                borderColor: colors.border,
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontWeight: '600',
                fontSize: 14,
                color: selectedTab === 'goals' ? colors.primary : colors.textPlaceholder,
              }}>
                Goals
              </Text>
            </TouchableOpacity>
          </View>

          {/* Empty State */}
          {currentList.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
                No {selectedTab} yet
              </Text>
              <Text style={{ fontSize: 14, color: colors.textPlaceholder }}>
                Create your daily {isGoalsTab ? 'goal' : 'routine'}
              </Text>
            </View>
          ) : (
            /* Routine List */
            currentList.map((routine) => (
              <View
                key={routine.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: routine.completed ? colors.completedBg : colors.background,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: routine.completed ? colors.completedBorder : colors.borderLight,
                }}
              >
                {/* Checkbox */}
                <TouchableOpacity
                  onPress={() => toggleComplete(routine.id)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: routine.completed ? colors.completedIcon : colors.pendingBorder,
                    backgroundColor: routine.completed ? colors.completedIcon : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  {routine.completed && (
                    <Ionicons name="checkmark" size={14} color={colors.background} />
                  )}
                </TouchableOpacity>

                {/* Content */}
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: routine.completed ? colors.completedText : colors.textPrimary,
                  }}>
                    {routine.title}
                  </Text>
                  {/* Show time for routines, nothing for goals */}
                  {!isGoalsTab && routine.time && (
                    <Text style={{
                      fontSize: 12,
                      color: routine.completed ? colors.completedIcon : colors.textPlaceholder,
                      marginTop: 2,
                    }}>
                      {routine.time}
                    </Text>
                  )}
                </View>

                {/* Actions */}
                {!routine.completed && (
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() => handleEditPress(routine)}
                      style={{ padding: 8 }}
                    >
                      <Ionicons name="create-outline" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeletePress(routine)}
                      style={{ padding: 8 }}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Button */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        backgroundColor: colors.background,
      }}>
        <TouchableOpacity
          onPress={handleAddPress}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 25,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.background, fontSize: 16, fontWeight: '600' }}>
            {getAddButtonText()}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
