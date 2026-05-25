import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Platform, Share } from 'react-native';
import { ScreenContent } from './ScreenContent';
import { useAuth } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AjustesScreen = ({ navigation }: any) => {
  const { signOut, usuario } = useAuth();

  const handleCompartir = async () => {
    try {
      await Share.share({
        message: '¡Descarga TuzoRutas y optimiza tus traslados en Pachuca! 🚌💨',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSoporte = () => {
    Alert.alert("Soporte Técnico", "Contacta con nosotros en soporte@tuzorutas.com");
  };

  const handleAcercaDe = () => {
    Alert.alert("TuzoRutas", "Versión 1.2.0\nDesarrollado para la movilidad de Pachuca, Hidalgo.");
  };

  const SettingItem = ({ icon, title, subtitle, onPress, color = "#4b5563", isLast = false, destructive = false }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.6}
      className={`flex-row items-center p-4 bg-white ${!isLast ? 'border-b border-gray-100' : ''}`}
    >
      <View style={{ backgroundColor: destructive ? '#fee2e2' : '#f3f4f6', padding: 10, borderRadius: 12 }}>
        <MaterialCommunityIcons name={icon} size={22} color={destructive ? '#ef4444' : color} />
      </View>
      <View className="flex-1 ml-4">
        <Text className={`text-base font-semibold ${destructive ? 'text-red-500' : 'text-gray-800'}`}>{title}</Text>
        {subtitle && <Text className="text-xs text-gray-400 mt-0.5">{subtitle}</Text>}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-5 mt-6 mb-2">
      {title}
    </Text>
  );

  return (
    <ScreenContent title="Configuración" path="screens/AjustesScreen.tsx">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: 40,
          paddingTop: Platform.OS === 'ios' ? 0 : 40 
        }}
      >
        {/* Perfil del Usuario */}
        <View className="items-center py-6 bg-white mb-2">
          <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center border-4 border-white shadow-md">
            <MaterialCommunityIcons name="account" size={50} color="#800000" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mt-4">
            {usuario?.usuario || 'Pasajero Tuzo'}
          </Text>
          <Text className="text-gray-500">Pachuca, Hidalgo</Text>
          
          <TouchableOpacity 
            className="mt-4 px-6 py-2 bg-red-50 rounded-full border border-red-100"
            onPress={() => Alert.alert("Perfil", "Funcionalidad de edición próximamente.")}
          >
            <Text className="text-red-800 font-semibold text-xs">Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Herramientas de Administrador / Creador */}
        <SectionHeader title="Herramientas" />
        <View className="bg-white overflow-hidden rounded-2xl mx-4 shadow-sm">
          <SettingItem 
            icon="map-marker-plus" 
            title="Trazar Nueva Ruta" 
            subtitle="Graba un recorrido para el sistema"
            color="#800000"
            onPress={() => navigation.navigate('Track')}
          />
        </View>

        {/* Preferencias */}
        <SectionHeader title="Aplicación" />
        <View className="bg-white overflow-hidden rounded-2xl mx-4 shadow-sm">
          <SettingItem 
            icon="share-variant" 
            title="Compartir Aplicación" 
            subtitle="Invita a tus amigos"
            onPress={handleCompartir}
          />
          <SettingItem 
            icon="help-circle" 
            title="Soporte Técnico" 
            subtitle="¿Tienes algún problema?"
            onPress={handleSoporte}
          />
          <SettingItem 
            icon="information" 
            title="Acerca de TuzoRutas" 
            subtitle="Versión, créditos y más"
            isLast={true}
            onPress={handleAcercaDe}
          />
        </View>

        {/* Sesión */}
        <SectionHeader title="Cuenta" />
        <View className="bg-white overflow-hidden rounded-2xl mx-4 shadow-sm mb-6">
          <SettingItem 
            icon="logout" 
            title="Cerrar Sesión" 
            subtitle="Salir de tu cuenta actual"
            destructive={true}
            isLast={true}
            onPress={() => {
              Alert.alert(
                "Cerrar Sesión",
                "¿Estás seguro de que deseas salir?",
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Cerrar Sesión", onPress: signOut, style: "destructive" }
                ]
              );
            }}
          />
        </View>

        <Text className="text-center text-gray-300 text-xs mt-4">
          Hecho con ❤️ en la Bella Airosa
        </Text>
      </ScrollView>
    </ScreenContent>
  );
};

export default AjustesScreen;