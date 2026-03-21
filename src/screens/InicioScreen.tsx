import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContent } from './ScreenContent';

const rutasMock = [
    { id: 1, nombre: 'Ruta Centro', descripcion: 'Centro - Sur', tipo: 1 },
    { id: 2, nombre: 'Ruta Norte', descripcion: 'Norte - Centro', tipo: 2 },
    { id: 3, nombre: 'Ruta Sur', descripcion: 'Sur - Centro', tipo: 1 },
    { id: 4, nombre: 'Ruta Sur', descripcion: 'Sur - Centro', tipo: 2 },
    { id: 5, nombre: 'Ruta Sur', descripcion: 'Sur - Centro', tipo: 1 },
    { id: 6, nombre: 'Ruta Sur', descripcion: 'Sur - Centro', tipo: 2 },
    { id: 7, nombre: 'Ruta Sur', descripcion: 'Sur - Centro', tipo: 1 },
    { id: 8, nombre: 'Ruta Sur', descripcion: 'Sur - Centro', tipo: 2 },
    { id: 9, nombre: 'Ruta Sur', descripcion: 'Sur - Centro', tipo: 1 },
];

const InicioScreen = () => {
    return (
        <ScreenContent title='Inicio' path='screens/InicioScreen.tsx'>
            <View className='flex-1 bg-gray-100'>

                {/* HEADER CARD */}
                <View className='px-5 pt-10'>
                    <View className='bg-green-300 rounded-2xl p-5 shadow-sm'>
                        <Text className="text-3xl font-bold text-gray-900">
                            TuzoRutas
                        </Text>
                        <Text className="text-gray-500 mt-1">
                            Movilidad inteligente en Pachuca
                        </Text>
                    </View>
                </View>

                {/* SELECTOR CARD */}
                <View className='px-5 mt-4'>
                    <View className='bg-green-100 rounded-2xl p-5 shadow-sm'>
                        <Text className="text-base font-semibold text-gray-700 mb-3">
                            Tipo de transporte
                        </Text>

                        <View className='flex-row space-x-3'>
                            <TouchableOpacity className='flex-1 bg-blue-500 py-3 rounded-xl items-center'>
                                <Text className='text-white font-semibold'>Tuzobús</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className='flex-1 bg-gray-300 py-3 rounded-xl items-center'>
                                <Text className='text-gray-800 font-semibold'>Combis</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* LISTA DE RUTAS */}
                <ScrollView
                    className="flex-1 px-5 mt-4"
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    {rutasMock.map((ruta) => (
                        <TouchableOpacity
                            key={ruta.id}
                            className="bg-white rounded-xl p-4 mb-3 shadow-sm"
                        >
                            <Text className="text-lg font-semibold text-gray-900">
                                {ruta.nombre}
                            </Text>
                            <Text className="text-gray-500">
                                {ruta.descripcion}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

            </View>
        </ScreenContent>
    );
};

export default InicioScreen;