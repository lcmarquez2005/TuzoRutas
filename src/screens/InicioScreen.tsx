import React from 'react';
import { Text, View } from 'react-native';
import { ScreenContent } from './ScreenContent';
import Button from '@/components/Button';

const InicioScreen = () => (
    <ScreenContent  path='screens/InicioScreen.tsx' >
        <View className='flex-1 px-5 pt-10'>
            {/* Header */}
            <View >
                <Text className="text-3xl font-bold text-gray-900">
                    TuzoRutas
                </Text>
                <Text className="text-gray-500 mt-1">
                    Movilidad inteligente en Pachuca
                </Text>
            </View>


            {/* Tarjeta principal */}
            <View className="mt-6 bg-blue-500 rounded-2xl p-5 shadow-md">
                <Text className="text-white text-lg font-semibold">
                    Bienvenido
                </Text>
                <Text className="text-white mt-2">
                    Consulta rutas, ubica transporte y optimiza tus traslados en tiempo real.
                </Text>
            </View>

            {/* Tarjetas tipo dashboard */}
            <View className="mt-6 gap-4">

                {/* Ubicación */}
                <View className="bg-white rounded-2xl p-4 shadow-sm">
                    <Text className="text-gray-400 text-sm">
                        Tu ubicación
                    </Text>
                    <Text className="text-gray-800 font-semibold mt-1">
                        Detectando ubicación...
                    </Text>
                </View>

                {/* Estado de rutas */}
                <View className="bg-white rounded-2xl p-4 shadow-sm">
                    <Text className="text-gray-400 text-sm">
                        Estado de rutas
                    </Text>
                    <Text className="text-gray-800 font-semibold mt-1">
                        5 rutas disponibles cercanas
                    </Text>
                </View>

                {/* Sugerencia */}
                <View className="bg-white rounded-2xl p-4 shadow-sm">
                    <Text className="text-gray-400 text-sm">
                        Recomendación
                    </Text>
                    <Text className="text-gray-800 font-semibold mt-1">
                        Usa el mapa para ver rutas en tiempo real
                    </Text>
                </View>

            </View>

        </View>
    </ScreenContent>
);

export default InicioScreen;
