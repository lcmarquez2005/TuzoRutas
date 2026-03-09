import React from 'react';
import { Text, View } from 'react-native';

import { EditScreenInfo } from './EditScreenInfo';

interface ScreenContentProps {
  children?: React.ReactNode;
  path: string;
}

export const ScreenContent: React.FC<ScreenContentProps> = ({  path, children }) => {
  return (
    <View className= "flex-1 items-center justify-center p-5" >
      <EditScreenInfo path={path} />
      {children}
    </View>
  );
};
