import React from 'react';
import './global.css';
import { NavigationContainer } from '@react-navigation/native';

import { TabNavigator } from './src/navigation/TabNavigator';

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
      <TabNavigator />
    </NavigationContainer>
  );
}