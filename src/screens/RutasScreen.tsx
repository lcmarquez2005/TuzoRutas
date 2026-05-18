import React from 'react';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRef, useState, useEffect } from "react"; 
import { ActivityIndicator, Alert } from "react-native";

import { obtenerRutasDelServidor } from "../services/api";
import { Ruta } from "../types/types";

const RutasScreen = () => {
  const [rutaActiva, setRutaActiva] = useState<Ruta | null>(null); // Es la ruta actualmente mostrada en el mapa y cambia a la otra ruta seleccionada, null para cuando abramos la app y no muestre ninguna ruta
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const mapRef = useRef<MapView | null>(null); // CONTROLA LA REFERNECIA DEL MAPA DESDE EL CODIGO NO SE Si LO USAREMOS

  useEffect(() => {
    const cargarRutas = async () => {
      try {
        const datos = await obtenerRutasDelServidor();
        setRutas(datos);
      } catch (error) {
        Alert.alert("Error de Conexión", "No se pudieron cargar las rutas desde el servidor.");
      } finally {
        setCargando(false);
      }
    };
    cargarRutas();
  }, []);

  // Funcion de cuando se selecciona la ruta
  const seleccionarRuta = (ruta: Ruta) => {
    setRutaActiva(ruta); //Guarda la ruta

    if (mapRef.current) {
      //Centra el mapa en la ruta
      mapRef.current.fitToCoordinates(
        //Convierte las cordenadas
        ruta.trayectoria.map((p) => ({
          latitude: p.lat,
          longitude: p.lng,
        })),
        //Muestra un margen alrededor de la tuta 
        {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        }
      );
    }
  };

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#800000" />
        <Text style={{ marginTop: 10, color: 'gray' }}>Descargando rutas del servidor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>


      {/* Menu de rutas */}
      <ScrollView
        horizontal
        style={styles.menu}
        showsHorizontalScrollIndicator={false}
      >
        {rutas.map((ruta) => (
          <TouchableOpacity
            key={ruta.id}
            style={[styles.button, { backgroundColor: ruta.color }]}
            onPress={() => seleccionarRuta(ruta)}
          >
            <Text style={styles.buttonText}>{ruta.nombre}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Mapa */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 20.1011,
          longitude: -98.7591,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >

        {/* Ruta seleccionada */}
        {rutaActiva && (
          <>
            <Polyline
              coordinates={rutaActiva.trayectoria.map((p) => ({
                latitude: p.lat,
                longitude: p.lng,
              }))}
              strokeColor={rutaActiva.color}
              strokeWidth={5}
            />

            {rutaActiva.paradas.map((p, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: p.lat,
                  longitude: p.lng,
                }}
                title={p.nombre}
              />
            ))}
          </>
        )}
      </MapView>
    </View>
  );
};

export default RutasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    height: 65,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  menu: {
    maxHeight: 65,
    paddingVertical: 8,
    backgroundColor: "#f2f2f2",
  },

  button: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  map: {
    flex: 1,
  },
});