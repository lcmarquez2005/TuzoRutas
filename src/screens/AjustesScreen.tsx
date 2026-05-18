import React from 'react';
import { Text, View } from 'react-native';
import { ScreenContent } from './ScreenContent';
import Button from '@/components/Button';
import { useAuth } from '../context/AuthContext';

const AjustesScreen = ({ navigation }: any) => {
  const { signOut, usuario } = useAuth();

  return (
    <ScreenContent title="Ajustes" path="screens/AjustesScreen.tsx">
      <View className="mt-4 p-4 bg-white rounded-xl shadow-sm">
        <Text className="text-gray-500 text-sm">Sesión iniciada como:</Text>
        <Text className="text-gray-800 font-bold text-lg">{usuario?.usuario || 'Desconocido'}</Text>
      </View>

      <Button 
        className='mt-6 bg-blue-600' 
        onPress={() => navigation.navigate('Track')}
      >
        Trazar Nueva Ruta
      </Button>

      <Button 
        className='mt-4 bg-red-600' 
        onPress={signOut}
      >
        Cerrar Sesión
      </Button>
    </ScreenContent>
  );
};

export default AjustesScreen;
