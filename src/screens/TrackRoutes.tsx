import React, { useEffect, useRef, useState } from "react";
import { View, Button, StyleSheet, Text, Pressable, Alert, TextInput, ActivityIndicator } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { LatLng } from "react-native-maps";
import { guardarRutaEnServidor } from "../services/api";
import { useAuth } from "../context/AuthContext";



const TrackRoutes = () => {
    const { token } = useAuth();

    const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
    const [distance, setDistance] = useState(0);
    const [nombreRuta, setNombreRuta] = useState("Nueva Ruta");
    const [colorRuta, setColorRuta] = useState("#FF0000"); // Rojo por defecto
    const [isTracking, setIsTracking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [paradas, setParadas] = useState<{nombre: string, lat: number, lng: number}[]>([]);

    const colores = [
        { label: "Rojo", value: "#FF0000" },
        { label: "Azul", value: "#0000FF" },
        { label: "Verde", value: "#008000" },
        { label: "Naranja", value: "#FFA500" },
        { label: "Morado", value: "#800080" },
    ];

    const mapRef = useRef<MapView | null>(null);

    // pedir permisos
    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
            console.log("Permiso de ubicación denegado");
            return;
        }
    };

    useEffect(() => {
        requestLocationPermission();
    }, []);

    // iniciar tracking
    const startTracking = async () => {
        setIsTracking(true);
        locationSubscription.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 2000,
                distanceInterval: 2,
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

                        if (dist > 2) { // filtro de ruido GPS
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

    // detener tracking
    const stopTracking = async () => {
        setIsTracking(false);
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }

        setIsSaving(true);
        try {
            if (!token) {
                Alert.alert("Error", "No has iniciado sesión correctamente.");
                return;
            }

            await guardarRutaEnServidor({
                nombre: nombreRuta || "Ruta sin nombre",
                color: colorRuta,
                distancia_km: parseFloat((distance / 1000).toFixed(2)),
                trayectoria: routeCoords.map(c => ({ lat: c.latitude, lng: c.longitude })),
                paradas: paradas
            }, token);
            Alert.alert("Éxito", "Ruta guardada correctamente en el servidor.");
            setRouteCoords([]);
            setDistance(0);
            setNombreRuta("Nueva Ruta");
            setColorRuta("#FF0000");
            setParadas([]);
        } catch (error) {
            Alert.alert("Error", "No se pudo guardar la ruta en el servidor.");
        } finally {
            setIsSaving(false);
        }
    };

    const guardarParada = () => {
        if (!currentLocation) {
            Alert.alert("Espere", "Aún calculando ubicación GPS actual...");
            return;
        }
        const nuevaParada = {
            nombre: `Parada ${paradas.length + 1}`,
            lat: currentLocation.latitude,
            lng: currentLocation.longitude
        };
        setParadas(prev => [...prev, nuevaParada]);
        Alert.alert("Parada guardada", `Se registró la ${nuevaParada.nombre} correctamente.`);
    };

    const calculateDistance = (point1: LatLng, point2: LatLng) => {
        const R = 6371e3;

        const φ1 = (point1.latitude * Math.PI) / 180;
        const φ2 = (point2.latitude * Math.PI) / 180;

        const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
        const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) *
            Math.cos(φ2) *
            Math.sin(Δλ / 2) *
            Math.sin(Δλ / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const centerMap = (location: LatLng) => {
        mapRef.current?.animateCamera({
            center: location,
            zoom: 17,
        });
    };

    return (
        <View style={styles.container}>

            <View
                style={{
                    position: "absolute",
                    top: 60,
                    left: 20,
                    backgroundColor: "white",
                    padding: 10,
                    borderRadius: 10,
                }}
            >
            </View>
            <Text>
                Distancia: {(distance / 1000).toFixed(2)} km
            </Text>

            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: 20.1011,
                    longitude: -98.7591,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >

                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeWidth={4}
                        strokeColor={colorRuta}
                    />
                )}

                {paradas.map((p, index) => (
                    <Marker 
                        key={`parada-${index}`} 
                        coordinate={{ latitude: p.lat, longitude: p.lng }}
                        title={p.nombre}
                        pinColor="green"
                    />
                ))}

                {currentLocation && (
                    <Marker coordinate={currentLocation} />
                )}

            </MapView>

            <View style={styles.buttons}>
                <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Nombre de la ruta:</Text>
                    <TextInput 
                        style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 10, minWidth: 200 }}
                        placeholder="Ej. Ruta Centro"
                        value={nombreRuta}
                        onChangeText={setNombreRuta}
                        editable={!isTracking && !isSaving}
                    />
                    
                    {!isTracking && (
                        <>
                            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Color identificador:</Text>
                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                                {colores.map((c) => (
                                    <Pressable
                                        key={c.value}
                                        onPress={() => setColorRuta(c.value)}
                                        style={{
                                            width: 30,
                                            height: 30,
                                            borderRadius: 15,
                                            backgroundColor: c.value,
                                            borderWidth: colorRuta === c.value ? 3 : 0,
                                            borderColor: '#000'
                                        }}
                                    />
                                ))}
                            </View>
                        </>
                    )}

                    {!isTracking ? (
                        <Button title="Iniciar trazado" onPress={startTracking} disabled={isSaving} />
                    ) : (
                        <View style={{ gap: 10 }}>
                            <Button title="📍 Registrar Parada" onPress={guardarParada} color="#059669" />
                            <Button title="Finalizar y Guardar" onPress={stopTracking} color="#DC2626" />
                        </View>
                    )}
                </View>
                {isSaving && <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 10 }} />}
            </View>

            <View>
                <Pressable
                    className="absolute bottom-[180px] right-5 bg-white p-2.5 rounded-lg"
                    onPress={() => currentLocation && centerMap(currentLocation)}
                >
                    <Text>|o|</Text>
                </Pressable>
            </View>

        </View>
    );
};

export default TrackRoutes;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    map: {
        flex: 1,
    },

    buttons: {
        position: "absolute",
        bottom: 100,
        alignSelf: "center",
        gap: 10,
    },
});
