import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Image, Linking, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type TabType = 'cardio' | 'weight';

const workouts = {
  cardio: [
    { id: 1, title: 'Running', description: 'Outdoor or treadmill running', duration: '30 min', calories: '300 kcal', emoji: '🏃' },
    { id: 2, title: 'Cycling', description: 'Stationary or outdoor bike', duration: '45 min', calories: '400 kcal', emoji: '🚴' },
    { id: 3, title: 'Swimming', description: 'Full body cardio workout', duration: '30 min', calories: '350 kcal', emoji: '🏊' },
    { id: 4, title: 'Jump Rope', description: 'High intensity interval', duration: '15 min', calories: '200 kcal', emoji: '🪢' },
  ],
  weight: [
    { id: 1, title: 'Full Body', description: 'Complete workout for all muscle groups', emoji: '💪', color: '#E0F2FE' },
    { id: 2, title: 'Upper Body', description: 'Focus on chest, back, arms, and shoulders', emoji: '🏋️', color: '#FCE7F3' },
    { id: 3, title: 'Lower Body', description: 'Strengthen legs, glutes, and calves', emoji: '🦵', color: '#DCFCE7' },
    { id: 4, title: 'Core', description: 'Build a strong core and abs', emoji: '🎯', color: '#FEF3C7' },
  ],
};

// Video data for each category
const exerciseVideos: Record<string, { id: number; title: string; description: string; duration: string; thumbnail: string; videoUrl: string }[]> = {
  'Full Body': [
    {
      id: 1,
      title: '15 Min Full Body Strength Training',
      description: 'Build strength with this full body workout',
      duration: '15 min',
      thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=250&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=UBMk30rjy0o',
    },
    {
      id: 2,
      title: '30 Min Total Body Workout',
      description: 'Intense full body workout for advanced fitness.',
      duration: '30 min',
      thumbnail: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=400&h=250&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=UItWltVZZmE',
    },
  ],
  'Upper Body': [
    {
      id: 1,
      title: '15 Min Upper Body Workout',
      description: 'Target your chest, back, arms, and shoulders',
      duration: '15 min',
      thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=UBMk30rjy0o',
    },
    {
      id: 2,
      title: '20 Min Arm Toning',
      description: 'Sculpt and tone your arms with this workout',
      duration: '20 min',
      thumbnail: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=250&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=UItWltVZZmE',
    },
  ],
  'Lower Body': [
    {
      id: 1,
      title: '20 Min Leg Day Workout',
      description: 'Build strong legs and glutes',
      duration: '20 min',
      thumbnail: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&h=250&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=UBMk30rjy0o',
    },
    {
      id: 2,
      title: '15 Min Glute Activation',
      description: 'Activate and strengthen your glutes',
      duration: '15 min',
      thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=250&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=UItWltVZZmE',
    },
  ],
  'Core': [
    {
      id: 1,
      title: '10 Min Core Crusher',
      description: 'Intense ab workout for a stronger core',
      duration: '10 min',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=UBMk30rjy0o',
    },
    {
      id: 2,
      title: '15 Min Plank Challenge',
      description: 'Build core stability with plank variations',
      duration: '15 min',
      thumbnail: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=250&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=UItWltVZZmE',
    },
  ],
};

const levels = ['Beginner', 'Intermediate', 'Advanced'];

