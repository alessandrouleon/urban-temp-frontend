import { useEffect, useState } from "react";
import type { WeatherData } from "../../interfaces";
import { getTemperature } from "../../services/weatherService"; // ajuste o caminho conforme necessário

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

    const bairros = [
        "Centro",
        "Nova Cidade",
        "Cidade Nova",
        "Ponta Negra",
        "Adrianópolis",
        "Compensa",
        "São José",
        "Aleixo",
    ];

    async function buscarCoordenadas(bairro: string) {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${bairro}, Manaus, Brasil&format=json&limit=1`
        );
        const data = await res.json();
        if (data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
            };
        }
        return null;
    }

    useEffect(() => {
        async function carregarDados() {
            const resultados = await Promise.all(
                bairros.map(async (name) => {
                    try {
                        const coords = await buscarCoordenadas(name);
                        if (!coords) return null;

                        const clima: WeatherData | null = await getTemperature(
                            coords.lat,
                            coords.lon
                        );
                        if (!clima) return null;

                        return {
                            name,
                            temp: clima.temp.replace("°C", ""),
                            feelsLike: clima.feelsLike.replace("°C", ""),
                            condicao: clima.weathercode,
                            umidade: clima.humidity.replace("%", ""),
                            vento: clima.windspeed.replace(" km/h", ""),
                        } as BairroClima;
                    } catch (err) {
                        console.error("Erro ao buscar dados de:", name, err);
                        return null;
                    }
                })
            );

            setBairrosClima(resultados.filter(Boolean) as BairroClima[]);
            setCarregando(false);
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
        <div className="bg-gray-200 min-h-screen text-gray-200 p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">
                🌡️ Clima em Bairros de Manaus
            </h1>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {bairrosClima.map((b) => (
                    <div
                        key={b.name}
                        className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-between"
                    >
                        <div>
                            <h2 className="text-xl font-semibold mb-2">
                                {b.name}
                            </h2>
                            <p className="text-5xl font-bold">
                                {b.temp}°<span className="text-lg">C</span>
                            </p>
                            <p className="text-sm text-gray-400">
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
