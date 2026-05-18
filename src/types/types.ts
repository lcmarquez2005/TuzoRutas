export interface Coordenada {
    lat: number;
    lng: number;
}

export interface Parada {
    nombre: string;
    lat: number;
    lng: number;
}

export interface Ruta {
    id: string;
    nombre: string;
    color: string;
    distancia_km?: number;
    trayectoria: {
        lat: number;
        lng: number;
    }[];
    paradas: Parada[];
}