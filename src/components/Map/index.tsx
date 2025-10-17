import { Icon, type LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";

import type {
    MapsProps,
    Neighborhood,
    WeatherData,
} from "../../interfaces/map-interface";
import { getNeighborhoodsFromManaus } from "../../services/overpassService";
import { getTemperature } from "../../services/weatherService";

const coldIcon = new Icon({
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const warmIcon = new Icon({
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const hotIcon = new Icon({
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const center: LatLngTuple = [-3.1019, -60.025];

export const Maps: React.FC<MapsProps> = ({
    width = "100%",
    height = "400px",
}) => {
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
    const [temperaturas, setTemperaturas] = useState<
        Record<string, WeatherData | null>
    >({});

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await getNeighborhoodsFromManaus();
                setNeighborhoods(data);
            } catch (err) {
                console.error("Erro ao buscar bairros:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (neighborhoods.length === 0) return;

        const fetchTemps = async () => {
            const promises = neighborhoods.map((n) =>
                getTemperature(n.lat, n.lon)
                    .then((data) => ({ name: n.name, data }))
                    .catch(() => ({ name: n.name, data: null }))
            );

            const results = await Promise.allSettled(promises);

            const tempData: Record<string, WeatherData | null> = {};
            results.forEach((r) => {
                if (r.status === "fulfilled")
                    tempData[r.value.name] = r.value.data;
            });

            setTemperaturas(tempData);
        };

        fetchTemps();
        const interval = setInterval(fetchTemps, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [neighborhoods]);

    if (loading) return <p>Carregando bairros de Manaus...</p>;

    return (
        <MapContainer center={center} zoom={12} style={{ width, height }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {neighborhoods.map((n) => {
                const clima = temperaturas[n.name];

                const tempNumber =
                    clima?.temp !== undefined
                        ? parseFloat(String(clima.temp).replace(",", "."))
                        : undefined;

                if (tempNumber === undefined) return null;

                let iconToUse = coldIcon; // padrão frio
                if (tempNumber !== undefined) {
                    if (tempNumber <= 27) {
                        iconToUse = coldIcon;
                    } else if (tempNumber <= 30) {
                        iconToUse = warmIcon;
                    } else {
                        iconToUse = hotIcon;
                    }
                }
                return (
                    <Marker
                        key={`${n.name}-${n.lat}-${n.lon}`}
                        position={[n.lat, n.lon]}
                        icon={iconToUse}
                    >
                        <Tooltip
                            direction="top"
                            offset={[0, -30]}
                            opacity={0.9}
                        >
                            {clima ? (
                                <div
                                    style={{
                                        fontSize: "0.9rem",
                                        textAlign: "center",
                                    }}
                                >
                                    <strong>{n.name}</strong> <br />
                                    🌡 Temparatura: {clima.temp} <br />
                                    🥵 Sensação: {clima.feelsLike} <br />
                                    ☁️ Condição: {clima.weathercode} <br />
                                    💧 Umidade: {clima.humidity} <br />
                                    💨 Vento: {clima.windspeed}
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
                                            {clima?.temp ?? "N/A"}
                                        </div>
                                    </div>

                                    <div className="text-right text-sm space-y-1">
                                        <div className="text-gray-600">
                                            Umidade: {clima?.humidity ?? "N/A"}
                                        </div>
                                        <div className="text-gray-600">
                                            Vento: {clima?.windspeed ?? "N/A"}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-300 flex justify-between text-sm">
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">
                                            Clima
                                        </div>
                                        <div className="text-gray-700">
                                            {clima?.weathercode ?? "0"}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-gray-500 text-xs mb-1">
                                            Sensação
                                        </div>
                                        <div className="text-gray-700">
                                            {clima?.feelsLike ?? "N/A"}
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
