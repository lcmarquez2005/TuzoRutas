import React from 'react';
import { Text } from 'react-native';
import { ScreenContent } from './ScreenContent';
import Button from '@/components/Button';

const InicioScreen = ({ navigation }: any) => (
    <ScreenContent title="Ajustes" path="screens/Ajustes.tsx">
        <Text className="mt-6 text-gray-600">Bienvenido a TuzoRutas</Text>
        <Text className="bg-gray text-gray mt-8 p-4 ">Bienvenido a TuzoRutas</Text>
    </ScreenContent>
);

export default InicioScreen;