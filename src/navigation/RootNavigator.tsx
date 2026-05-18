import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { TabNavigator } from './TabNavigator';
import LoginScreen from '../screens/LoginScreen';

export const RootNavigator = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#800000" />
      </View>
    );
  }

  return token ? <TabNavigator /> : <LoginScreen />;
};
