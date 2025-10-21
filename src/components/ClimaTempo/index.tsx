import axios, { AxiosError } from "axios";
import {
    Calendar,
    Cloud,
    CloudRain,
    Droplets,
    Gauge,
    Wind,
} from "lucide-react";
import { useEffect, useState } from "react";

// ==================== CONSTANTS ====================
const MANAUS_CENTER = { lat: -3.119, lon: -60.0217 } as const;
const MET_API =
    "https://api.met.no/weatherapi/locationforecast/2.0/compact" as const;
const OVERPASS_API = "https://overpass-api.de/api/interpreter" as const;

const API_TIMEOUT = {
    WEATHER: 10000,
    OVERPASS: 15000,
} as const;

const TEMP_ADJUSTMENT = {
    MAX: 2,
    MIN: -3,
} as const;

const MONTHS = [
    "JAN",
    "FEV",
    "MAR",
    "ABR",
    "MAI",
    "JUN",
    "JUL",
    "AGO",
    "SET",
    "OUT",
    "NOV",
    "DEZ",
] as const;

// ==================== TYPES ====================
interface WeatherData {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    pressure: number;
    precipitation: number;
    weatherCode: string;
    maxTemp: number;
    minTemp: number;
}

interface Neighborhood {
    name: string;
    temp: number;
}

interface MetInstantDetails {
    air_temperature: number;
    relative_humidity: number;
    wind_speed: number;
    air_pressure_at_sea_level: number;
}

interface MetNext1Hours {
    details?: {
        precipitation_amount?: number;
    };
    summary?: {
        symbol_code?: string;
    };
}

interface MetTimeseriesData {
    instant: {
        details: MetInstantDetails;
    };
    next_1_hours?: MetNext1Hours;
}

interface MetApiResponse {
    properties: {
        timeseries: Array<{
            data: MetTimeseriesData;
        }>;
    };
}

interface OverpassElement {
    tags?: {
        name?: string;
    };
    lat?: number;
    lon?: number;
}

interface OverpassResponse {
    elements: OverpassElement[];
}

type LoadingState = "idle" | "loading" | "success" | "error";

// ==================== UTILITIES ====================
const getCurrentDate = (): string => {
    const now = new Date();
    return `${now.getDate()} ${MONTHS[now.getMonth()]}`;
};

const roundTemp = (temp: number): number => Math.round(temp);

const formatWindSpeed = (speed: number): string => `${speed.toFixed(1)} m/s`;

const formatPressure = (pressure: number): string =>
    `${roundTemp(pressure)} hPa`;

const formatPrecipitation = (amount: number): string =>
    `${amount.toFixed(1)} mm`;

const formatFeelsLike = (temp: number): string => `${roundTemp(temp)}°C`;

// ==================== API SERVICES ====================
class WeatherService {
    static async fetchWeather(lat: number, lon: number): Promise<WeatherData> {
        try {
            const response = await axios.get<MetApiResponse>(MET_API, {
                params: { lat, lon },
                timeout: API_TIMEOUT.WEATHER,
                headers: {
                    "User-Agent": "ClimaTempo/1.0",
                },
            });

            const data = response.data.properties.timeseries[0]?.data;

            if (!data) {
                throw new Error("Dados de clima não disponíveis");
            }

            return this.parseWeatherData(data);
        } catch (error) {
            throw this.handleWeatherError(error);
        }
    }

    private static parseWeatherData(data: MetTimeseriesData): WeatherData {
        const instant = data.instant.details;
        const next1h = data.next_1_hours?.details;
        const symbol =
            data.next_1_hours?.summary?.symbol_code || "clearsky_day";

        const temp = roundTemp(instant.air_temperature);

        return {
            temp,
            feelsLike: temp,
            humidity: roundTemp(instant.relative_humidity),
            windSpeed: Number(instant.wind_speed.toFixed(1)),
            pressure: roundTemp(instant.air_pressure_at_sea_level),
            precipitation: next1h?.precipitation_amount ?? 0,
            weatherCode: symbol,
            maxTemp: temp + TEMP_ADJUSTMENT.MAX,
            minTemp: temp + TEMP_ADJUSTMENT.MIN,
        };
    }

    private static handleWeatherError(error: unknown): Error {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            if (axiosError.code === "ECONNABORTED") {
                return new Error("Timeout ao buscar dados climáticos");
            }
            if (axiosError.response?.status === 429) {
                return new Error(
                    "Muitas requisições. Tente novamente em alguns minutos"
                );
            }
        }
        return new Error("Erro ao buscar dados climáticos");
    }
}

