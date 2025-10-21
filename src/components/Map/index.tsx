import { type LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";

import type { MapsProps } from "../../interfaces/map-interface";
import { getIconByTemperature } from "../../shared/utils/map-icons";
import { HeatmapLayer } from "../HeatmapLayer";
import { Loading } from "../Loading";

const MANAUS_CENTER: LatLngTuple = [-3.036478, -59.994703];

const parseTemp = (temp: string | undefined): number | undefined => {
    if (temp === undefined) return undefined;
    return parseFloat(String(temp).replace(",", "."));
};
const normalizeTemp = (
    temp: number,
    min: number = 22,
    max: number = 36
): number => {
    return Math.max(0, Math.min(1, (temp - min) / (max - min)));
};

export const Maps: React.FC<MapsProps> = ({
    width = "100%",
    height = "100%",
    neighborhoods,
    temperatures,
    showHeatmap = true,
    showMarkers = true,
}) => {
    const [currentView, setCurrentView] = useState<
        "both" | "heatmap" | "markers"
    >(
        showHeatmap && showMarkers
            ? "both"
            : showHeatmap
            ? "heatmap"
            : "markers"
    );

    // Prepara os pontos do heatmap
    const heatmapPoints = useMemo(() => {
        const points: [number, number, number][] = [];

        neighborhoods.forEach((n) => {
            const weather = temperatures[n.name];
            const temp = parseTemp(weather?.temp);
            if (temp) {
                // [latitude, longitude, intensidade normalizada]
                points.push([n.lat, n.lon, normalizeTemp(temp)]);
            }
        });

        return points;
    }, [neighborhoods, temperatures]);

    // Encontra temperaturas min/max para referência
    const tempStats = useMemo(() => {
        const temps = neighborhoods
            .map((n) => parseTemp(temperatures[n.name]?.temp))
            .filter((t): t is number => t !== undefined);

        if (temps.length === 0) return { min: 0, max: 0, avg: 0 };

        return {
            min: Math.min(...temps),
            max: Math.max(...temps),
            avg: temps.reduce((a, b) => a + b, 0) / temps.length,
        };
    }, [neighborhoods, temperatures]);

    if (!neighborhoods.length)
        return <Loading message="Carregando bairros..." />;

    return (
        <div style={{ position: "relative", width, height }}>
            {/* Controles de visualização */}
            <div
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    zIndex: 1000,
                    background: "white",
                    padding: "10px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
            >
                <div
                    style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        marginBottom: "8px",
                    }}
                >
                    Visualização
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                    }}
                >
                    <label style={{ fontSize: "12px", cursor: "pointer" }}>
                        <input
                            type="radio"
                            checked={currentView === "both"}
                            onChange={() => setCurrentView("both")}
                            style={{ marginRight: "6px" }}
                        />
                        Ambos
                    </label>
                    <label style={{ fontSize: "12px", cursor: "pointer" }}>
                        <input
                            type="radio"
                            checked={currentView === "heatmap"}
                            onChange={() => setCurrentView("heatmap")}
                            style={{ marginRight: "6px" }}
                        />
                        Só Heatmap
                    </label>
                    <label style={{ fontSize: "12px", cursor: "pointer" }}>
                        <input
                            type="radio"
                            checked={currentView === "markers"}
                            onChange={() => setCurrentView("markers")}
                            style={{ marginRight: "6px" }}
                        />
                        Só Marcadores
                    </label>
                </div>

                {/* Legenda de temperatura */}
                <div
                    style={{
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: "1px solid #ddd",
                    }}
                >
                    <div
                        style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            marginBottom: "4px",
                        }}
                    >
                        Temperaturas
                    </div>
                    <div style={{ fontSize: "11px", color: "#666" }}>
                        Min: {tempStats.min.toFixed(1)}°C
                    </div>
                    <div style={{ fontSize: "11px", color: "#666" }}>
                        Máx: {tempStats.max.toFixed(1)}°C
                    </div>
                    <div style={{ fontSize: "11px", color: "#666" }}>
                        Média: {tempStats.avg.toFixed(1)}°C
                    </div>
                </div>

                {/* Gradiente de cores */}
                <div
                    style={{
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: "1px solid #ddd",
                    }}
                >
                    <div
                        style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            marginBottom: "6px",
                        }}
                    >
                        Escala de Cores
                    </div>
                    <div
                        style={{
                            height: "20px",
                            background:
                                "linear-gradient(to right, #3B82F6, #22C55E, #FBBF24, #F97316, #DC2626)",
                            borderRadius: "4px",
                        }}
                    />
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "10px",
                            marginTop: "2px",
                        }}
                    >
                        <span>Frio</span>
                        <span>Quente</span>
                    </div>
                </div>
            </div>

            <MapContainer
                center={MANAUS_CENTER}
                zoom={12}
                style={{ width: "100%", height: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                {/* Camada de Heatmap */}
                {(currentView === "both" || currentView === "heatmap") && (
                    <HeatmapLayer
                        points={heatmapPoints}
                        options={{
                            radius: 60,
                            blur: 45,
                            maxZoom: 18,
                            max: 1.0,
                            minOpacity: 0.5,
                        }}
                    />
                )}

                {/* Marcadores */}
                {(currentView === "both" || currentView === "markers") &&
                    neighborhoods.map((n) => {
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
                                            🌡 Temperatura: {weather.temp} <br />
                                            🥵 Sensação: {weather.feelsLike}
                                            <br />
                                            💧 Umidade: {weather.humidity}
                                            <br />
                                            💨 Vento: {weather.windspeed}
                                        </div>
                                    ) : (
                                        <div>Carregando...</div>
                                    )}
                                </Tooltip>
                                <Popup className="custom-popup">
                                    <div className="bg-white text-gray-700 p-2 mt-2 rounded-lg min-w-[300px]">
                                        <div className="text-shadow-2xs text-gray-500 mb-3">
                                            <strong>{n.name}</strong>
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-5xl font-light">
                                                {weather?.temp ?? "N/A"}
                                            </div>

                                            <div className="text-right text-sm space-y-1">
                                                <div className="text-gray-600">
                                                    💧{" "}
                                                    {weather?.humidity ?? "N/A"}
                                                </div>
                                                <div className="text-gray-600">
                                                    💨{" "}
                                                    {weather?.windspeed ??
                                                        "N/A"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-gray-300 flex justify-between text-sm">
                                            <div>
                                                <div className="text-gray-500 text-xs mb-1">
                                                    Clima
                                                </div>
                                                <div className="text-gray-700">
                                                    {weather?.weathercode ??
                                                        "N/A"}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-gray-500 text-xs mb-1">
                                                    Sensação
                                                </div>
                                                <div className="text-gray-700">
                                                    {weather?.feelsLike ??
                                                        "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
            </MapContainer>
        </div>
    );
};
