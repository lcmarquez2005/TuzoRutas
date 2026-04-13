import React, { useEffect, useRef, useState } from "react";
import { View, Button, StyleSheet, Text, Pressable } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { LatLng } from "react-native-maps";



const TrackRoutes = () => {

    const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
    const [distance, setDistance] = useState(0);

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
    const stopTracking = () => {
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }

        console.log("Ruta guardada:", routeCoords);
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
                        strokeColor="blue"
                    />
                )}

                {currentLocation && (
                    <Marker coordinate={currentLocation} />
                )}

            </MapView>

            <View style={styles.buttons}>
                <Button title="Iniciar ruta" onPress={startTracking} />
                <Button title="Detener ruta" onPress={stopTracking} />


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