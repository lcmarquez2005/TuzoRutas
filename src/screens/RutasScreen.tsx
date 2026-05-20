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
  Modal,
  TextInput,
  Platform,
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
  SlideInDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';

import { obtenerRutasDelServidor } from "../services/api";
import { Ruta } from "../types/types";
import { MOCK_PLACES, MockPlace } from "../lib/mockPlaces";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MIN_SHEET_HEIGHT = 180;
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.55; 
const HIDDEN_HEIGHT = 60;

const INITIAL_REGION = {
  latitude: 20.1011,
  longitude: -98.7591,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const RutasScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [rutasFiltradas, setRutasFiltradas] = useState<Ruta[]>([]);
  const [rutaActiva, setRutaActiva] = useState<Ruta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [modalBusqueda, setModalBusqueda] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [destino, setDestino] = useState<MockPlace | null>(null);
  const mapRef = useRef<MapView | null>(null);

  // Reanimated shared values
  const translateY = useSharedValue(0);
  const context = useSharedValue(0);

  const cargarRutas = async () => {
    try {
      const datos = await obtenerRutasDelServidor();
      setRutas(datos);
      if (!destino) setRutasFiltradas(datos);
    } catch (error) {
      Alert.alert("Error de Conexión", "No se pudieron cargar las rutas.");
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarRutas();
    }, [])
  );

  // Lógica de filtrado inteligente (Simulación Frontend)
  const filtrarRutasCercanas = (lugar: MockPlace) => {
    const RADIO_BUSQUEDA_KM = 0.5; // 500 metros
    
    const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Radio Tierra KM
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const nuevasRutas = rutas.filter(ruta => {
      // Si algún punto de la trayectoria está cerca del destino
      return ruta.trayectoria.some(p => {
        const dist = calcularDistancia(lugar.lat, lugar.lng, p.lat, p.lng);
        return dist <= RADIO_BUSQUEDA_KM;
      });
    });

    setRutasFiltradas(nuevasRutas);
    if (nuevasRutas.length === 0) {
      Alert.alert("Sin resultados", "No encontramos rutas que pasen a menos de 500m de este lugar.");
    }
  };

  const seleccionarLugar = (lugar: MockPlace) => {
    setDestino(lugar);
    setModalBusqueda(false);
    setSearchQuery("");
    filtrarRutasCercanas(lugar);

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lugar.lat,
        longitude: lugar.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
    // Minimizar panel para ver el punto
    translateY.value = withTiming(MIN_SHEET_HEIGHT - HIDDEN_HEIGHT, { duration: 400 });
  };

  const limpiarBusqueda = () => {
    setDestino(null);
    setRutasFiltradas(rutas);
    resetearVistaMapa();
  };

  const seleccionarRuta = (ruta: Ruta) => {
    setRutaActiva(ruta);
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

  const resetearVistaMapa = () => {
    setRutaActiva(null);
    if (mapRef.current) {
      mapRef.current.animateToRegion(INITIAL_REGION, 1000);
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
      const targetExpanded = -MAX_SHEET_HEIGHT + MIN_SHEET_HEIGHT;
      const targetMinimized = MIN_SHEET_HEIGHT - HIDDEN_HEIGHT;
      if (event.velocityY < -300) {
        translateY.value = withTiming(targetExpanded, { duration: 300 });
      } else if (event.velocityY > 300) {
        translateY.value = withTiming(targetMinimized, { duration: 300 });
      } else {
        const midpoint = (targetExpanded + targetMinimized) / 2;
        translateY.value = withTiming(translateY.value < midpoint ? targetExpanded : targetMinimized, { duration: 300 });
      }
    });

  const rSheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const rHandleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, -100], [1, 0.5], Extrapolate.CLAMP)
  }));

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#800000" />
        <Text style={{ marginTop: 10, color: "gray" }}>Cargando rutas...</Text>
      </View>
    );
  }

  const filteredPlaces = MOCK_PLACES.filter(p => 
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={INITIAL_REGION}
      >
        {!rutaActiva && rutasFiltradas.map((ruta) => (
          <Polyline
            key={`preview-${ruta.id}`}
            coordinates={ruta.trayectoria.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
            strokeColor={ruta.color + 'A0'}
            strokeWidth={4.5}
            tappable={true}
            onPress={() => seleccionarRuta(ruta)}
          />
        ))}

        {rutaActiva && (
          <>
            <Polyline
              coordinates={rutaActiva.trayectoria.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
              strokeColor={rutaActiva.color}
              strokeWidth={7}
            />
            {rutaActiva.paradas.map((p, index) => (
              <Marker key={`marker-${index}`} coordinate={{ latitude: p.lat, longitude: p.lng }} title={p.nombre} />
            ))}
          </>
        )}

        {destino && (
          <Marker 
            coordinate={{ latitude: destino.lat, longitude: destino.lng }}
            title={destino.nombre}
            description="Tu destino buscado"
          >
            <View style={styles.destinationMarker}>
              <MaterialCommunityIcons name="map-marker" size={30} color="#007AFF" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Buscador Superior */}
      <View style={[styles.searchContainer, { top: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.searchBar} 
          activeOpacity={0.9}
          onPress={() => setModalBusqueda(true)}
        >
          <MaterialCommunityIcons name="magnify" size={22} color="#6b7280" />
          <Text style={styles.searchText}>
            {destino ? destino.nombre : "Buscar rutas o lugares..."}
          </Text>
          {destino && (
            <TouchableOpacity onPress={limpiarBusqueda}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
          <View style={styles.searchDivider} />
          <TouchableOpacity onPress={() => (navigation as any).navigate('AjustesTab')}>
            <View style={styles.avatarMini}>
              <MaterialCommunityIcons name="account" size={18} color="#800000" />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Indicador Flotante Superior */}
      {rutaActiva && (
        <Animated.View entering={FadeInUp} exiting={FadeOutUp} style={[styles.floatingIndicator, { top: insets.top + 75 }]}>
          <View style={[styles.miniIconContainer, { backgroundColor: rutaActiva.color + '20' }]}>
            <MaterialCommunityIcons name="bus" size={20} color={rutaActiva.color} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.floatingRouteName} numberOfLines={1}>{rutaActiva.nombre}</Text>
            <Text style={styles.floatingRouteStatus}>Ruta seleccionada</Text>
          </View>
          <TouchableOpacity onPress={resetearVistaMapa} style={styles.closeButton}>
            <MaterialCommunityIcons name="close-circle" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Botón GPS */}
      <TouchableOpacity 
        style={[styles.centerButton, { bottom: MIN_SHEET_HEIGHT + 20 }]}
        onPress={resetearVistaMapa}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#800000" />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.sheetContainer, rSheetStyle]}>
        <GestureDetector gesture={gesture}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
            <View style={styles.handleContainer}>
              <Animated.View style={[styles.handle, rHandleStyle]} />
            </View>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {destino ? "Rutas recomendadas" : "Explorar Rutas"}
              </Text>
              <Text style={styles.sheetSubtitle}>
                {destino ? `Cerca de ${destino.nombre}` : "Desliza hacia arriba para ver más"}
              </Text>
            </View>
          </View>
        </GestureDetector>

        <ScrollView 
          style={styles.routeList}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={true}
        >
          {rutasFiltradas.map((ruta) => (
            <TouchableOpacity
              key={ruta.id}
              style={[styles.routeItem, rutaActiva?.id === ruta.id && styles.routeItemActive]}
              onPress={() => seleccionarRuta(ruta)}
            >
              <View style={[styles.iconContainer, { backgroundColor: ruta.color + '20' }]}>
                <MaterialCommunityIcons name="bus" size={24} color={ruta.color} />
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{ruta.nombre}</Text>
                <Text style={styles.routeDesc}>{ruta.paradas.length} paradas • Pachuca, Hgo.</Text>
              </View>
            </TouchableOpacity>
          ))}
          {destino && rutasFiltradas.length > 0 && (
            <TouchableOpacity style={styles.clearSearchFooter} onPress={limpiarBusqueda}>
              <Text style={styles.clearSearchText}>Ver todas las rutas</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Animated.View>

      {/* MODAL DE BUSQUEDA */}
      <Modal visible={modalBusqueda} animationType="slide" transparent={false}>
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalBusqueda(false)} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={28} color="#374151" />
            </TouchableOpacity>
            <TextInput
              autoFocus
              placeholder="¿A dónde quieres ir?"
              style={styles.modalInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialCommunityIcons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView style={styles.resultsList}>
            <Text style={styles.sectionTitle}>Lugares en Pachuca</Text>
            {filteredPlaces.map(lugar => (
              <TouchableOpacity 
                key={lugar.id} 
                style={styles.resultItem}
                onPress={() => seleccionarLugar(lugar)}
              >
                <View style={styles.resultIcon}>
                  <MaterialCommunityIcons name="map-marker-outline" size={24} color="#6b7280" />
                </View>
                <View>
                  <Text style={styles.resultName}>{lugar.nombre}</Text>
                  <Text style={styles.resultDesc} numberOfLines={1}>{lugar.descripcion}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default RutasScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { ...StyleSheet.absoluteFillObject },
  destinationMarker: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  searchContainer: { position: 'absolute', left: 15, right: 15, zIndex: 20 },
  searchBar: {
    backgroundColor: 'white', borderRadius: 30, height: 50, flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 15, elevation: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10,
  },
  searchText: { flex: 1, marginLeft: 10, color: '#4b5563', fontSize: 14, fontWeight: '500' },
  searchDivider: { width: 1, height: 24, backgroundColor: '#f3f4f6', marginHorizontal: 12 },
  avatarMini: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#fee2e2',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fecaca',
  },
  floatingIndicator: {
    position: 'absolute', left: 20, right: 20, backgroundColor: 'white', borderRadius: 20,
    padding: 12, flexDirection: 'row', alignItems: 'center', elevation: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, zIndex: 10,
  },
  miniIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  floatingRouteName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  floatingRouteStatus: { fontSize: 12, color: '#800000', fontWeight: '600' },
  closeButton: { padding: 4 },
  sheetContainer: {
    position: 'absolute', top: SCREEN_HEIGHT - MIN_SHEET_HEIGHT - 85, height: MAX_SHEET_HEIGHT + 100,
    width: '100%', backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    elevation: 20, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 10,
  },
  handleContainer: { width: '100%', height: 30, justifyContent: 'center', alignItems: 'center' },
  handle: { width: 40, height: 5, backgroundColor: '#e5e7eb', borderRadius: 3 },
  sheetHeader: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  sheetSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  routeList: { paddingHorizontal: 15 },
  routeItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#f3f4f6',
  },
  routeItemActive: { borderColor: '#80000030', backgroundColor: '#80000005' },
  iconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  routeInfo: { flex: 1 },
  routeName: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  routeDesc: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  centerButton: {
    position: 'absolute', right: 20, backgroundColor: 'white', width: 48, height: 48,
    borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, zIndex: 5,
  },
  modalContainer: { flex: 1, backgroundColor: 'white' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  backButton: { marginRight: 10 },
  modalInput: { flex: 1, fontSize: 18, color: '#1f2937', height: 50 },
  resultsList: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
  resultItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  resultIcon: { width: 44, height: 44, backgroundColor: '#f3f4f6', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  resultName: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  resultDesc: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  clearSearchFooter: { padding: 20, alignItems: 'center' },
  clearSearchText: { color: '#007AFF', fontWeight: 'bold', fontSize: 14 },
});