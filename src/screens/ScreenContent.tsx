import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

interface ScreenContentProps {
  title?: string;
  children?: React.ReactNode;
  path: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const ScreenContent: React.FC<ScreenContentProps> = ({ children, onSwipeLeft, onSwipeRight }) => {
  const insets = useSafeAreaInsets();

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Iniciar detección rápido
    .failOffsetY([-15, 15])   // Evitar conflictos con scroll vertical
    .onEnd((event) => {
      const SWIPE_THRESHOLD = 50;
      if (event.translationX < -SWIPE_THRESHOLD && onSwipeLeft) {
        runOnJS(onSwipeLeft)();
      } else if (event.translationX > SWIPE_THRESHOLD && onSwipeRight) {
        runOnJS(onSwipeRight)();
      }
    });
  
  return (
    <GestureDetector gesture={panGesture}>
      <View 
        className="flex-1 bg-white"
        style={{ 
          paddingBottom: 85 + (insets.bottom > 0 ? insets.bottom - 10 : 0) // Spacing for the absolute TabBar
        }}
      >
        {children}
      </View>
    </GestureDetector>
  );
};
