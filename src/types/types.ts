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
    trayectoria: {
        lat: number;
        lng: number;
    }[];
    paradas: Parada[];
}