class LocationService {
    static async fetchNeighborhoods(): Promise<Neighborhood[]> {
        try {
            const query = this.buildOverpassQuery();
            const response = await axios.get<OverpassResponse>(OVERPASS_API, {
                params: { data: query },
                timeout: API_TIMEOUT.OVERPASS,
            });

            return this.parseNeighborhoods(response.data.elements);
        } catch (error) {
            console.error("Erro ao buscar bairros:", error);
            return this.getFallbackNeighborhoods();
        }
    }

    private static buildOverpassQuery(): string {
        return `
            [out:json];
            area["name"="Manaus"]->.a;
            (
                node["place"="neighbourhood"](area.a);
                node["place"="suburb"](area.a);
            );
            out center;
        `;
    }

    private static parseNeighborhoods(
        elements: OverpassElement[]
    ): Neighborhood[] {
        const validElements = elements
            .filter(
                (el): el is Required<OverpassElement> =>
                    Boolean(el.tags?.name) &&
                    typeof el.lat === "number" &&
                    typeof el.lon === "number"
            )
            .slice(0, 3);

        return validElements.map((el) => ({
            name: el.tags!.name!,
            temp: 0, // Será preenchido com dados reais
        }));
    }

    private static getFallbackNeighborhoods(): Neighborhood[] {
        return [
            { name: "Centro", temp: 0 },
            { name: "Adrianópolis", temp: 0 },
            { name: "Aleixo", temp: 0 },
        ];
    }

    static async fetchNeighborhoodsWithWeather(): Promise<Neighborhood[]> {
        const neighborhoods = await this.fetchNeighborhoods();

        const withWeather = await Promise.all(
            neighborhoods.map(async (n, idx) => {
                try {
                    const offset = (idx - 1) * 0.02;
                    const weather = await WeatherService.fetchWeather(
                        MANAUS_CENTER.lat + offset,
                        MANAUS_CENTER.lon + offset
                    );
                    return { ...n, temp: weather.temp };
                } catch {
                    return { ...n, temp: 27 + idx };
                }
            })
        );

        return withWeather;
    }
}

// ==================== UI HELPERS ====================
const getWeatherIcon = (code: string) => {
    const iconClass = "w-12 h-12";

    if (code.includes("rain") || code.includes("drizzle")) {
        return <CloudRain className={iconClass} />;
    }

    return <Cloud className={iconClass} />;
};

// ==================== COMPONENTS ====================
interface InfoCardProps {
    title: string;
    content: React.ReactNode;
}

const InfoCard = ({ title, content }: InfoCardProps) => (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
        <div className="text-white/70 text-sm uppercase mb-4 text-center">
            {title}
        </div>
        {content}
    </div>
);

interface TempBlockProps {
    label: string;
    value: number;
}

const TempBlock = ({ label, value }: TempBlockProps) => (
    <div className="text-center">
        <div className="text-white/60 text-xs uppercase mb-1">{label}</div>
        <div className="text-white text-2xl font-semibold">{value}°</div>
    </div>
);

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
    <div className="mb-6">
        <h2 className="text-white text-lg uppercase mb-4 font-medium">
            {title}
        </h2>
        {children}
    </div>
);

interface RegionCardProps {
    name: string;
    temp: number;
}

const RegionCard = ({ name, temp }: RegionCardProps) => (
    <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl p-4 border border-green-400/20 hover:border-green-400/40 transition-all">
        <div className="flex items-center justify-between">
            <div>
                <div className="text-white/90 text-xs uppercase mb-1 font-medium">
                    {name}
                </div>
                <div className="flex items-center gap-2 text-white/70 text-xs">
                    <Wind className="w-3 h-3" />
                    <span>Temperatura</span>
                </div>
            </div>
            <div className="text-white text-3xl font-bold">{temp}°</div>
        </div>
    </div>
);

interface MetricProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

const Metric = ({ icon, label, value }: MetricProps) => (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
        <div className="flex items-center gap-3">
            <div className="w-6 h-6 text-cyan-300">{icon}</div>
            <div>
                <div className="text-white/60 text-xs uppercase">{label}</div>
                <div className="text-white text-lg font-semibold">{value}</div>
            </div>
        </div>
    </div>
);

