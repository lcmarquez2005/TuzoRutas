import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importa tus pantallas
import AjustesScreen from '../screens/AjustesScreen';
import TrackRoutes from '../screens/TrackRoutes';

const Stack = createNativeStackNavigator();

export const AjustesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTransparent: true,
        headerTitle: "",
        headerTintColor: '#1f2937', // Dark gray
        headerBackTitleVisible: false,
        headerStyle: { backgroundColor: 'transparent' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="AjustesScreen" 
        component={AjustesScreen} 
        options={{ 
          headerShown: false // Lo manejaremos internamente para un look más limpio
        }} 
      />
      <Stack.Screen 
        name="Track" 
        component={TrackRoutes} 
        options={{ 
          title: 'Trazar Nueva Ruta',
          headerTransparent: false,
          headerTitle: 'Trazar Nueva Ruta',
          headerShown: true,
          headerStyle: { backgroundColor: 'white' },
          headerTitleStyle: { fontWeight: 'bold', color: '#1f2937' },
        }} 
      />
    </Stack.Navigator>
  );
};