// import React, { useEffect, useState } from "react";
// import {
//     Area,
//     AreaChart,
//     CartesianGrid,
//     Legend,
//     ResponsiveContainer,
//     Tooltip,
//     XAxis,
//     YAxis,
// } from "recharts";
// import { getNeighborhoodsFromCity } from "../../services/overpassService";
// import { getTemperature } from "../../services/weatherService";
// import { CustomTooltip } from "./CustomTooltip";

// interface ChartData {
//     name: string;
//     temperature: number;
//     humidity: number;
// }

// const WeatherAreaChart: React.FC = () => {
//     const [chartData, setChartData] = useState<ChartData[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 // Busca os bairros de Manaus
//                 const neighborhoods = await getNeighborhoodsFromCity();

//                 // Limita a 10 bairros para não sobrecarregar o gráfico
//                 const limitedNeighborhoods = neighborhoods.slice(0, 63);

//                 // Busca dados meteorológicos para cada bairro
//                 const weatherPromises = limitedNeighborhoods.map(
//                     async (neighborhood) => {
//                         try {
//                             const weather = await getTemperature(
//                                 neighborhood.lat,
//                                 neighborhood.lon
//                             );

//                             if (!weather) {
//                                 return null;
//                             }

//                             return {
//                                 name: neighborhood.name,
//                                 temperature: parseFloat(
//                                     weather.temp.replace("°C", "")
//                                 ),
//                                 humidity: parseFloat(
//                                     (weather.humidity ?? "%").replace("%", "")
//                                 ),
//                             };
//                         } catch (err) {
//                             console.error(
//                                 `Erro ao buscar dados para ${neighborhood.name}:`,
//                                 err
//                             );
//                             return null;
//                         }
//                     }
//                 );

//                 const results = await Promise.all(weatherPromises);

//                 // Filtra resultados nulos e ordena por temperatura
//                 const validResults = results
//                     .filter((result): result is ChartData => result !== null)
//                     .sort((a, b) => a.temperature - b.temperature);

//                 if (validResults.length === 0) {
//                     setError("Nenhum dado disponível");
//                     return;
//                 }

//                 setChartData(validResults);
//             } catch (err) {
//                 console.error("Erro ao buscar dados:", err);
//                 setError("Erro ao carregar dados meteorológicos");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, []);

//     if (loading) {
//         return (
//             <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
//                 <div className="flex items-center justify-center h-96">
//                     <div className="text-center">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//                         <p className="text-gray-500">
//                             Carregando dados dos bairros...
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
//                 <div className="flex items-center justify-center h-96">
//                     <div className="text-center">
//                         <p className="text-red-500 mb-2">{error}</p>
//                         <button
//                             onClick={() => window.location.reload()}
//                             className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                         >
//                             Tentar Novamente
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     const avgTemp =
//         chartData.reduce((sum, d) => sum + d.temperature, 0) / chartData.length;
//     const avgHum =
//         chartData.reduce((sum, d) => sum + d.humidity, 0) / chartData.length;

//     return (
//         <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
//             <h2 className="text-2xl font-bold mb-2 text-gray-800">
//                 Temperatura x Umidade
//             </h2>
//             <p className="text-sm text-gray-500 mb-6">
//                 Dados atuais por bairro em Manaus - {chartData.length} bairros
//             </p>

//             <ResponsiveContainer width="100%" height={400}>
//                 <AreaChart
//                     data={chartData}
//                     margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
//                 >
//                     <defs>
//                         <linearGradient
//                             id="colorTemp"
//                             x1="0"
//                             y1="0"
//                             x2="0"
//                             y2="1"
//                         >
//                             <stop
//                                 offset="5%"
//                                 stopColor="#3B82F6"
//                                 stopOpacity={0.8}
//                             />
//                             <stop
//                                 offset="95%"
//                                 stopColor="#3B82F6"
//                                 stopOpacity={0.1}
//                             />
//                         </linearGradient>
//                         <linearGradient
//                             id="colorHum"
//                             x1="0"
//                             y1="0"
//                             x2="0"
//                             y2="1"
//                         >
//                             <stop
//                                 offset="5%"
//                                 stopColor="#10B981"
//                                 stopOpacity={0.8}
//                             />
//                             <stop
//                                 offset="95%"
//                                 stopColor="#10B981"
//                                 stopOpacity={0.1}
//                             />
//                         </linearGradient>
//                     </defs>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                     <XAxis
//                         dataKey="name"
//                         tick={{ fill: "#6b7280", fontSize: 12 }}
//                         angle={-45}
//                         textAnchor="end"
//                         height={80}
//                     />
//                     <YAxis tick={{ fill: "#6b7280" }} />

//                     <Tooltip content={<CustomTooltip />} />

//                     <Legend
//                         wrapperStyle={{ paddingTop: "20px" }}
//                         iconType="circle"
//                     />

//                     <Area
//                         type="monotone"
//                         dataKey="temperature"
//                         stroke="#3B82F6"
//                         strokeWidth={2}
//                         fillOpacity={1}
//                         fill="url(#colorTemp)"
//                         name="Temperatura (°C)"
//                     />
//                     <Area
//                         type="monotone"
//                         dataKey="humidity"
//                         stroke="#10B981"
//                         strokeWidth={2}
//                         fillOpacity={1}
//                         fill="url(#colorHum)"
//                         name="Umidade (%)"
//                     />
//                 </AreaChart>
//             </ResponsiveContainer>

//             <div className="mt-6 grid grid-cols-2 gap-4">
//                 <div className="bg-blue-50 rounded-lg p-4">
//                     <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 rounded-full bg-blue-500"></div>
//                         <span className="text-sm font-semibold text-gray-700">
//                             Temperatura Média
//                         </span>
//                     </div>
//                     <p className="text-2xl font-bold text-blue-600 mt-2">
//                         {avgTemp.toFixed(1)}°C
//                     </p>
//                 </div>
//                 <div className="bg-green-50 rounded-lg p-4">
//                     <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 rounded-full bg-green-500"></div>
//                         <span className="text-sm font-semibold text-gray-700">
//                             Umidade Média
//                         </span>
//                     </div>
//                     <p className="text-2xl font-bold text-green-600 mt-2">
//                         {avgHum.toFixed(1)}%
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default WeatherAreaChart;
