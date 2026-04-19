import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  targetKey?: string; // Key used to look up layout measurements
  screen?: string;    // If defined, tutorial will wait for this screen to be active
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
};

interface TutorialContextType {
  isActive: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  startTutorial: (steps: TutorialStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  resetTutorial: () => Promise<void>;
  isComplete: boolean;
  isLoading: boolean;
  registerTarget: (key: string, rect: Rect) => void;
  targets: Record<string, Rect>;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TUTORIAL_COMPLETED_KEY = '@infinity_tutorial_completed';

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [targets, setTargets] = useState<Record<string, Rect>>({});

  useEffect(() => {
    checkCompletionStatus();
  }, []);

  const checkCompletionStatus = async () => {
    try {
      const status = await AsyncStorage.getItem(TUTORIAL_COMPLETED_KEY);
      if (status === 'true') {
        setIsComplete(true);
      }
    } catch (e) {
      console.error('Tutorial: Error checking status', e);
    } finally {
      setIsLoading(false);
    }
  };

  const startTutorial = useCallback((newSteps: TutorialStep[]) => {
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const router = require('expo-router').useRouter();

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      const nextStepConfig = steps[nextIndex];
      
      // If the next step requires navigation, push the route
      if (nextStepConfig.screen) {
        setTimeout(() => {
          router.push(nextStepConfig.screen as any);
        }, 50); // Small delay ensures modal transition looks smooth
      }

      setCurrentStepIndex(nextIndex);
    } else {
      finishTutorial();
    }
  }, [currentStepIndex, steps]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      const prevStepConfig = steps[prevIndex];

      // If the prev step requires navigation or was on another screen naturally,
      // it gets tricky, but we can just use the provided screen property.
      // Usually tutorials move forward, but we can attempt to route back if defined
      if (prevStepConfig.screen) {
        setTimeout(() => {
          router.push(prevStepConfig.screen as any);
        }, 50);
      } else if (currentStepIndex > 0 && steps[currentStepIndex].screen) {
          // If we are leaving a screen step to a non-screen step, probably go Home
          // We assume "no screen" means the index Home page.
          setTimeout(() => {
            router.push('/(tabs)');
          }, 50);
      }

      setCurrentStepIndex(prevIndex);
    }
  }, [currentStepIndex, steps]);

  const skipTutorial = useCallback(() => {
    finishTutorial();
  }, []);

  const resetTutorial = useCallback(async () => {
    await AsyncStorage.removeItem(TUTORIAL_COMPLETED_KEY);
    setIsComplete(false);
    setIsActive(false);
    // You might want to auto-start it too, or let the user click a button.
  }, []);

  const finishTutorial = useCallback(async () => {

    setIsActive(false);
    setIsComplete(true);
    try {
      await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    } catch (e) {
      console.error('Tutorial: Error saving completion', e);
    }
  }, []);

  const registerTarget = useCallback((key: string, rect: Rect) => {
    setTargets(prev => ({ ...prev, [key]: rect }));
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStepIndex,
        steps,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        resetTutorial,
        isComplete,
        isLoading,
        registerTarget,
        targets,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
