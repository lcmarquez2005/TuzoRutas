import React from 'react';
import { Text, View } from 'react-native';



interface ScreenContentProps {
  title?: string;
  children?: React.ReactNode;
  path: string;
}

export const ScreenContent: React.FC<ScreenContentProps> = ({  path, children }) => {
  return (
    <View className="flex-1 w-full">
      {/* <Text className="text-xl font-bold">{title}</Text>
      <View className="my-7 h-[1px] w-4/5 bg-gray-200" /> */}
      {children}
    </View>
  );
};
