import axios from "axios";
import type { WeatherData } from "../interfaces/map-interface";

export const getTemperature = async (
    lat: number,
    lon: number
): Promise<WeatherData | null> => {
    try {
        const res = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m,apparent_temperature,weathercode,windspeed_10m&temperature_unit=celsius`
        );

        const current = res.data.current_weather;
        const hourly = res.data.hourly;

        return {
            temp: `${current.temperature}°C`,
            feelsLike: `${hourly.apparent_temperature[0]}°C`,
            weathercode: `${current.weathercode}`,
            humidity: `${hourly.relative_humidity_2m[0]}%`,
            windspeed: `${current.windspeed} km/h`,
        };
    } catch (err) {
        console.error(err);
        return null;
    }
};
