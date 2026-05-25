# TuzoRutas - Funcionalidades Pendientes y Áreas de Mejora

Este documento recopila de manera detallada las funcionalidades que actualmente no están operativas, que contienen datos simulados (estáticos) o que requieren de una base de datos y un servidor para poder completarse de forma profesional.

---

## ✅ Funcionalidades Completadas

### A. Guardado de Rutas Trazadas (`src/screens/TrackRoutes.tsx`)
* **Estado**: ¡Completado! Ahora permite ingresar nombre, seleccionar color y registrar paradas durante el trayecto. Los datos se guardan de forma persistente en el servidor backend.

### B. Consumo de Rutas Dinámico (`src/screens/RutasScreen.tsx`)
* **Estado**: ¡Completado! La aplicación ahora consume las rutas directamente desde la base de datos a través de la API (`GET /api/rutas`).

### C. Dashboard Dinámico (`src/screens/InicioScreen.tsx`)
* **Estado**: ¡Completado! La pantalla de inicio ahora detecta la ubicación real del usuario y muestra el número exacto de rutas cercanas consultando al servidor.

---

## ❌ 1. Funcionalidades Incompletas y Limitaciones Actuales (Pendientes)

### A. Trazado en Segundo Plano (Background Tracking)
* **Limitación Actual**: `TrackRoutes.tsx` solo usa permisos en primer plano. Si el usuario bloquea el celular, el trazado se corta.
* **Solución Necesaria**: Implementar `expo-task-manager` y solicitar permisos de background.

---

## 🛠️ 2. Mejoras de Infraestructura y UI/UX Pendientes

### A. Trazado en Segundo Plano (Background Tracking)
* **Limitación Actual**: `TrackRoutes.tsx` solo usa permisos en primer plano (`requestForegroundPermissionsAsync`). Si el usuario bloquea el celular, lo guarda en el bolsillo, o abre otra aplicación como WhatsApp mientras camina trazando la ruta, el sistema operativo detendrá el GPS para ahorrar batería y el trazado se cortará.
* **Solución Necesaria**: Implementar tareas en segundo plano usando `expo-task-manager` y solicitar permisos en segundo plano (`requestBackgroundPermissionsAsync`) para asegurar que el registro de coordenadas continúe activo de forma continua aunque el celular esté bloqueado.

### B. Robustez, Errores y Carga (Loading States)
* **Limitación Actual**: No existen indicadores visuales mientras se consulta el mapa, se calculan coordenadas o si hay fallos en la conexión de red.
* **Qué falta**:
  - Skeletons o Spinners de carga (ej. mientras se obtiene la ubicación del GPS o se listan las rutas).
  - Manejo elegante de excepciones: ¿Qué pasa si el usuario no otorga permisos de GPS? ¿O si no tiene conexión a internet? Actualmente, la app puede fallar silenciosamente en estos escenarios.

---

## 📅 Hoja de Ruta Sugerida (Roadmap)

1. **Fase 1: Backend y Base de Datos (Prioridad Actual 🌟)**: Crear el servidor y la base de datos para almacenar rutas, coordenadas y paradas, exponiéndolos mediante una API REST.
2. **Fase 2: Conexión Frontend-Backend**: Conectar la app móvil a la API para que `TrackRoutes` guarde en el servidor y `RutasScreen` lea de él.
3. **Fase 3: Ubicación Real e Inteligencia**: Activar la geolocalización en la pantalla de Inicio y realizar cálculos geográficos desde el servidor para indicar rutas cercanas reales.
4. **Fase 4: Estabilización**: Añadir tracking en segundo plano, manejo de errores, loaders y pulir detalles visuales de la interfaz de usuario.
