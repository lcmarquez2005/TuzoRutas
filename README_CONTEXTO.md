# TuzoRutas - Contexto y Arquitectura de la Aplicación

¡Bienvenido a **TuzoRutas**! Este documento proporciona una visión general y detallada de cómo funciona la aplicación móvil actualmente, su estructura de archivos, el flujo de navegación y los componentes tecnológicos clave.

---

## 📌 Resumen del Proyecto
**TuzoRutas** es una aplicación móvil diseñada en **Expo** y **React Native** con **TypeScript** para optimizar la movilidad inteligente en la ciudad de Pachuca de Soto, Hidalgo. Actualmente, la app permite visualizar rutas predefinidas de transporte público (incluyendo trayectorias y paradas específicas en el mapa) y trazar nuevas rutas en tiempo real utilizando el GPS integrado del dispositivo.

---

## 🛠️ Pila Tecnológica
La aplicación está construida sobre las siguientes tecnologías modernas de desarrollo híbrido:

1. **Núcleo del Framework**: [Expo](https://expo.dev/) (SDK 54) y [React Native](https://reactnative.dev/) (v0.81.5), lo que facilita el desarrollo ágil multiplataforma para Android e iOS.
2. **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) para un tipado estático seguro que previene errores en tiempo de ejecución.
3. **Estilos y UI**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS adaptado a React Native) para un diseño responsivo, estético y ágil basado en clases de utilidad.
4. **Navegación**: [@react-navigation](https://reactnavigation.org/) (Bottom Tabs para el menú principal y Native Stack para subpantallas como el trazado de rutas).
5. **Mapas y Geolocalización**:
   - `react-native-maps` para renderizar el visor del mapa interactivo de Google Maps.
   - `expo-location` para acceder al GPS del dispositivo en primer plano, solicitar permisos y monitorear la ubicación en tiempo real.

---

## 📂 Estructura de Directorios
El código fuente de la aplicación se encuentra organizado bajo la carpeta `/src`, siguiendo las mejores prácticas de modularidad:

```text
TuzoRutas/
├── App.tsx                     # Punto de entrada principal de la aplicación
├── package.json                # Dependencias, scripts y configuración del proyecto
├── tailwind.config.js          # Configuración de Tailwind CSS / NativeWind
├── global.css                  # Estilos globales y variables de diseño
└── src/
    ├── navigation/             # Configuración de los flujos de navegación
    │   ├── TabNavigator.tsx    # Barra de pestañas principal (Inicio, Rutas, Ajustes)
    │   └── AjustesStack.tsx    # Stack de pantallas internas de Ajustes (Configuración -> Trazar Ruta)
    ├── screens/                # Vistas o pantallas principales del sistema
    │   ├── InicioScreen.tsx    # Dashboard principal con tarjetas de bienvenida y estado
    │   ├── RutasScreen.tsx     # Mapa principal interactivo con selector de rutas y paradas
    │   ├── TrackRoutes.tsx     # Interfaz para grabar y trazar una ruta por GPS en tiempo real
    │   ├── AjustesScreen.tsx   # Menú de configuración y acceso al trazador
    │   └── ScreenContent.tsx   # Contenedor/Wrapper genérico de pantallas
    ├── components/             # Componentes de UI reutilizables
    │   ├── Button.tsx          # Componente personalizado de botón
    │   └── ui/                 # Primitives de UI de bajo nivel (Button, Card, Input, Label, Text)
    ├── data/                   # Datos estáticos y mocks locales
    │   └── rutas.ts            # Definición en código de las rutas actuales y coordenadas de Pachuca
    ├── types/                  # Tipos de TypeScript e Interfaces del dominio
    │   └── types.ts            # Interfaces para Coordenada, Parada y Ruta
    └── lib/                    # Configuración de librerías y utilidades comunes
        └── utils.ts            # Función 'cn' para combinar dinámicamente estilos Tailwind
```

---

## 🔄 Funcionamiento de los Flujos de la App

La aplicación se compone de tres secciones principales accesibles desde el menú inferior de navegación (Bottom Tab Bar):

### 1. Inicio (`InicioScreen.tsx`)
* **Descripción**: Funciona como un tablero informativo (Dashboard) para el usuario.
* **Componentes**:
  - Encabezado con el nombre de la app y slogan.
  - Tarjeta de bienvenida destacada en azul.
  - Tarjetas rápidas con información dinámica simulada:
    - **Tu ubicación**: Indica el estado actual de la geolocalización (actualmente dice *"Detectando ubicación..."* de forma estática).
    - **Estado de rutas**: Reporta cuántas rutas están disponibles cercanas (estático: *"5 rutas disponibles cercanas"*).
    - **Recomendación**: Sugerencia de uso del sistema.

### 2. Rutas (`RutasScreen.tsx`)
* **Descripción**: Permite visualizar las trayectorias reales de transporte de Pachuca sobre el mapa.
* **Flujo**:
  - Al abrirse, muestra un mapa centrado en Pachuca de Soto.
  - En la parte superior, hay un menú horizontal deslizable (`ScrollView`) con botones de las rutas disponibles provenientes de `src/data/rutas.ts` (ej. **Ruta Centro** en color rojo y **Tulipanes - Soriana del Valle** en color azul).
  - Al pulsar sobre una de las rutas:
    1. El mapa realiza una animación automática (`fitToCoordinates`) para encuadrar perfectamente la trayectoria completa en la pantalla con márgenes suaves (`edgePadding`).
    2. Se dibuja una línea continua (`Polyline`) sobre las calles que sigue el transporte con el color característico de la ruta.
    3. Se colocan marcadores (`Marker`) en cada una de las paradas autorizadas de la ruta seleccionada con sus respectivos nombres (ej. *"Soriana del Valle"*).

### 3. Ajustes y Trazar Ruta (`TrackRoutes.tsx`)
* **Descripción**: Permite a los administradores o choferes trazar y capturar una nueva ruta de transporte en tiempo real caminando o manejando con el celular.
* **Flujo**:
  - Se accede desde la pestaña **Ajustes** pulsando el botón *"Ir a Track Routes"*.
  - Al cargar la pantalla, solicita de forma segura permisos de ubicación al sistema operativo (`Location.requestForegroundPermissionsAsync`).
  - **Iniciar Ruta**: Al pulsar este botón, la aplicación inicia un servicio de escucha en tiempo real (`Location.watchPositionAsync`) con alta precisión que se actualiza cada 2 segundos o cada 2 metros.
    - Se dibuja una línea azul (`Polyline`) que muestra el camino recorrido en tiempo real.
    - Se coloca un marcador (`Marker`) en la ubicación actual del usuario.
    - El mapa se auto-centra dinámicamente acompañando al usuario en su recorrido.
    - Se calcula la **distancia total acumulada** en kilómetros mediante la fórmula matemática de Haversine (filtrando ruidos del GPS menores a 2 metros).
  - **Detener Ruta**: Al pulsar este botón, el servicio de escucha GPS se detiene y se muestra en la consola de depuración de desarrollo los datos exactos capturados de la ruta: `console.log("Ruta guardada:", routeCoords);`.

---

## 🚀 Cómo Iniciar la Aplicación en Desarrollo

Si deseas ejecutar este proyecto localmente, sigue estos pasos:

1. **Instalar Dependencias**:
   ```bash
   npm install
   ```
2. **Iniciar Servidor Expo**:
   ```bash
   npm start
   ```
3. **Ejecutar en tu dispositivo o emulador**:
   - Presiona `a` para abrir en un emulador de **Android**.
   - Presiona `i` para abrir en un emulador de **iOS** (disponible solo en macOS).
   - Escanea el código QR que se muestra en la consola usando la aplicación **Expo Go** en tu celular físico para probar la geolocalización en tiempo real.
