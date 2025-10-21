import React, { useEffect, useState } from "react";
import {
    Area,
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { getNeighborhoodsFromCity } from "../../services/overpassService";
import { getTemperatureBatch } from "../../services/weatherService";
import { CustomTooltip } from "../ApexChart/CustomTooltip";

interface ChartData {
    name: string;
    temperature: number;
    humidity: number;
    heatIndex: number;
    tempVariation: number;
}

const WeatherComposedChart: React.FC = () => {
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentHottestIndex, setCurrentHottestIndex] = useState(0);
    const [loadingProgress, setLoadingProgress] = useState({
        current: 0,
        total: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const neighborhoods = await getNeighborhoodsFromCity();
                const limitedNeighborhoods = neighborhoods.slice(0, 63);

                setLoadingProgress({
                    current: 0,
                    total: limitedNeighborhoods.length,
                });

                // Usa a função de lote com controle de concorrência e progresso
                const weatherResults = await getTemperatureBatch(
                    limitedNeighborhoods,
                    5,
                    (current, total) => setLoadingProgress({ current, total })
                );

                // Processa os resultados
                const validResults = weatherResults
                    .filter((result) => result.data !== null)
                    .map((result) => {
                        const weather = result.data!;
                        const temp = parseFloat(weather.temp.replace("°C", ""));
                        const hum = parseFloat(
                            (weather.humidity ?? "%").replace("%", "")
                        );

                        const heatIndex =
                            temp + 0.5555 * (hum / 100 - 0.1) * (temp - 14.5);
                        const avgTemp = 27;
                        const tempVariation = Math.abs(temp - avgTemp);

                        return {
                            name: result.name,
                            temperature: temp,
                            humidity: hum,
                            heatIndex: parseFloat(heatIndex.toFixed(1)),
                            tempVariation: parseFloat(tempVariation.toFixed(1)),
                        };
                    })
                    .sort((a, b) => a.temperature - b.temperature);

                if (validResults.length === 0) {
                    setError("Nenhum dado disponível. Tente novamente.");
                    return;
                }

                setChartData(validResults);
            } catch (err) {
                console.error("Erro ao buscar dados:", err);
                setError("Erro ao carregar dados. Verifique sua conexão.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Rotação automática dos bairros mais quentes
    useEffect(() => {
        if (chartData.length === 0) return;

        const maxTemp = Math.max(...chartData.map((d) => d.temperature));
        const hottestNeighborhoods = chartData.filter(
            (d) => d.temperature === maxTemp
        );

        if (hottestNeighborhoods.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentHottestIndex(
                (prev) => (prev + 1) % hottestNeighborhoods.length
            );
        }, 10000);

        return () => clearInterval(interval);
    }, [chartData]);

    const maxTemp =
        chartData.length > 0
            ? Math.max(...chartData.map((d) => d.temperature))
            : undefined;
    const hottestNeighborhoods =
        maxTemp !== undefined
            ? chartData.filter((d) => d.temperature === maxTemp)
            : [];
    const currentHottest =
        hottestNeighborhoods.length > 0
            ? hottestNeighborhoods[
                  currentHottestIndex % hottestNeighborhoods.length
              ]
            : undefined;

    if (loading) {
        const percentage =
            loadingProgress.total > 0
                ? Math.round(
                      (loadingProgress.current / loadingProgress.total) * 100
                  )
                : 0;

        return (
            <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center w-full max-w-md">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>

                        <p className="text-gray-700 font-medium mb-2">
                            Carregando dados climáticos...
                        </p>

                        {loadingProgress.total > 0 && (
                            <>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                    <div
                                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>

                                <p className="text-sm text-gray-500">
                                    {loadingProgress.current} de{" "}
                                    {loadingProgress.total} bairros (
                                    {percentage}%)
                                </p>
                            </>
                        )}

                        <p className="text-xs text-gray-400 mt-4">
                            ⏱️ Processando dados de múltiplas fontes...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <p className="text-red-500 mb-2 font-semibold">
                            {error}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            Possíveis causas: limite de requisições da API ou
                            problemas de rede
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                            🔄 Tentar Novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const avgTemp =
        chartData.reduce((sum, d) => sum + d.temperature, 0) / chartData.length;
    const avgHum =
        chartData.reduce((sum, d) => sum + d.humidity, 0) / chartData.length;
    const avgHeatIndex =
        chartData.reduce((sum, d) => sum + d.heatIndex, 0) / chartData.length;

    return (
        <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Análise Completa do Clima por Bairro
            </h2>
            <p className="text-sm text-gray-500 mb-6">
                Temperatura, Umidade, Índice de Calor e Variações -{" "}
                {chartData.length} bairros em Manaus
            </p>

            <ResponsiveContainer width="100%" height={450}>
                <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
                >
                    <defs>
                        <linearGradient
                            id="colorHumidity"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="5%"
                                stopColor="#06b6d4"
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor="#06b6d4"
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                    />
                    <YAxis
                        tick={{ fill: "#6b7280" }}
                        label={{
                            value: "Valores",
                            angle: -90,
                            position: "insideLeft",
                            style: { fill: "#6b7280" },
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: "10px" }} />

                    <Area
                        type="monotone"
                        dataKey="humidity"
                        fill="url(#colorHumidity)"
                        stroke="#06b6d4"
                        strokeWidth={0}
                        fillOpacity={1}
                        name="Umidade (%)"
                    />

                    <Bar
                        dataKey="tempVariation"
                        barSize={25}
                        fill="#f59e0b"
                        name="Variação Temp (°C)"
                        radius={[4, 4, 0, 0]}
                    />

                    <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ fill: "#ef4444", r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Temperatura (°C)"
                    />

                    <Line
                        type="monotone"
                        dataKey="heatIndex"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "#8b5cf6", r: 4 }}
                        name="Índice de Calor"
                    />
                </ComposedChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs font-semibold text-gray-700">
                            Temp. Média
                        </span>
                    </div>
                    <p className="text-xl font-bold text-red-600">
                        {avgTemp.toFixed(1)}°C
                    </p>
                </div>

                <div className="bg-cyan-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                        <span className="text-xs font-semibold text-gray-700">
                            Umidade Média
                        </span>
                    </div>
                    <p className="text-xl font-bold text-cyan-600">
                        {avgHum.toFixed(1)}%
                    </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-xs font-semibold text-gray-700">
                            Índice Calor
                        </span>
                    </div>
                    <p className="text-xl font-bold text-purple-600">
                        {avgHeatIndex.toFixed(1)}°C
                    </p>
                </div>

                <div className="bg-amber-50 rounded-lg p-4 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-xs font-semibold text-gray-700">
                            Bairro + Quente
                        </span>
                        {hottestNeighborhoods.length > 1 && (
                            <span className="ml-auto text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                                {currentHottestIndex + 1}/
                                {hottestNeighborhoods.length}
                            </span>
                        )}
                    </div>
                    <p className="text-xl font-bold text-amber-600 transition-all duration-500">
                        {currentHottest?.temperature.toFixed(1)}°C
                    </p>
                    <p className="text-xs text-gray-600 mt-1 truncate transition-all duration-500">
                        {currentHottest?.name}
                    </p>
                    {hottestNeighborhoods.length > 1 && (
                        <div className="absolute bottom-2 left-4 right-4">
                            <div className="w-full bg-amber-200 rounded-full h-1 overflow-hidden">
                                <div
                                    className="h-full bg-amber-500"
                                    style={{
                                        animation:
                                            "progress 10s linear infinite",
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    📊 Como interpretar o gráfico:
                </h3>
                <ul className="text-xs text-gray-600 space-y-1">
                    <li>
                        <strong className="text-cyan-600">Área Azul:</strong>{" "}
                        Níveis de umidade relativa do ar
                    </li>
                    <li>
                        <strong className="text-red-600">
                            Linha Vermelha:
                        </strong>{" "}
                        Temperatura atual em cada bairro
                    </li>
                    <li>
                        <strong className="text-amber-600">
                            Barras Laranjas:
                        </strong>{" "}
                        Variação em relação à média de Manaus (27°C)
                    </li>
                    <li>
                        <strong className="text-purple-600">
                            Linha Roxa Tracejada:
                        </strong>{" "}
                        Índice de calor (sensação térmica)
                    </li>
                </ul>
            </div>

            <style>{`
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default WeatherComposedChart;
