import React, { useRef, useEffect } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import { useTutorial } from '../../context/TutorialContext';

interface TutorialTargetProps {
  tutorialKey: string;
  children: React.ReactNode;
  style?: any;
  borderRadius?: number;
}

const TutorialTarget: React.FC<TutorialTargetProps> = ({ tutorialKey, children, style, borderRadius }) => {
  const { registerTarget, isActive, currentStepIndex } = useTutorial();
  const viewRef = useRef<View>(null);

  const measure = () => {
    if (viewRef.current) {
      viewRef.current.measureInWindow((x, y, width, height) => {
        registerTarget(tutorialKey, { x, y, width, height, borderRadius });
      });
    }
  };

  // Measure on layout changes
  const onLayout = (event: LayoutChangeEvent) => {
    measure();
  };

  // Re-measure when tutorial becomes active or step changes (to handle layout shifts, scrolling, or screen transitions)
  useEffect(() => {
    if (isActive) {
      // Multiple measures to catch the view during and after navigation transitions
      const timer1 = setTimeout(measure, 100);
      const timer2 = setTimeout(measure, 350); // Typical navigation transition time
      const timer3 = setTimeout(measure, 600); // Failsafe after transition
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isActive, currentStepIndex]);

  return (
    <View ref={viewRef} onLayout={onLayout} style={style}>
      {children}
    </View>
  );
};

export default TutorialTarget;