const LoadingScreen = () => (
    <div className="min-w-395 min-h-[700px] bg-gradient-to-br from-gray-100 via-gray-300 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-900 text-2xl animate-pulse">
            Carregando dados climáticos...
        </div>
    </div>
);

interface ErrorScreenProps {
    message: string;
}

const ErrorScreen = ({ message }: ErrorScreenProps) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl bg-red-500/20 backdrop-blur-sm px-8 py-4 rounded-xl border border-red-400/30">
            {message}
        </div>
    </div>
);

// ==================== MAIN COMPONENT ====================
const ClimaTempo = () => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingState("loading");

                const [weather, neighs] = await Promise.all([
                    WeatherService.fetchWeather(
                        MANAUS_CENTER.lat,
                        MANAUS_CENTER.lon
                    ),
                    LocationService.fetchNeighborhoodsWithWeather(),
                ]);

                setWeatherData(weather);
                setNeighborhoods(neighs);
                setLoadingState("success");
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar os dados climáticos";

                setError(errorMessage);
                setLoadingState("error");
            }
        };

        loadData();
    }, []);

    if (loadingState === "loading") {
        return <LoadingScreen />;
    }

    if (loadingState === "error" || error) {
        return <ErrorScreen message={error || "Erro desconhecido"} />;
    }

    if (!weatherData) {
        return null;
    }

    return (
        <div className="min-w-395 bg-blue-500/60 backdrop-blur-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 transition-opacity backdrop-blur-xl p-8 flex items-center justify-center">
            <div className="min-w-[600px] w-full">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                    {/* Cabeçalho */}
                    <header className="text-center mb-8">
                        <h1 className="text-white text-5xl font-bold mb-2 tracking-tight">
                            CLIMA TEMPO
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                            <Calendar className="w-4 h-4" />
                            <time className="uppercase">
                                {getCurrentDate()}
                            </time>
                        </div>
                    </header>

                    {/* Seção principal */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <InfoCard
                            title="Hoje"
                            content={
                                <div className="flex items-center justify-center gap-4">
                                    <TempBlock
                                        label="Mín"
                                        value={weatherData.minTemp}
                                    />
                                    <div className="text-white/30">|</div>
                                    <TempBlock
                                        label="Máx"
                                        value={weatherData.maxTemp}
                                    />
                                </div>
                            }
                        />

                        <div className="bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-2xl p-6 border border-white/20 text-center">
                            <div className="text-white/90 text-sm uppercase mb-2">
                                Agora
                            </div>
                            {getWeatherIcon(weatherData.weatherCode)}
                            <div className="text-white text-7xl font-bold">
                                {weatherData.temp}°
                            </div>
                            <div className="text-white/70 text-sm uppercase">
                                Manaus
                            </div>
                        </div>

                        <InfoCard
                            title="Índices"
                            content={
                                <div className="flex items-center justify-center gap-3">
                                    <Droplets className="w-8 h-8 text-blue-300" />
                                    <div>
                                        <div className="text-white text-3xl font-semibold">
                                            {weatherData.humidity}%
                                        </div>
                                        <div className="text-white/60 text-xs uppercase">
                                            Umidade
                                        </div>
                                    </div>
                                </div>
                            }
                        />
                    </div>

                    {/* Bairros */}
                    {neighborhoods.length > 0 && (
                        <Section title="Temperatura por Região">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {neighborhoods.map((n) => (
                                    <RegionCard
                                        key={n.name}
                                        name={n.name}
                                        temp={n.temp}
                                    />
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Métricas adicionais */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Metric
                            icon={<Wind />}
                            label="Vento"
                            value={formatWindSpeed(weatherData.windSpeed)}
                        />
                        <Metric
                            icon={<Gauge />}
                            label="Pressão"
                            value={formatPressure(weatherData.pressure)}
                        />
                        <Metric
                            icon={<CloudRain />}
                            label="Chuva"
                            value={formatPrecipitation(
                                weatherData.precipitation
                            )}
                        />
                        <Metric
                            icon={<Cloud />}
                            label="Sensação"
                            value={formatFeelsLike(weatherData.feelsLike)}
                        />
                    </div>
                </div>

                <footer className="text-center mt-6 text-white/50 text-sm">
                    Dados fornecidos por MET Norway API
                </footer>
            </div>
        </div>
    );
};

export default ClimaTempo;
