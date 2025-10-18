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
import axios from "axios";
import type { WeatherData } from "../interfaces/map-interface";

export const getTemperature = async (
    lat: number,
    lon: number
): Promise<WeatherData | null> => {
    try {
        const res = await axios.get(
            `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`
        );

        const data = res.data.properties.timeseries[0].data;
        const instant = data.instant.details;
        const next1h = data.next_1_hours?.details;
        const symbol = data.next_1_hours?.summary?.symbol_code;

        return {
            temp: `${instant.air_temperature}°C`,
            feelsLike: `${instant.air_temperature}°C`, // YR.no não fornece "apparent_temperature"
            humidity: `${instant.relative_humidity}%`,
            windspeed: `${instant.wind_speed} m/s`,
            pressure: `${instant.air_pressure_at_sea_level} hPa`,
            precipitation: `${next1h?.precipitation_amount ?? 0} mm`,
            weathercode: symbol ?? "unknown",
            updatedAt: res.data.properties.meta.updated_at,
        };
    } catch (err) {
        console.error("Erro ao obter dados do YR.no:", err);
        return null;
    }
};
