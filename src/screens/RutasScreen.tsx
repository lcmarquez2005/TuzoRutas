import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  FadeInUp,
  FadeOutUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';

import { obtenerRutasDelServidor } from "../services/api";
import { Ruta } from "../types/types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MIN_SHEET_HEIGHT = 180;
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.55; // Reducido de 0.7 a 0.55 para que no llegue tan arriba
const HIDDEN_HEIGHT = 60; // Solo la muesca y un poco de título

const INITIAL_REGION = {
  latitude: 20.1011,
  longitude: -98.7591,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const RutasScreen = () => {
  const insets = useSafeAreaInsets();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [rutaActiva, setRutaActiva] = useState<Ruta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const mapRef = useRef<MapView | null>(null);

  const resetearVistaMapa = () => {
    setRutaActiva(null);
    if (mapRef.current) {
      mapRef.current.animateToRegion(INITIAL_REGION, 1000);
    }
  };

  // Reanimated shared values
  const translateY = useSharedValue(0);
  const context = useSharedValue(0);

  const cargarRutas = async () => {
    try {
      const datos = await obtenerRutasDelServidor();
      setRutas(datos);
    } catch (error) {
      Alert.alert(
        "Error de Conexión",
        "No se pudieron cargar las rutas desde el servidor."
      );
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarRutas();
    }, [])
  );

  const seleccionarRuta = (ruta: Ruta) => {
    setRutaActiva(ruta);
    // Deslizar hasta abajo (minimizado) al seleccionar para ver el mapa completo
    const targetMinimized = MIN_SHEET_HEIGHT - HIDDEN_HEIGHT;
    translateY.value = withTiming(targetMinimized, { 
      duration: 400,
      easing: Easing.out(Easing.quad) 
    });

    if (mapRef.current) {
      mapRef.current.fitToCoordinates(
        ruta.trayectoria.map((p) => ({
          latitude: p.lat,
          longitude: p.lng,
        })),
        {
          edgePadding: { top: 120, right: 50, bottom: 120, left: 50 },
          animated: true,
        }
      );
    }
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value;
      translateY.value = Math.max(translateY.value, -MAX_SHEET_HEIGHT + MIN_SHEET_HEIGHT);
      translateY.value = Math.min(translateY.value, MIN_SHEET_HEIGHT - HIDDEN_HEIGHT);
    })
    .onEnd((event) => {
      // Puntos de snap: Solo Expandido y Minimizado
      const targetExpanded = -MAX_SHEET_HEIGHT + MIN_SHEET_HEIGHT;
      const targetMinimized = MIN_SHEET_HEIGHT - HIDDEN_HEIGHT;

      if (event.velocityY < -300) {
        // Swipe fuerte hacia arriba
        translateY.value = withTiming(targetExpanded, { duration: 300 });
      } else if (event.velocityY > 300) {
        // Swipe fuerte hacia abajo
        translateY.value = withTiming(targetMinimized, { duration: 300 });
      } else {
        // Basado en posición (punto medio entre los dos extremos)
        const midpoint = (targetExpanded + targetMinimized) / 2;
        if (translateY.value < midpoint) {
          translateY.value = withTiming(targetExpanded, { duration: 300 });
        } else {
          translateY.value = withTiming(targetMinimized, { duration: 300 });
        }
      }
    });

  const rSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const rHandleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
        translateY.value,
        [0, -100],
        [1, 0.5],
        Extrapolate.CLAMP
    );
    return { opacity };
  });

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#800000" />
        <Text style={{ marginTop: 10, color: "gray" }}>Cargando rutas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mapa */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={INITIAL_REGION}
      >
        {/* Vista Previa de TODAS las rutas (solo cuando no hay una activa o como fondo) */}
        {!rutaActiva && rutas.map((ruta) => (
          <Polyline
            key={`preview-${ruta.id}`}
            coordinates={ruta.trayectoria.map((p) => ({
              latitude: p.lat,
              longitude: p.lng,
            }))}
            strokeColor={ruta.color + 'A0'} // 'A0' es aproximadamente 63% de opacidad (antes '60')
            strokeWidth={4.5} // Antes 3
            tappable={true}
            onPress={() => seleccionarRuta(ruta)}
          />
        ))}

        {/* Ruta seleccionada activamente (con más detalle y opacidad total) */}
        {rutaActiva && (
          <>
            <Polyline
              coordinates={rutaActiva.trayectoria.map((p) => ({
                latitude: p.lat,
                longitude: p.lng,
              }))}
              strokeColor={rutaActiva.color}
              strokeWidth={7} // Antes 6
            />
            {rutaActiva.paradas.map((p, index) => (
              <Marker
                key={`marker-${index}`}
                coordinate={{ latitude: p.lat, longitude: p.lng }}
                title={p.nombre}
              />
            ))}
          </>
        )}
      </MapView>

      {/* Indicador Flotante Superior */}
      {rutaActiva && (
        <Animated.View 
          entering={FadeInUp.duration(400)}
          exiting={FadeOutUp.duration(300)}
          style={[
            styles.floatingIndicator,
            { top: insets.top + 15 }
          ]}
        >
          <View style={[styles.miniIconContainer, { backgroundColor: rutaActiva.color + '20' }]}>
            <MaterialCommunityIcons name="bus" size={20} color={rutaActiva.color} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.floatingRouteName} numberOfLines={1}>{rutaActiva.nombre}</Text>
            <Text style={styles.floatingRouteStatus}>Ruta seleccionada</Text>
          </View>
          <TouchableOpacity 
            onPress={resetearVistaMapa}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close-circle" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Botón Flotante para Centrar Mapa */}
      <TouchableOpacity 
        style={[
          styles.centerButton,
          { bottom: MIN_SHEET_HEIGHT + 20 } // Bajado de +100 a +20 para estar más cerca del panel
        ]}
        onPress={resetearVistaMapa}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#800000" />
      </TouchableOpacity>

      {/* Bottom Sheet Desplegable */}
      <Animated.View 
        style={[
          styles.sheetContainer, 
          rSheetStyle,
        ]}
      >
        <GestureDetector gesture={gesture}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
            <View style={styles.handleContainer}>
              <Animated.View style={[styles.handle, rHandleStyle]} />
            </View>
            
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Explorar Rutas</Text>
              <Text style={styles.sheetSubtitle}>Desliza hacia arriba para ver más</Text>
            </View>
          </View>
        </GestureDetector>

        <ScrollView 
          style={styles.routeList}
          contentContainerStyle={{ 
            paddingBottom: insets.bottom + 120 
          }}
          showsVerticalScrollIndicator={true}
        >
          {rutas.map((ruta) => (
            <TouchableOpacity
              key={ruta.id}
              style={[
                  styles.routeItem,
                  rutaActiva?.id === ruta.id && styles.routeItemActive
              ]}
              onPress={() => seleccionarRuta(ruta)}
            >
              <View 
                  style={[styles.iconContainer, { backgroundColor: ruta.color + '20' }]}
              >
                <MaterialCommunityIcons name="bus" size={24} color={ruta.color} />
              </View>
              
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{ruta.nombre}</Text>
                <Text style={styles.routeDesc}>
                  {ruta.paradas.length} paradas • Pachuca, Hgo.
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default RutasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingIndicator: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  miniIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingRouteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  floatingRouteStatus: {
    fontSize: 12,
    color: '#800000',
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  sheetContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT - MIN_SHEET_HEIGHT - 85,
    height: MAX_SHEET_HEIGHT + 100,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  handleContainer: {
    width: '100%',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sheetSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  routeList: {
    paddingHorizontal: 15,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  routeItemActive: {
    borderColor: '#80000030',
    backgroundColor: '#80000005',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  routeDesc: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  centerButton: {
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
    zIndex: 5,
  },
});