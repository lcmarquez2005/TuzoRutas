import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { ScreenContent } from './components/ScreenContent'; // Ajusta la ruta
import RutasScreen from 'components/RutasScreen';

// icon library from expo (already included with expo)
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';


// 1. Definimos las pantallas (puedes moverlas a archivos separados luego)
const InicioScreen = () => (
  <ScreenContent title="Inicio" path="screens/Inicio.tsx">
    <Text className="mt-4 text-gray-600">Bienvenido a TuzoRutas</Text>
  </ScreenContent>
);


const AjustesScreen = () => (
  <ScreenContent title="Ajustes" path="screens/Ajustes.tsx">
    <Text className="mt-4 text-gray-600">Configuración de la app</Text>
  </ScreenContent>
);

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false, // Oculta el título superior por defecto
          tabBarStyle: { backgroundColor: '#ffffff', height: 60 },
          tabBarActiveTintColor: '#800000', // Un color guinda tipo Tuzobús
          tabBarInactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen
          name="Inicio"
          component={InicioScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
            tabBarLabel: 'Home'
          }}
        />
        <Tab.Screen
          name="Rutas"
          component={RutasScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="map" size={size} color={color} />
            ),
            tabBarLabel: 'Mapa'
          }}
        />
        <Tab.Screen
          name="Ajustes"
          component={AjustesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="settings" size={size} color={color} />
            ),
            tabBarLabel: 'Ajustes'
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}