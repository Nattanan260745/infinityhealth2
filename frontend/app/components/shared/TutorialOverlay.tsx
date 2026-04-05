import React, { useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal } from 'react-native';
import Svg, { Defs, Mask, Rect, Circle } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { useTutorial } from '../../context/TutorialContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TutorialOverlay: React.FC = () => {
  const { 
    isActive, 
    currentStepIndex, 
    steps, 
    nextStep, 
    prevStep,
    skipTutorial, 
    targets 
  } = useTutorial();

  // Shared values for the spotlight position and size
  const spotlightX = useSharedValue(0);
  const spotlightY = useSharedValue(0);
  const spotlightW = useSharedValue(0);
  const spotlightH = useSharedValue(0);
  const spotlightR = useSharedValue(0);

  const currentStep = steps[currentStepIndex];
  const targetRect = currentStep?.targetKey ? targets[currentStep.targetKey] : null;

  useEffect(() => {
    if (targetRect) {
      // Smoothly animate the spotlight to the target coordinates
      const duration = 400;
      spotlightX.value = withTiming(targetRect.x - 10, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
      spotlightY.value = withTiming(targetRect.y - 10, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
      spotlightW.value = withTiming(targetRect.width + 20, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
      spotlightH.value = withTiming(targetRect.height + 20, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
      const targetRadius = targetRect.borderRadius !== undefined ? targetRect.borderRadius : 15;
      spotlightR.value = withTiming(targetRadius, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    } else {
      // If no target, center the spotlight or hide it
      spotlightW.value = withTiming(0);
      spotlightH.value = withTiming(0);
    }
  }, [targetRect, currentStepIndex]);

  // Animated styles for the instruction box (modal)
  // We want it to be positioned near the spotlight
  const modalStyle = useAnimatedStyle(() => {
    if (!targetRect) {
      return {
        top: SCREEN_HEIGHT / 2 - 100,
        left: 20,
        right: 20,
        opacity: withTiming(1)
      };
    }

    const isTopHalf = targetRect.y < SCREEN_HEIGHT / 2;
    const topOffset = isTopHalf ? targetRect.y + targetRect.height + 40 : targetRect.y - 200;

    return {
      top: withTiming(topOffset),
      left: 20,
      right: 20,
      opacity: withTiming(1)
    };
  });

  if (!isActive || !currentStep) return null;

  return (
    <Modal transparent visible={isActive} animationType="fade">
      <View style={StyleSheet.absoluteFill}>
        {/* SVG Drawing the "Mask" for the spotlight */}
        <Svg height={SCREEN_HEIGHT} width={SCREEN_WIDTH} style={StyleSheet.absoluteFill}>
          <Defs>
            <Mask id="mask" x="0" y="0" height="100%" width="100%">
              {/* The black outer box (completely opaque) */}
              <Rect height="100%" width="100%" fill="white" />
              {/* The "hole" (black in mask = transparent in result) */}
              <Rect
                x={spotlightX.value}
                y={spotlightY.value}
                width={spotlightW.value}
                height={spotlightH.value}
                rx={spotlightR.value}
                fill="black"
              />
            </Mask>
          </Defs>
          {/* Apply the mask to a dark overlay rectangle */}
          <Rect
            height="100%"
            width="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#mask)"
          />
        </Svg>

        {/* The Instructions Modal */}
        <Animated.View style={[styles.instructionBox, modalStyle]}>
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.description}>{currentStep.description}</Text>
          
          <View style={styles.footer}>
            <TouchableOpacity onPress={skipTutorial} style={styles.skipBtn}>
              <Text style={styles.skipTxt}>ข้าม (Skip)</Text>
            </TouchableOpacity>
            
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {currentStepIndex > 0 && (
                <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
                  <Text style={styles.backTxt}>ย้อนกลับ</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={nextStep} style={styles.nextBtn}>
                <Text style={styles.nextTxt}>
                  {currentStepIndex === steps.length - 1 ? 'เริ่มต้นเลย!' : 'ถัดไป'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  instructionBox: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipBtn: {
    padding: 10,
  },
  skipTxt: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  backBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  backTxt: {
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nextBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextTxt: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TutorialOverlay;
