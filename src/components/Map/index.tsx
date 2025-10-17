import { type LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";

import type {
    MapsProps,
    Neighborhood,
    WeatherData,
} from "../../interfaces/map-interface";
import { getNeighborhoodsFromCity } from "../../services/overpassService";
import { getTemperature } from "../../services/weatherService";
import { getIconByTemperature } from "../../shared/utils/map-icons";
import { Loading } from "../Loading";

const MANAUS_CENTER: LatLngTuple = [-3.036478, -59.994703];
const TEMP_UPDATE_INTERVAL = 50 * 60 * 1000; // 50 minutos

const parseTemp = (temp: string | undefined): number | undefined => {
    if (temp === undefined) return undefined;
    return parseFloat(String(temp).replace(",", "."));
};

export const Maps: React.FC<MapsProps> = ({
    width = "100%",
    height = "100%",
}) => {
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
    const [temperatures, setTemperatures] = useState<
        Record<string, WeatherData | null>
    >({});
    const [loading, setLoading] = useState(true);
    async function fetchTemperatures(
        neighborhoods: Neighborhood[],
        setTemperatures: React.Dispatch<
            React.SetStateAction<Record<string, WeatherData | null>>
        >
    ) {
        const batchSize = 5; // número de requisições simultâneas
        const updatedData: Record<string, WeatherData | null> = {};

        for (let i = 0; i < neighborhoods.length; i += batchSize) {
            const batch = neighborhoods.slice(i, i + batchSize);

            const results = await Promise.allSettled(
                batch.map((n) =>
                    getTemperature(n.lat, n.lon)
                        .then((data) => ({ name: n.name, data }))
                        .catch(() => ({ name: n.name, data: null }))
                )
            );

            results.forEach((r) => {
                if (r.status === "fulfilled") {
                    updatedData[r.value.name] = r.value.data;
                }
            });

            // Atualiza o estado incrementalmente
            setTemperatures((prev) => ({ ...prev, ...updatedData }));

            // pequeno delay entre os blocos pra aliviar o servidor
            await new Promise((resolve) => setTimeout(resolve, 300));
        }
    }

    useEffect(() => {
        if (neighborhoods.length === 0) return;

        fetchTemperatures(neighborhoods, setTemperatures);

        const interval = setInterval(
            () => fetchTemperatures(neighborhoods, setTemperatures),
            TEMP_UPDATE_INTERVAL
        );

        return () => clearInterval(interval);
    }, [neighborhoods]);

    useEffect(() => {
        getNeighborhoodsFromCity()
            .then(setNeighborhoods)
            .catch((err: Error) =>
                console.error("Erro ao buscar bairros:", err)
            )
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Loading message="Carregando bairros de Manaus..." />;

    return (
        <MapContainer
            center={MANAUS_CENTER}
            zoom={12}
            style={{ width, height }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {neighborhoods.map((n) => {
                const weather = temperatures[n.name];
                const temp = parseTemp(weather?.temp);

                if (!temp) return null;

                return (
                    <Marker
                        key={`${n.name}-${n.lat}-${n.lon}`}
                        position={[n.lat, n.lon]}
                        icon={getIconByTemperature(temp)}
                    >
                        <Tooltip
                            direction="top"
                            offset={[0, -30]}
                            opacity={0.9}
                        >
                            {weather ? (
                                <div
                                    style={{
                                        fontSize: "0.9rem",
                                        textAlign: "center",
                                    }}
                                >
                                    <strong>{n.name}</strong> <br />
                                    🌡 Temparatura: {weather.temp} <br />
                                    🥵 Sensação: {weather.feelsLike} <br />
                                    ☁️ Condição: {weather.weathercode} <br />
                                    💧 Umidade: {weather.humidity} <br />
                                    💨 Vento: {weather.windspeed}
                                </div>
                            ) : (
                                <div>Carregando...</div>
                            )}
                        </Tooltip>
                        <Popup className="custom-popup">
                            <div className="bg-white text-gray-700 p-2 mt-2 rounded-lg min-w-[300px]">
                                <div className="text-shadow-2xs text-gray-500 mb-3">
                                    Resultados para <strong>{n.name}</strong>
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-start">
                                        <div className="text-5xl font-light">
                                            {weather?.temp ?? "N/A"}
                                        </div>
                                    </div>

                                    <div className="text-right text-sm space-y-1">
                                        <div className="text-gray-600">
                                            Umidade:{" "}
                                            {weather?.humidity ?? "N/A"}
                                        </div>
                                        <div className="text-gray-600">
                                            Vento: {weather?.windspeed ?? "N/A"}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-300 flex justify-between text-sm">
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">
                                            Clima
                                        </div>
                                        <div className="text-gray-700">
                                            {weather?.weathercode ?? "0"}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-gray-500 text-xs mb-1">
                                            Sensação
                                        </div>
                                        <div className="text-gray-700">
                                            {weather?.feelsLike ?? "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};
