import { useEffect, useRef, useState } from "react";
import { Maps } from "../../components/Map";
import { TemperatureExtremes } from "../../components/TemperatureExtreme";
import type { Neighborhood, WeatherData } from "../../interfaces/map-interface";
import { getNeighborhoodsFromCity } from "../../services/overpassService";
import { getTemperature } from "../../services/weatherService";
import markerBlue from "../../shared/assets/icons/marker-icon-blue.png";
import markerOrange from "../../shared/assets/icons/marker-icon-orange.png";
import markerRed from "../../shared/assets/icons/marker-icon-red.png";

const TEMP_UPDATE_INTERVAL = 10 * 60 * 1000; // 50 minutos
export function PageMaps() {
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
    const [temperatures, setTemperatures] = useState<
        Record<string, WeatherData | null>
    >({});

    const neighborhoodsRef = useRef<Neighborhood[]>([]);

    async function fetchTemperatures(neighborhoods: Neighborhood[]) {
        const batchSize = 5;
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

            // Atualiza incrementalmente
            setTemperatures((prev) => ({ ...prev, ...updatedData }));

            await new Promise((resolve) => setTimeout(resolve, 300));
        }
    }

    useEffect(() => {
        getNeighborhoodsFromCity()
            .then((data) => {
                const newData = Array.from(
                    new Map(data.map((item) => [item.name, item])).values()
                );
                setNeighborhoods(newData);
                neighborhoodsRef.current = newData;
                fetchTemperatures(newData);
            })
            .catch((err: Error) =>
                console.error("Erro ao buscar bairros:", err)
            );

        const interval = setInterval(() => {
            if (neighborhoodsRef.current.length > 0)
                fetchTemperatures(neighborhoodsRef.current);
        }, TEMP_UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div className="flex bg-white rounded-lg shadow-md p-6 gap-4">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Mapa de Temperaturas
                    </h1>

                    <Maps
                        width="100%"
                        height="70vh"
                        neighborhoods={neighborhoods}
                        temperatures={temperatures}
                    />
                </div>

                <TemperatureExtremes
                    width="30%"
                    height="70vh"
                    neighborhoods={neighborhoods}
                    temperatures={temperatures}
                />
            </div>

            <div className="flex items-center gap-4 text-sm mt-3">
                <div className="flex items-center gap-1">
                    <img
                        src={markerRed}
                        alt="Ícone quente"
                        className="w-5 h-6"
                    />
                    <span className="text-gray-700">Extremamente Quente</span>
                </div>
                <div className="flex items-center gap-1">
                    <img
                        src={markerOrange}
                        alt="Ícone morno"
                        className="w-5 h-6"
                    />
                    <span className="text-gray-700">Quente</span>
                </div>
                <div className="flex items-center gap-1">
                    <img
                        src={markerBlue}
                        alt="Ícone frio"
                        className="w-5 h-6"
                    />
                    <span className="text-gray-700">Frio</span>
                </div>
            </div>
        </div>
    );
}
