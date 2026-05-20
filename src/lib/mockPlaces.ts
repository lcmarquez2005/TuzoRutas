export interface MockPlace {
    id: string;
    nombre: string;
    descripcion: string;
    lat: number;
    lng: number;
}

export const MOCK_PLACES: MockPlace[] = [
    {
        id: '1',
        nombre: 'Reloj Monumental',
        descripcion: 'Plaza Independencia, Centro Histórico',
        lat: 20.1235,
        lng: -98.7303,
    },
    {
        id: '2',
        nombre: 'Galerías Pachuca',
        descripcion: 'Centro comercial, Zona Plateada',
        lat: 20.1032,
        lng: -98.7745,
    },
    {
        id: '3',
        nombre: 'CEVIDE (UAEH)',
        descripcion: 'Ciudad del Conocimiento, Carretera Pachuca-Tulancingo',
        lat: 20.0934,
        lng: -98.7118,
    },
    {
        id: '4',
        nombre: 'Plaza Juárez',
        descripcion: 'Palacio de Gobierno, Centro',
        lat: 20.1205,
        lng: -98.7368,
    },
    {
        id: '5',
        nombre: 'Estadio Hidalgo',
        descripcion: 'Cuna del fútbol mexicano',
        lat: 20.1065,
        lng: -98.7561,
    },
    {
        id: '6',
        nombre: 'Central de Autobuses',
        descripcion: 'Bulevar Javier Rojo Gómez',
        lat: 20.1039,
        lng: -98.7495,
    },
    {
        id: '7',
        nombre: 'Real del Monte',
        descripcion: 'Pueblo Mágico, afueras de Pachuca',
        lat: 20.1389,
        lng: -98.6725,
    }
];
