export interface Ruta {
  id: string;
  nombre: string;
  tipo: 'combi' | 'tuzobus';
  color: string;

  coordenadas: {
    latitude: number;
    longitude: number;
  }[];
}