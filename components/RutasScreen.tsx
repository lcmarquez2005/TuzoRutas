import React from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';

const RutasScreen = () => {
  // Coordenadas de Pachuca de Soto, Hidalgo
  const pachucaRegion = {
    latitude: 20.1010608,
    longitude: -98.7591311,
    latitudeDelta: 0.05, // Controla el nivel de zoom
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE} // Forzamos el uso de Google Maps
        style={styles.map}
        initialRegion={pachucaRegion}
        showsUserLocation={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default RutasScreen;