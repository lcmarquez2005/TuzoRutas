import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, Pressable, Alert, TextInput, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { LatLng } from "react-native-maps";
import { guardarRutaEnServidor } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TrackRoutes = ({ navigation }: any) => {
    const { token } = useAuth();
    const insets = useSafeAreaInsets();

    const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);
    const [nombreRuta, setNombreRuta] = useState("");
    const [colorRuta, setColorRuta] = useState("#800000"); // Guinda por defecto
    const [isTracking, setIsTracking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [paradas, setParadas] = useState<{nombre: string, lat: number, lng: number}[]>([]);
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const colores = [
        { label: "Guinda", value: "#800000" },
        { label: "Azul", value: "#007AFF" },
        { label: "Verde", value: "#34C759" },
        { label: "Naranja", value: "#FF9500" },
        { label: "Morado", value: "#AF52DE" },
    ];

    const mapRef = useRef<MapView | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso denegado", "Necesitamos acceso a tu ubicación para trazar rutas.");
                return;
            }
            const initialLocation = await Location.getCurrentPositionAsync({});
            setCurrentLocation({
                latitude: initialLocation.coords.latitude,
                longitude: initialLocation.coords.longitude
            });
        })();

        return () => {
            if (locationSubscription.current) locationSubscription.current.remove();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startTracking = async () => {
        if (!nombreRuta.trim()) {
            Alert.alert("Nombre requerido", "Por favor ingresa un nombre para la ruta antes de comenzar.");
            return;
        }

        setIsTracking(true);
        setDuration(0);
        setDistance(0);
        setRouteCoords([]);
        setParadas([]);

        timerRef.current = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);

        locationSubscription.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 2000,
                distanceInterval: 3,
            },
            (location) => {
                const { latitude, longitude } = location.coords;
                const newPoint = { latitude, longitude };
                setCurrentLocation(newPoint);
                centerMap(newPoint);

                setRouteCoords((prev) => {
                    if (prev.length > 0) {
                        const lastPoint = prev[prev.length - 1];
                        const dist = calculateDistance(lastPoint, newPoint);
                        if (dist > 2) {
                            setDistance((d) => d + dist);
                            return [...prev, newPoint];
                        }
                        return prev;
                    }
                    return [newPoint];
                });
            }
        );
    };

    const stopTracking = () => {
        Alert.alert(
            "Finalizar Trazado",
            "¿Deseas guardar esta ruta en el servidor?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Guardar", onPress: saveRoute }
            ]
        );
    };

    const saveRoute = async () => {
        setIsTracking(false);
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
        if (timerRef.current) clearInterval(timerRef.current);

        setIsSaving(true);
        try {
            if (!token) throw new Error("Sin token");

            await guardarRutaEnServidor({
                nombre: nombreRuta,
                color: colorRuta,
                distancia_km: parseFloat((distance / 1000).toFixed(2)),
                trayectoria: routeCoords.map(c => ({ lat: c.latitude, lng: c.longitude })),
                paradas: paradas
            }, token);

            Alert.alert("Éxito", "Ruta guardada correctamente.");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", "No se pudo guardar la ruta.");
            setIsTracking(true); // Permitir reintentar
        } finally {
            setIsSaving(false);
        }
    };

    const registrarParada = () => {
        if (!currentLocation) return;
        const nuevaParada = {
            nombre: `Parada ${paradas.length + 1}`,
            lat: currentLocation.latitude,
            lng: currentLocation.longitude
        };
        setParadas(prev => [...prev, nuevaParada]);
    };

    const calculateDistance = (p1: LatLng, p2: LatLng) => {
        const R = 6371e3;
        const f1 = (p1.latitude * Math.PI) / 180;
        const f2 = (p2.latitude * Math.PI) / 180;
        const df = ((p2.latitude - p1.latitude) * Math.PI) / 180;
        const dl = ((p2.longitude - p1.longitude) * Math.PI) / 180;
        const a = Math.sin(df / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const centerMap = (location: LatLng) => {
        mapRef.current?.animateToRegion({
            ...location,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }, 1000);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                showsUserLocation
                initialRegion={{
                    latitude: 20.1011,
                    longitude: -98.7591,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {routeCoords.length > 0 && (
                    <Polyline coordinates={routeCoords} strokeWidth={5} strokeColor={colorRuta} />
                )}
                {paradas.map((p, i) => (
                    <Marker 
                        key={i} 
                        coordinate={{ latitude: p.lat, longitude: p.lng }}
                        pinColor="green"
                        title={p.nombre}
                    />
                ))}
            </MapView>

            {/* Controles (Forzado al borde superior) */}
            <Animated.View entering={FadeIn} style={styles.topControlsContainer}>
                {!isTracking ? (
                    <View style={styles.setupCard}>
                        <View style={styles.inlineHeader}>
                            <Text style={styles.cardTitle}>Nueva Ruta</Text>
                            <View style={styles.colorPickerInline}>
                                {colores.map(c => (
                                    <TouchableOpacity 
                                        key={c.value}
                                        onPress={() => setColorRuta(c.value)}
                                        style={[styles.colorOption, { backgroundColor: c.value, borderWidth: colorRuta === c.value ? 2 : 0 }]}
                                    />
                                ))}
                            </View>
                        </View>
                        <TextInput 
                            style={styles.input}
                            placeholder="Nombre de la ruta (Ej. Troncal Centro)"
                            value={nombreRuta}
                            onChangeText={setNombreRuta}
                        />
                        <TouchableOpacity style={styles.mainButton} onPress={startTracking}>
                            <MaterialCommunityIcons name="play" size={20} color="white" />
                            <Text style={styles.mainButtonText}>Iniciar Grabación</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.trackingCard}>
                        <View style={styles.recordingIndicator}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.recordingText}>GRABANDO TRAYECTO...</Text>
                        </View>
                        <View style={styles.trackingButtons}>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#059669' }]} onPress={registrarParada}>
                                <MaterialCommunityIcons name="map-marker-plus" size={24} color="white" />
                                <Text style={styles.actionButtonText}>Parada</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#dc2626' }]} onPress={stopTracking}>
                                <MaterialCommunityIcons name="stop" size={24} color="white" />
                                <Text style={styles.actionButtonText}>Finalizar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Animated.View>

            {/* Panel de Información (Ahora abajo, ajustado al navbar) */}
            <Animated.View 
                entering={SlideInDown} 
                style={[
                    styles.bottomInfoPanel,
                    { bottom: 95 + insets.bottom } // Ajustado para quedar justo encima del navbar
                ]}
            >
                <View style={styles.statBox}>
                    <MaterialCommunityIcons name="map-marker-distance" size={20} color="#800000" />
                    <Text style={styles.statValue}>{(distance / 1000).toFixed(2)}</Text>
                    <Text style={styles.statLabel}>KM</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color="#800000" />
                    <Text style={styles.statValue}>{formatTime(duration)}</Text>
                    <Text style={styles.statLabel}>TIEMPO</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <MaterialCommunityIcons name="bus-stop" size={20} color="#800000" />
                    <Text style={styles.statValue}>{paradas.length}</Text>
                    <Text style={styles.statLabel}>PARADAS</Text>
                </View>
            </Animated.View>

            {/* Botón Mi Ubicación */}
            <TouchableOpacity 
                style={[
                    styles.myLocationButton,
                    { bottom: 195 + insets.bottom } // Mantenido encima del panel
                ]}
                onPress={() => currentLocation && centerMap(currentLocation)}
            >
                <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#800000" />
            </TouchableOpacity>

            {isSaving && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#800000" />
                    <Text style={styles.loadingText}>Guardando ruta...</Text>
                </View>
            )}
        </View>
    );
};

export default TrackRoutes;

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { ...StyleSheet.absoluteFillObject },
    topControlsContainer: {
        position: 'absolute',
        top: 10, // Forzado a 10px desde el borde real de la pantalla
        left: 20,
        right: 20,
    },
    bottomInfoPanel: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 24,
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'space-around',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    statBox: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginTop: 2 },
    statLabel: { fontSize: 10, color: '#9ca3af', fontWeight: '700' },
    statDivider: { width: 1, height: 30, backgroundColor: '#f3f4f6' },
    setupCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 15, // Reducido de 20 a 15
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
    inlineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'between',
        marginBottom: 10,
        gap: 10,
    },
    colorPickerInline: {
        flexDirection: 'row',
        gap: 8,
        flex: 1,
        justifyContent: 'flex-end',
    },
    input: {
        backgroundColor: '#f9fafb',
        padding: 10,
        borderRadius: 10,
        fontSize: 13,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        marginBottom: 10,
    },
    colorOption: { width: 22, height: 22, borderRadius: 11, borderColor: 'white' }, // Más pequeños aún para el inline
    mainButton: {
        backgroundColor: '#800000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10, // Más compacto
        borderRadius: 10,
        gap: 8,
    },
    mainButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    trackingCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    recordingIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 },
    pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' },
    recordingText: { color: '#ef4444', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
    trackingButtons: { flexDirection: 'row', gap: 15, width: '100%' },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    actionButtonText: { color: 'white', fontWeight: 'bold' },
    myLocationButton: {
        position: 'absolute',
        right: 20,
        backgroundColor: 'white',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    loadingText: { marginTop: 15, color: '#800000', fontWeight: 'bold' },
});