import axios from "axios";
import type { WeatherData } from "../interfaces/map-interface";

// Cache simples para evitar requisições duplicadas
const weatherCache = new Map<
    string,
    { data: WeatherData; timestamp: number }
>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

// Função auxiliar para criar delay entre requisições
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getTemperature = async (
    lat: number,
    lon: number,
    retries = 3
): Promise<WeatherData | null> => {
    // Arredonda coordenadas para reutilizar cache (mesma área)
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;

    // Verifica cache
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    // Tenta buscar dados com retry
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // User-Agent é OBRIGATÓRIO para a API do YR.no
            const res = await axios.get(
                `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
                {
                    timeout: 10000, // 10 segundos timeout
                }
            );

            const data = res.data.properties.timeseries[0].data;
            const instant = data.instant.details;
            const next1h = data.next_1_hours?.details;
            const symbol = data.next_1_hours?.summary?.symbol_code;

            const weatherData: WeatherData = {
                temp: `${instant.air_temperature}°C`,
                feelsLike: `${instant.air_temperature}°C`,
                humidity: `${instant.relative_humidity}%`,
                windspeed: `${instant.wind_speed} m/s`,
                pressure: `${instant.air_pressure_at_sea_level} hPa`,
                precipitation: `${next1h?.precipitation_amount ?? 0} mm`,
                weathercode: symbol ?? "unknown",
                updatedAt: res.data.properties.meta.updated_at,
            };

            // Salva no cache
            weatherCache.set(cacheKey, {
                data: weatherData,
                timestamp: Date.now(),
            });

            return weatherData;
        } catch (err) {
            console.error(
                `❌ Erro ao obter dados (tentativa ${attempt}/${retries}):`,
                err
            );

            // Se não for a última tentativa, aguarda antes de tentar novamente
            if (attempt < retries) {
                const waitTime = attempt * 2000; // Backoff exponencial: 2s, 4s, 6s
                await delay(waitTime);
            }
        }
    }
    return null;
};

// Função para buscar dados em lote com controle de concorrência
export const getTemperatureBatch = async (
    locations: Array<{ lat: number; lon: number; name: string }>,
    concurrencyLimit = 5,
    onProgress?: (current: number, total: number) => void
): Promise<Array<{ name: string; data: WeatherData | null }>> => {
    const results: Array<{ name: string; data: WeatherData | null }> = [];
    let processed = 0;

    for (let i = 0; i < locations.length; i += concurrencyLimit) {
        const batch = locations.slice(i, i + concurrencyLimit);

        // ...existing code...

        const batchPromises = batch.map(async (location) => {
            await delay(Math.random() * 500);
            const data = await getTemperature(location.lat, location.lon);
            return { name: location.name, data };
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Atualiza progresso após cada lote
        processed += batchResults.length;
        if (onProgress) onProgress(processed, locations.length);

        // ...existing code...
        if (i + concurrencyLimit < locations.length) {
            await delay(1000);
        }
    }

    return results;
};

// Função para limpar cache manualmente
export const clearWeatherCache = () => {
    weatherCache.clear();
};
