import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { ScreenContent } from './ScreenContent';
import Button from '@/components/Button';
import { obtenerRutasCercanas } from '../services/api';

const InicioScreen = () => {
    const [ubicacionText, setUbicacionText] = useState("Detectando ubicación...");
    const [rutasCercanasCount, setRutasCercanasCount] = useState<number | null>(null);
    const [loadingRutas, setLoadingRutas] = useState(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setUbicacionText('Permiso de ubicación denegado');
                return;
            }

            try {
                let location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;

                // Obtener nombre del lugar
                let geocode = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude
                });

                if (geocode && geocode.length > 0) {
                    const lugar = geocode[0];
                    const calle = lugar.street || lugar.name || '';
                    const ciudad = lugar.city || lugar.subregion || '';
                    setUbicacionText(calle && ciudad ? `${calle}, ${ciudad}` : 'Ubicación encontrada');
                } else {
                    setUbicacionText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                }

                // Obtener rutas cercanas
                setLoadingRutas(true);
                try {
                    const rutas = await obtenerRutasCercanas(latitude, longitude);
                    setRutasCercanasCount(rutas.length);
                } catch (err) {
                    console.error("Error al cargar rutas cercanas:", err);
                    setRutasCercanasCount(0);
                } finally {
                    setLoadingRutas(false);
                }

            } catch (error) {
                setUbicacionText('Error al obtener ubicación');
            }
        })();
    }, []);

    return (
    <ScreenContent title='Inicio' path='screens/InicioScreen.tsx'>
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
                        {ubicacionText}
                    </Text>
                </View>

                {/* Estado de rutas */}
                <View className="bg-white rounded-2xl p-4 shadow-sm">
                    <Text className="text-gray-400 text-sm">
                        Estado de rutas
                    </Text>
                    <View className="flex-row items-center mt-1">
                        {loadingRutas ? (
                            <ActivityIndicator size="small" color="#3B82F6" style={{ marginRight: 8 }} />
                        ) : (
                            <Text className="text-gray-800 font-semibold">
                                {rutasCercanasCount !== null 
                                    ? `${rutasCercanasCount} ${rutasCercanasCount === 1 ? 'ruta disponible cercana' : 'rutas disponibles cercanas'}`
                                    : "Buscando rutas..."}
                            </Text>
                        )}
                    </View>
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
};

export default InicioScreen;
