# Instrucciones para la Implementación en el Backend: Búsqueda de Rutas por Proximidad

## Objetivo
Implementar un endpoint en el backend que permita encontrar qué rutas de transporte público pasan cerca de un punto geográfico específico (latitud y longitud).

## Contexto de la Base de Datos
Asumiendo que las rutas están almacenadas con una estructura que incluye un array de coordenadas (trayectoria) o puntos clave.

## Requerimientos del Endpoint

**Método:** `GET`
**Ruta Sugerida:** `/api/rutas/cercanas-a-punto`

**Parámetros de Consulta (Query Params):**
- `lat` (float, requerido): Latitud del punto buscado.
- `lng` (float, requerido): Longitud del punto buscado.
- `radio` (int, opcional, por defecto 500): Radio de búsqueda en metros.

### Lógica de Búsqueda (Algoritmo de Proximidad)
El backend debe realizar una consulta espacial. Si estás utilizando **PostgreSQL con PostGIS**, la consulta ideal involucra `ST_DWithin`. Si usas **MongoDB con índices 2dsphere**, puedes usar `$near` o `$geoWithin`.

**Pseudocódigo de la Lógica:**
1. Recibir `lat`, `lng` y `radio` (ej. 500 metros).
2. Para cada ruta en la base de datos, analizar su arreglo de puntos (`trayectoria`).
3. Si *cualquier punto* de la trayectoria de la ruta se encuentra dentro del `radio` del punto buscado, la ruta se considera un resultado válido.
4. (Opcional pero recomendado) Ordenar los resultados por la distancia mínima calculada al punto buscado.

### Respuesta Esperada (JSON)
Devolver un array de objetos de ruta con la misma estructura que el endpoint `/api/rutas` actual, idealmente añadiendo un campo virtual indicando la proximidad si es posible.

```json
[
  {
    "id": "1",
    "nombre": "Troncal Centro",
    "color": "#800000",
    "distancia_km": 15.2,
    "trayectoria": [...],
    "paradas": [...],
    "distancia_al_punto_buscado_metros": 120
  },
  ...
]
```

## Notas Adicionales para el Desarrollador Backend
- Asegúrate de que el cálculo de distancias considere la curvatura de la tierra (fórmulas geoespaciales reales, no simple distancia euclidiana).
- Si las trayectorias tienen miles de puntos, asegúrate de que los índices espaciales estén configurados correctamente para no degradar el rendimiento del servidor.
