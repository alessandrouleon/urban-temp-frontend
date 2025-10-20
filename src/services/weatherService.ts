// import axios from "axios";
// import type { WeatherData } from "../interfaces/map-interface";

// export const getTemperature = async (
//     lat: number,
//     lon: number
// ): Promise<WeatherData | null> => {
//     try {
//         const res = await axios.get(
//             `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m,apparent_temperature,weathercode,windspeed_10m&temperature_unit=celsius`
//         );

//         const current = res.data.current_weather;
//         const hourly = res.data.hourly;

//         return {
//             temp: `${current.temperature}°C`,
//             feelsLike: `${hourly.apparent_temperature[0]}°C`,
//             weathercode: `${current.weathercode}`,
//             humidity: `${hourly.relative_humidity_2m[0]}%`,
//             windspeed: `${current.windspeed} km/h`,
//         };
//     } catch (err) {
//         console.error(err);
//         return null;
//     }
// };
// import axios from "axios";
// import type { WeatherData } from "../interfaces/map-interface";

// export const getTemperature = async (
//     lat: number,
//     lon: number
// ): Promise<WeatherData | null> => {
//     try {
//         const res = await axios.get(
//             `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`
//         );

//         const data = res.data.properties.timeseries[0].data;
//         const instant = data.instant.details;
//         const next1h = data.next_1_hours?.details;
//         const symbol = data.next_1_hours?.summary?.symbol_code;

//         return {
//             temp: `${instant.air_temperature}°C`,
//             feelsLike: `${instant.air_temperature}°C`, // YR.no não fornece "apparent_temperature"
//             humidity: `${instant.relative_humidity}%`,
//             windspeed: `${instant.wind_speed} m/s`,
//             pressure: `${instant.air_pressure_at_sea_level} hPa`,
//             precipitation: `${next1h?.precipitation_amount ?? 0} mm`,
//             weathercode: symbol ?? "unknown",
//             updatedAt: res.data.properties.meta.updated_at,
//         };
//     } catch (err) {
//         console.error("Erro ao obter dados do YR.no:", err);
//         return null;
//     }
// };

// src/services/weatherService.ts
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
        console.log(`✅ Cache hit para ${cacheKey}`);
        return cached.data;
    }

    // Tenta buscar dados com retry
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // User-Agent é OBRIGATÓRIO para a API do YR.no
            const res = await axios.get(
                `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
                {
                    headers: {
                        "User-Agent": "WeatherApp/1.0 (contact@example.com)", // IMPORTANTE!
                    },
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

            console.log(`✅ Dados obtidos para ${cacheKey}`);
            return weatherData;
        } catch (err) {
            console.error(
                `❌ Erro ao obter dados (tentativa ${attempt}/${retries}):`,
                err
            );

            // Se não for a última tentativa, aguarda antes de tentar novamente
            if (attempt < retries) {
                const waitTime = attempt * 2000; // Backoff exponencial: 2s, 4s, 6s
                console.log(
                    `⏳ Aguardando ${waitTime}ms antes de tentar novamente...`
                );
                await delay(waitTime);
            }
        }
    }

    console.error(`❌ Falha após ${retries} tentativas`);
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
    console.log("🧹 Cache limpo");
};
