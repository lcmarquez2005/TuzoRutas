import React from 'react';
import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { ScreenContent } from '@/screens/ScreenContent'; // Ajusta la ruta
import RutasScreen from '@/screens/RutasScreen';
import Button from '@/components/Button';
import InicioScreen from '@/screens/InicioScreen'
import { AjustesScreen } from '@/screens/AjustesScreen';
// icon library from expo (already included with expo)
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';



const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false, // Oculta el título superior por defecto
          tabBarStyle: { backgroundColor: '#000000', height: 60 },
          tabBarActiveTintColor: '#800000', // Un color guinda tipo Tuzobús
          tabBarInactiveTintColor: 'gray',
        }}>
        <Tab.Screen
          name="Inicio"
          component={InicioScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen
          name="Rutas"
          component={RutasScreen}
          options={{
            tabBarIcon: ({ color, size }) => <MaterialIcons name="map" size={size} color={color} />,
            tabBarLabel: 'Mapa',
          }}
        />
        <Tab.Screen
          name="Ajustes"
          component={AjustesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="settings" size={size} color={color} />
            ),
            tabBarLabel: 'Ajustes',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
