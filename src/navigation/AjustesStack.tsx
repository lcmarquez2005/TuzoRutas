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
        headerStyle: { backgroundColor: '#800000' }, // Guinda Tuzobús
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="AjustesScreen" 
        component={AjustesScreen} 
        options={{ title: 'Configuración' }} 
      />
      <Stack.Screen 
        name="Track" 
        component={TrackRoutes} 
        options={{ title: 'Trazar Ruta' }} 
      />
    </Stack.Navigator>
  );
};