import { useEffect, useState } from "react";
import type { WeatherData } from "../../interfaces/map-interface";
import { getNeighborhoodsFromCity } from "../../services/overpassService"; // ajuste o caminho
import { getTemperature } from "../../services/weatherService";

interface BairroClima {
    name: string;
    temp: string;
    feelsLike: string;
    condicao: string;
    umidade: string;
    vento: string;
}

export function Log() {
    const [bairrosClima, setBairrosClima] = useState<BairroClima[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarDados() {
            try {
                // Busca os bairros da API
                const bairros = await getNeighborhoodsFromCity();

                // Limita a 8 bairros para não sobrecarregar
                const bairrosLimitados = bairros.slice(0, 63);

                const resultados = await Promise.all(
                    bairrosLimitados.map(async (bairro) => {
                        try {
                            const clima: WeatherData | null =
                                await getTemperature(bairro.lat, bairro.lon);
                            if (!clima) return null;

                            return {
                                name: bairro.name,
                                temp: (clima.temp ?? "").replace("°C", ""),
                                feelsLike: (clima.feelsLike ?? "").replace(
                                    "°C",
                                    ""
                                ),
                                condicao: clima.weathercode,
                                umidade: (clima.humidity ?? "").replace(
                                    "%",
                                    ""
                                ),
                                vento: (clima.windspeed ?? "").replace(
                                    " km/h",
                                    ""
                                ),
                            } as BairroClima;
                        } catch (err) {
                            console.error(
                                "Erro ao buscar dados de:",
                                bairro.name,
                                err
                            );
                            return null;
                        }
                    })
                );

                setBairrosClima(resultados.filter(Boolean) as BairroClima[]);
            } catch (err) {
                console.error("Erro ao carregar bairros:", err);
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, []);

    if (carregando)
        return (
            <p className="text-gray-800 text-center mt-8">
                Carregando clima...
            </p>
        );

    return (
        <div className="bg-gray-200 min-h-screen text-gray-700 p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Clima em Bairros de Manaus
            </h1>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {bairrosClima.map((b) => (
                    <div
                        key={b.name}
                        className="bg-blue-500 rounded-2xl shadow-lg p-6 flex flex-col justify-between"
                    >
                        <div>
                            <h2 className="text-xl font-semibold mb-2">
                                {b.name}
                            </h2>
                            <p className="text-5xl font-bold text-amber-50">
                                {b.temp}°<span className="text-lg">C</span>
                            </p>
                            <p className="text-sm text-white">
                                Sensação térmica: {b.feelsLike}°C
                            </p>
                        </div>

                        <div className="mt-4 border-t border-gray-700 pt-3">
                            <p>🌤 {b.condicao}</p>
                            <p>💧 Umidade: {b.umidade}%</p>
                            <p>🌬 Vento: {b.vento} km/h</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
