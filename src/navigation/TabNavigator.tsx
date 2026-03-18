import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import InicioScreen from '../screens/InicioScreen';
import RutasScreen from '../screens/RutasScreen';


import { AjustesStack } from './AjustesStack';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: { backgroundColor: '#000000', height: 60 },
                tabBarActiveTintColor: '#800000', // Color guinda Tuzobús
                tabBarInactiveTintColor: 'gray',
            }}>
            <Tab.Screen
                name="Inicio"
                component={InicioScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Rutas"
                component={RutasScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="map" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="AjustesTab"
                component={AjustesStack} 
                options={{
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="settings" size={size} color={color} />,
                    tabBarLabel: 'Ajustes',
                }}
            />
        </Tab.Navigator>
    );
};