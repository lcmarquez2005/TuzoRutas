# TuzoRutas - Propuesta de Arquitectura de Base de Datos y Servidor

Este documento presenta una propuesta técnica completa para diseñar e implementar la base de datos y el servidor de **TuzoRutas**. Esta arquitectura permitirá que la aplicación móvil guarde de forma permanente las rutas trazadas, consulte paradas y comparta información en tiempo real entre todos los usuarios.

---

## 🏛️ 1. Arquitectura del Sistema (Backend & Base de Datos)

Para mantener una consistencia tecnológica con tu aplicación de React Native y asegurar la máxima eficiencia al trabajar con mapas y coordenadas, sugerimos la siguiente combinación:

* **Base de Datos**: **PostgreSQL** (con la extensión **PostGIS**).
  * *¿Por qué?* PostgreSQL es la base de datos relacional de código abierto más robusta del mercado. Al añadirle **PostGIS**, se convierte en el estándar de la industria para datos geográficos (permite calcular si una persona está cerca de una parada, medir distancias sobre la esfera terrestre directamente con SQL, etc.).
* **Servidor (API REST)**: **Node.js** con **Express.js** y **TypeScript**.
  * *¿Por qué?* Te permite programar el backend usando el mismo lenguaje que ya dominas en el frontend (TypeScript), reutilizando estructuras de datos y tipos, lo que agiliza exponencialmente el desarrollo.

---

## 💾 2. Diseño del Esquema de la Base de Datos (SQL)

La base de datos relacional constará de tres tablas principales altamente vinculadas mediante llaves foráneas (`Foreign Keys`) con eliminación en cascada (`ON DELETE CASCADE`) para evitar datos huérfanos.

### Diagrama de Relación (Entidades)
```text
  [rutas] (1) <------- (N) [coordenadas_trayectoria] (Define la línea azul del camino)
     |
     +-------> (N) [paradas]                 (Puntos de parada con nombre)
```

### Script de Creación SQL (PostgreSQL / MySQL)

Puedes copiar y ejecutar este código directamente en tu cliente de base de datos (ej. pgAdmin, DBeaver) para crear las tablas necesarias:

```sql
-- 1. Tabla de Rutas Principal
CREATE TABLE rutas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#800000', -- Código hexadecimal (ej: #FF0000)
    distancia_km DECIMAL(5, 2) DEFAULT 0.00,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Coordenadas para la Trayectoria (Dibuja la Polyline)
-- El campo 'orden' es crucial para asegurar que la línea se dibuje en el orden correcto en que se caminó.
CREATE TABLE coordenadas_trayectoria (
    id SERIAL PRIMARY KEY,
    ruta_id INT REFERENCES rutas(id) ON DELETE CASCADE,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    orden INT NOT NULL
);

-- 3. Tabla de Paradas Asociadas (Dibuja los Markers)
CREATE TABLE paradas (
    id SERIAL PRIMARY KEY,
    ruta_id INT REFERENCES rutas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    orden INT NOT NULL
);
```

---

## 🌐 3. Diseño de la API REST (Endpoints)

El servidor de Express expondrá los siguientes endpoints para comunicar la base de datos con la aplicación móvil.

### A. Obtener todas las rutas
* **Método**: `GET`
* **Ruta**: `/api/rutas`
* **Respuesta Esperada (`200 OK`)**:
```json
[
  {
    "id": 1,
    "nombre": "Tulipanes - Soriana del Valle",
    "color": "#1E90FF",
    "distancia_km": 4.12,
    "trayectoria": [
      { "lat": 20.061532, "lng": -98.774230 },
      { "lat": 20.065462, "lng": -98.771543 }
    ],
    "paradas": [
      { "nombre": "Soriana del Valle", "lat": 20.096733, "lng": -98.759784 }
    ]
  }
]
```

### B. Guardar una nueva ruta trazada
* **Método**: `POST`
* **Ruta**: `/api/rutas`
* **Cuerpo de la Petición (`Request Body`)**:
```json
{
  "nombre": "Nueva Ruta Trazada",
  "color": "#FF5733",
  "distancia_km": 1.45,
  "trayectoria": [
    { "lat": 20.1011, "lng": -98.7591 },
    { "lat": 20.1020, "lng": -98.7580 }
  ],
  "paradas": [
    { "nombre": "Parada Inicial", "lat": 20.1011, "lng": -98.7591 }
  ]
}
```
* **Respuesta Esperada (`211 Created`)**:
```json
{
  "mensaje": "Ruta guardada exitosamente",
  "rutaId": 12
}
```

---

## 📲 4. Cómo Conectar la Aplicación Móvil (Expo) con el Servidor

### A. El problema común de `localhost` en móviles
Cuando programas en tu computadora, tu backend corre en `http://localhost:3000`. Sin embargo, si abres tu app en un celular físico (con Expo Go), el celular no sabe qué es `localhost` (para el celular, `localhost` es él mismo, no tu computadora) y la conexión fallará.

### B. Solución: Usar Ngrok (¡Ya instalado en tu proyecto!)
En tu archivo `package.json` ya cuentas con `@expo/ngrok`. Ngrok crea un túnel seguro y gratuito desde el internet hacia tu servidor local, dándote una URL pública de tipo `https://xxxx-xxxx.ngrok-free.app` que funciona perfectamente tanto en simuladores como en celulares reales.

### C. Código de Ejemplo para Enviar la Ruta desde la App (`TrackRoutes.tsx`)

A continuación, se muestra una plantilla de cómo estructurar la función en TypeScript dentro de la aplicación móvil para enviar los datos capturados por GPS al servidor:

```typescript
import axios from 'axios'; // O puedes usar 'fetch' nativo

// Reemplaza con tu URL de Ngrok o IP local de tu computadora
const API_URL = "https://tu-subdominio.ngrok-free.app/api/rutas"; 

const guardarRutaEnServidor = async (
  nombreRuta: string, 
  colorRuta: string, 
  coordenadasCapturadas: LatLng[], 
  distanciaRecorrida: number
) => {
  try {
    const payload = {
      nombre: nombreRuta,
      color: colorRuta,
      distancia_km: parseFloat((distanciaRecorrida / 1000).toFixed(2)),
      // Convertimos las llaves a lat/lng como espera la BD
      trayectoria: coordenadasCapturadas.map((coord) => ({
        lat: coord.latitude,
        lng: coord.longitude
      })),
      // Paradas (puedes dejarlas vacías inicialmente o capturarlas con un botón)
      paradas: [] 
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      alert("¡Ruta guardada en el servidor exitosamente!");
    } else {
      alert("Error al guardar: " + data.mensaje);
    }
  } catch (error) {
    console.error("Error de conexión con el servidor:", error);
    alert("No se pudo conectar con el servidor backend.");
  }
};
```

---

## 🚀 Próximo Paso Recomendado
Te sugerimos iniciar creando un proyecto en una carpeta separada para tu backend (por ejemplo, llamada `TuzoRutas-Backend`) donde inicialices un servidor de Express con Node.js, configures la base de datos PostgreSQL, e implementes los endpoints indicados arriba para comenzar a recibir las rutas de tu celular en tiempo real.
