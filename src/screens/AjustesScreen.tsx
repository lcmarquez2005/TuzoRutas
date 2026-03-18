import React from 'react';
import { Text } from 'react-native';
import { ScreenContent } from './ScreenContent';
import Button from '@/components/Button';

const AjustesScreen = ({ navigation }: any) => (
  <ScreenContent title="Ajustes" path="screens/AjustesScreen.tsx">
    <Text className="mt-4 text-gray-600">Configuración de la app</Text>
    <Button 
      className='mt-4' 
      onPress={() => navigation.navigate('Track')}
    >
      Ir a Track Routes
    </Button>
  </ScreenContent>
);

export default AjustesScreen;