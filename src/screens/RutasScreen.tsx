import React from 'react';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRef, useState } from "react"; // para guardar la ruta seleccionada y para que se tenga la referencia directa al mapa para moverlo o que se centre

import { rutas } from "../data/rutas";
import { Ruta } from "../types/types";

const RutasScreen = () => {
  const [rutaActiva, setRutaActiva] = useState<Ruta | null>(null); // Es la ruta actualmente mostrada en el mapa y cambia a la otra ruta seleccionada, null para cuando abramos la app y no muestre ninguna ruta
  const mapRef = useRef<MapView | null>(null); // CONTROLA LA REFERNECIA DEL MAPA DESDE EL CODIGO NO SE Si LO USAREMOS

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