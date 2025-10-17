export interface Neighborhood {
    name: string;
    lat: number;
    lon: number;
}

export interface OverpassElement {
    id: number;
    lat: number;
    lon: number;
    tags?: {
        name?: string;
        [key: string]: string | undefined;
    };
    type: string;
}

export interface WeatherData {
    temp: string; // temperatura atual
    feelsLike?: string; // sensação térmica
    humidity?: string; // umidade relativa
    windspeed?: string; // velocidade do vento
    weathercode?: string; // símbolo ou código do tempo
    pressure?: string; // pressão atmosférica
    precipitation?: string; // quantidade de chuva
    updatedAt?: string; // data da atualização
}

export interface MapsProps {
    width?: string;
    height?: string;
    neighborhoods: Neighborhood[];
    temperatures: Record<string, WeatherData | null>;
}

export interface NeighborhoodWeather {
    neighborhood: Neighborhood;
    weather: WeatherData;
}
