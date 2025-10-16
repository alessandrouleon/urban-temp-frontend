import axios from "axios";

export const getTemperature = async (
    lat: number,
    lon: number
): Promise<number | string> => {
    try {
        const res = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`
        );
        return res.data.current_weather.temperature;
    } catch {
        return "N/A";
    }
};
