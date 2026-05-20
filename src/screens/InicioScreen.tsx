import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, ScrollView, Platform, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { ScreenContent } from './ScreenContent';
import { obtenerRutasCercanas } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const InicioScreen = ({ navigation }: any) => {
    const { usuario } = useAuth();
    const [ubicacionText, setUbicacionText] = useState("Detectando...");
    const [rutasCercanasCount, setRutasCercanasCount] = useState<number | null>(null);
    const [loadingRutas, setLoadingRutas] = useState(false);

    const hora = new Date().getHours();
    const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setUbicacionText('Permiso denegado');
                return;
            }

            try {
                let location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;

                // Obtener nombre del lugar
                let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

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
                    console.error("Error al cargar rutas:", err);
                    setRutasCercanasCount(0);
                } finally {
                    setLoadingRutas(false);
                }
            } catch (error) {
                setUbicacionText('Error de GPS');
            }
        })();
    }, []);

    return (
        <ScreenContent 
            title='Inicio' 
            path='screens/InicioScreen.tsx'
            onSwipeLeft={() => navigation.navigate('Rutas')}
        >
            <ScrollView 
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ 
                    paddingBottom: 40,
                    paddingTop: Platform.OS === 'ios' ? 10 : 30 
                }}
            >
                {/* Header: Saludo y Avatar */}
                <Animated.View entering={FadeInDown.duration(400).delay(100)} className="px-5 mb-6 flex-row justify-between items-center">
                    <View>
                        <Text className="text-gray-500 text-sm font-bold uppercase tracking-wider">{saludo}</Text>
                        <Text className="text-3xl font-extrabold text-gray-900 mt-0.5">
                            {usuario?.usuario || 'Pasajero'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('AjustesTab')} className="w-12 h-12 bg-red-50 rounded-full items-center justify-center border border-red-100">
                        <MaterialCommunityIcons name="account" size={26} color="#800000" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Tarjeta Principal (Hero) */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)} className="px-5 mb-8">
                    <View className="bg-[#800000] rounded-3xl p-6 shadow-lg shadow-red-900/30">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center">
                                <MaterialCommunityIcons name="crosshairs-gps" size={14} color="white" />
                                <Text className="text-white text-xs font-bold ml-1.5">Tu Ubicación</Text>
                            </View>
                            <MaterialCommunityIcons name="map-marker-radius" size={28} color="white" />
                        </View>
                        <Text className="text-white text-2xl font-bold mb-1" numberOfLines={2}>
                            {ubicacionText}
                        </Text>
                        <Text className="text-red-100 text-sm font-medium">Pachuca de Soto, Hgo.</Text>
                    </View>
                </Animated.View>

                {/* Acciones Rápidas */}
                <Animated.View entering={FadeInDown.duration(400).delay(300)} className="px-6 mb-8 flex-row justify-between">
                    <TouchableOpacity onPress={() => navigation.navigate('Rutas')} className="items-center">
                        <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mb-2 shadow-sm">
                            <MaterialCommunityIcons name="map-search" size={26} color="#007AFF" />
                        </View>
                        <Text className="text-xs font-bold text-gray-600">Explorar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('AjustesTab')} className="items-center">
                        <View className="w-14 h-14 bg-orange-50 rounded-2xl items-center justify-center mb-2 shadow-sm">
                            <MaterialCommunityIcons name="star-outline" size={26} color="#FF9500" />
                        </View>
                        <Text className="text-xs font-bold text-gray-600">Favoritos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center">
                        <View className="w-14 h-14 bg-green-50 rounded-2xl items-center justify-center mb-2 shadow-sm">
                            <MaterialCommunityIcons name="bell-ring-outline" size={26} color="#34C759" />
                        </View>
                        <Text className="text-xs font-bold text-gray-600">Avisos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('AjustesTab', { screen: 'Track' })} className="items-center">
                        <View className="w-14 h-14 bg-purple-50 rounded-2xl items-center justify-center mb-2 shadow-sm">
                            <MaterialCommunityIcons name="map-marker-plus" size={26} color="#AF52DE" />
                        </View>
                        <Text className="text-xs font-bold text-gray-600">Trazar</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Dashboard Stats */}
                <Animated.View entering={FadeInDown.duration(400).delay(400)} className="px-5">
                    <Text className="text-lg font-extrabold text-gray-800 mb-4">Estado del Servicio</Text>
                    
                    <View className="flex-row gap-4 mb-4">
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Rutas')}
                            className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
                        >
                            <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mb-3">
                                <MaterialCommunityIcons name="bus-multiple" size={22} color="#800000" />
                            </View>
                            <Text className="text-gray-500 text-[10px] font-bold tracking-widest mb-1">CERCANAS</Text>
                            <View className="flex-row items-baseline">
                                {loadingRutas ? (
                                    <ActivityIndicator size="small" color="#800000" />
                                ) : (
                                    <>
                                        <Text className="text-3xl font-black text-gray-900">
                                            {rutasCercanasCount !== null ? rutasCercanasCount : 0}
                                        </Text>
                                        <Text className="text-gray-400 text-xs ml-1.5 font-bold">rutas</Text>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>

                        <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 justify-between">
                            <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mb-3">
                                <MaterialCommunityIcons name="check-decagram" size={22} color="#34C759" />
                            </View>
                            <View>
                                <Text className="text-gray-500 text-[10px] font-bold tracking-widest mb-1">ESTADO RED</Text>
                                <Text className="text-xl font-black text-gray-900">Óptimo</Text>
                            </View>
                        </View>
                    </View>

                    {/* Banner de Novedades */}
                    <TouchableOpacity className="bg-gray-900 rounded-2xl p-4 flex-row items-center shadow-md">
                        <View className="bg-gray-800 p-3 rounded-xl mr-4">
                            <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FBBF24" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-bold text-base mb-0.5">Nuevo Sistema Activo</Text>
                            <Text className="text-gray-400 text-xs">Descubre las nuevas rutas y herramientas de trazado.</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </ScreenContent>
    );
};

export default InicioScreen;