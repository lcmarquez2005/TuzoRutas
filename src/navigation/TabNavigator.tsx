import React from 'react';
import { Platform, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import InicioScreen from '../screens/InicioScreen';
import RutasScreen from '../screens/RutasScreen';
import { AjustesStack } from './AjustesStack';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#800000', // Guinda Tuzobús
        tabBarInactiveTintColor: '#9ca3af', // Gray 400
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          elevation: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          height: 85 + (insets.bottom > 0 ? insets.bottom - 10 : 0),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 15,
          paddingTop: 15,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={InicioScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center" style={{ width: 65, height: 50 }}>
              <View 
                className="p-2 rounded-2xl mb-1"
                style={focused ? { backgroundColor: 'rgba(128, 0, 0, 0.08)' } : {}}
              >
                <MaterialCommunityIcons 
                  name={focused ? 'home-variant' : 'home-variant-outline'} 
                  size={26} 
                  color={color} 
                />
              </View>
              <Text 
                style={{ 
                  color, 
                  fontSize: 10, 
                  fontWeight: focused ? '700' : '500',
                }}
              >
                Inicio
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Rutas"
        component={RutasScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center" style={{ width: 65, height: 50 }}>
              <View 
                className="p-2 rounded-2xl mb-1"
                style={focused ? { backgroundColor: 'rgba(128, 0, 0, 0.08)' } : {}}
              >
                <MaterialCommunityIcons 
                  name={focused ? 'map-marker-path' : 'map-marker-outline'} 
                  size={26} 
                  color={color} 
                />
              </View>
              <Text 
                style={{ 
                  color, 
                  fontSize: 10, 
                  fontWeight: focused ? '700' : '500',
                }}
              >
                Rutas
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AjustesTab"
        component={AjustesStack}
        options={{
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center" style={{ width: 65, height: 50 }}>
              <View 
                className="p-2 rounded-2xl mb-1"
                style={focused ? { backgroundColor: 'rgba(128, 0, 0, 0.08)' } : {}}
              >
                <MaterialCommunityIcons 
                  name={focused ? 'cog' : 'cog-outline'} 
                  size={26} 
                  color={color} 
                />
              </View>
              <Text 
                style={{ 
                  color, 
                  fontSize: 10, 
                  fontWeight: focused ? '700' : '500',
                }}
              >
                Ajustes
              </Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};