export default function ExerciseScreen() {
  const [selectedTab, setSelectedTab] = useState<TabType>('cardio');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<typeof exerciseVideos['Full Body'][0] | null>(null);

  const handleOpenVideo = async (videoUrl: string) => {
    // For web, open in new tab. For mobile, use Linking
    if (Platform.OS === 'web') {
      window.open(videoUrl, '_blank');
    } else {
      const supported = await Linking.canOpenURL(videoUrl);
      if (supported) {
        await Linking.openURL(videoUrl);
      }
    }
  };

  // Video List View for a Category
  if (selectedCategory) {
    const videos = exerciseVideos[selectedCategory] || [];
    
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => setSelectedCategory(null)}
          style={{ 
            position: 'absolute', 
            top: Platform.OS === 'ios' ? 50 : 40, 
            left: 20, 
            zIndex: 10,
            padding: 8,
          }}
        >
          <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </TouchableOpacity>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: Platform.OS === 'web' ? 20 : 80,
            paddingBottom: 30,
            paddingHorizontal: 20,
          }}
        >
          {/* Header */}
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 24 }}>
            {selectedCategory}
          </Text>

          {/* Video Cards */}
          {videos.map((video) => (
            <TouchableOpacity
              key={video.id}
              onPress={() => setSelectedVideo(video)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                overflow: 'hidden',
              }}
            >
              {/* Thumbnail with Play Button */}
              <View style={{ position: 'relative' }}>
                <Image
                  source={{ uri: video.thumbnail }}
                  style={{
                    width: '100%',
                    height: 180,
                    backgroundColor: '#E5E7EB',
                  }}
                  resizeMode="cover"
                />
                {/* Play Button Overlay */}
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: 'rgba(125, 209, 224, 0.9)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="play" size={30} color="#FFFFFF" style={{ marginLeft: 4 }} />
                  </View>
                </View>
              </View>

              {/* Video Info */}
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 }}>
                  {video.title}
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>
                  {video.description}
                </Text>
                {/* Duration */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#F97316',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 8,
                    }}
                  >
                    <Ionicons name="time-outline" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>{video.duration}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Video Modal */}
        <Modal
          visible={selectedVideo !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedVideo(null)}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: 20,
          }}>
            <View style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: 20, 
              width: '100%',
              maxWidth: 400,
              overflow: 'hidden',
            }}>
              {/* Video Thumbnail */}
              <Image
                source={{ uri: selectedVideo?.thumbnail }}
                style={{ width: '100%', height: 200, backgroundColor: '#1F2937' }}
                resizeMode="cover"
              />
              
              {/* Video Info */}
              <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
                  {selectedVideo?.title}
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
                  {selectedVideo?.description}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#F97316',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 10,
                  }}>
                    <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                  </View>
                  <Text style={{ fontSize: 16, color: '#6B7280' }}>{selectedVideo?.duration}</Text>
                </View>

                {/* Play Button */}
                <TouchableOpacity
                  onPress={() => selectedVideo && handleOpenVideo(selectedVideo.videoUrl)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#7DD1E0',
                    paddingVertical: 16,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="play" size={20} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                    Play Video
                  </Text>
                </TouchableOpacity>

                {/* Close Button */}
                <TouchableOpacity
                  onPress={() => setSelectedVideo(null)}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F3F4F6',
                    paddingVertical: 14,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: '#6B7280', fontSize: 16, fontWeight: '500' }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
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
        <Ionicons name="chevron-back" size={28} color="#1F2937" />
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'web' ? 20 : 80,
          paddingBottom: 30,
          paddingHorizontal: 20,
        }}
      >
        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 24 }}>
          Exercise
        </Text>

        {/* Tabs */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#F3F4F6',
          borderRadius: 25,
          padding: 4,
          marginBottom: 20,
        }}>
          <TouchableOpacity
            onPress={() => setSelectedTab('cardio')}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 22,
              backgroundColor: selectedTab === 'cardio' ? '#FFFFFF' : 'transparent',
            }}
          >
            <Text style={{
              textAlign: 'center',
              fontWeight: '600',
              color: selectedTab === 'cardio' ? '#7DD1E0' : '#6B7280',
            }}>
              Cardio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('weight')}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 22,
              backgroundColor: selectedTab === 'weight' ? '#FFFFFF' : 'transparent',
            }}
          >
            <Text style={{
              textAlign: 'center',
              fontWeight: '600',
              color: selectedTab === 'weight' ? '#7DD1E0' : '#6B7280',
            }}>
              Weight Training
            </Text>
          </TouchableOpacity>
        </View>

        {/* Level Selector */}
        <TouchableOpacity
          onPress={() => setShowLevelPicker(!showLevelPicker)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            marginBottom: 24,
          }}
        >
          <Text style={{ color: selectedLevel ? '#1F2937' : '#9CA3AF' }}>
            {selectedLevel || 'Select Level'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>

        {showLevelPicker && (
          <View style={{
            backgroundColor: '#F9FAFB',
            borderRadius: 12,
            marginBottom: 24,
            marginTop: -16,
          }}>
            {levels.map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => {
                  setSelectedLevel(level);
                  setShowLevelPicker(false);
                }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderBottomWidth: level !== 'Advanced' ? 1 : 0,
                  borderBottomColor: '#E5E7EB',
                }}
              >
                <Text style={{
                  color: selectedLevel === level ? '#7DD1E0' : '#374151',
                  fontWeight: selectedLevel === level ? '600' : '400',
                }}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Workouts */}
        {selectedTab === 'cardio' ? (
          workouts.cardio.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                backgroundColor: '#F9FAFB',
                borderRadius: 16,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 40, marginRight: 16 }}>{workout.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{workout.title}</Text>
                <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{workout.description}</Text>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: '#10B981', marginRight: 12 }}>⏱ {workout.duration}</Text>
                  <Text style={{ fontSize: 12, color: '#F97316' }}>🔥 {workout.calories}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))
        ) : (
          workouts.weight.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              onPress={() => setSelectedCategory(workout.title)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                backgroundColor: workout.color,
                borderRadius: 16,
                marginBottom: 12,
              }}
            >
              <View style={{
                width: 70,
                height: 70,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Text style={{ fontSize: 32 }}>{workout.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>{workout.title}</Text>
                <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{workout.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

