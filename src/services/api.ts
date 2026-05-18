import { Ruta } from '../types/types';

// URL de Ngrok para pruebas en celular físico
const API_URL = 'https://tuzorutas-backend.onrender.com/api';

export const loginUsuario = async (
  usuario: string,
  password: string
): Promise<{ token: string; usuario: any }> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ usuario, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.mensaje || 'Error al iniciar sesión');
    }

    return await response.json();
  } catch (error) {
    console.error("Error en loginUsuario:", error);
    throw error;
  }
};

export const obtenerRutasDelServidor = async (): Promise<Ruta[]> => {
  try {
    const response = await fetch(`${API_URL}/rutas`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener rutas desde el servidor:", error);
    throw error; // Lanzar para manejarlo en la UI
  }
};

export const guardarRutaEnServidor = async (
  rutaData: Omit<Ruta, 'id'>,
  token: string
): Promise<{ mensaje: string; rutaId: number }> => {
  try {
    console.log("Enviando ruta al servidor:", JSON.stringify(rutaData, null, 2));
    const response = await fetch(`${API_URL}/rutas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Bypasses the ngrok interstitial page
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(rutaData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error del servidor (${response.status}):`, errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { mensaje: errorText };
      }
      throw new Error(errorData.mensaje || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log("Respuesta del servidor:", result);
    return result;
  } catch (error) {
    console.error("Error al guardar la ruta en el servidor:", error);
    throw error;
  }
};

export const obtenerRutasCercanas = async (
  lat: number,
  lng: number,
  radio: number = 1000
): Promise<Ruta[]> => {
  try {
    const response = await fetch(`${API_URL}/rutas/cercanas?lat=${lat}&lng=${lng}&radio=${radio}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener rutas cercanas:", error);
    throw error;
  }
};
