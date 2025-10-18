import React, { useEffect, useMemo, useState } from "react";
import type {
    MapsProps,
    Neighborhood,
    WeatherData,
} from "../../interfaces/map-interface";

const parseTemp = (temp: string | undefined): number | undefined => {
    if (!temp) return undefined;
    const match = temp.match(/-?\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : undefined;
};

// export const TemperatureExtremes: React.FC<MapsProps> = ({
//     width = "100%",
//     height = "100%",
//     neighborhoods,
//     temperatures,
// }) => {
//     const { hottest, coldest } = useMemo<{
//         hottest: NeighborhoodWeather | null;
//         coldest: NeighborhoodWeather | null;
//     }>(() => {
//         let maxTemp = -Infinity;
//         let minTemp = Infinity;

//         let hottest: NeighborhoodWeather | null = null;
//         let coldest: NeighborhoodWeather | null = null;

//         neighborhoods.forEach((neighborhood) => {
//             const weather = temperatures[neighborhood.name];
//             if (!weather) return;

//             const temp = parseTemp(weather.temp);
//             if (temp === undefined || isNaN(temp)) return;

//             if (temp > maxTemp) {
//                 maxTemp = temp;
//                 hottest = { neighborhood, weather };
//             }

//             if (temp < minTemp) {
//                 minTemp = temp;
//                 coldest = { neighborhood, weather };
//             }
//         });

//         return { hottest, coldest };
//     }, [neighborhoods, temperatures]);

//     if (!hottest && !coldest) {
//         return (
//             <div className="flex gap-4 p-4">
//                 <div className="flex-1 bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
//                     Carregando dados de temperatura...
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex flex-col gap-4 p-4" style={{ width, height }}>
//             {/* Card Temperatura Mais Alta */}
//             <h1 className="text-2xl font-bold text-gray-800">
//                 Temp. Mais Alta e Mais Baixa
//             </h1>
//             {hottest && (
//                 <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-md p-6 border border-orange-200 hover:shadow-lg transition-shadow">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="text-lg font-semibold text-gray-700">
//                             🔥 Mais Quente
//                         </h3>
//                         <span className="text-4xl">☀️</span>
//                     </div>

//                     <div className="mb-4">
//                         <div className="text-gray-600 text-sm mb-1">Bairro</div>
//                         <div className="text-2xl font-bold text-gray-800">
//                             {hottest.neighborhood.name}
//                         </div>
//                     </div>

//                     <div className="flex items-end gap-2 mb-4">
//                         <div className="text-5xl font-light text-orange-600">
//                             {hottest.weather.temp}
//                         </div>
//                     </div>

//                     <div className="space-y-2 text-sm">
//                         <div className="flex justify-between text-gray-600">
//                             <span>Sensação:</span>
//                             <span className="font-medium text-gray-800">
//                                 {hottest.weather.feelsLike}
//                             </span>
//                         </div>
//                         <div className="flex justify-between text-gray-600">
//                             <span>Umidade:</span>
//                             <span className="font-medium text-gray-800">
//                                 {hottest.weather.humidity}
//                             </span>
//                         </div>
//                         <div className="flex justify-between text-gray-600">
//                             <span>Vento:</span>
//                             <span className="font-medium text-gray-800">
//                                 {hottest.weather.windspeed}
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Card Temperatura Mais Baixa */}
//             {coldest && (
//                 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-md p-6 border border-blue-200 hover:shadow-lg transition-shadow">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="text-lg font-semibold text-gray-700">
//                             ❄️ Mais Fresco
//                         </h3>
//                         <span className="text-4xl">🌤️</span>
//                     </div>

//                     <div className="mb-4">
//                         <div className="text-gray-600 text-sm mb-1">Bairro</div>
//                         <div className="text-2xl font-bold text-gray-800">
//                             {coldest.neighborhood.name}
//                         </div>
//                     </div>

//                     <div className="flex items-end gap-2 mb-4">
//                         <div className="text-5xl font-light text-blue-600">
//                             {coldest.weather.temp}
//                         </div>
//                     </div>

//                     <div className="space-y-2 text-sm">
//                         <div className="flex justify-between text-gray-600">
//                             <span>Sensação:</span>
//                             <span className="font-medium text-gray-800">
//                                 {coldest.weather.feelsLike}
//                             </span>
//                         </div>
//                         <div className="flex justify-between text-gray-600">
//                             <span>Umidade:</span>
//                             <span className="font-medium text-gray-800">
//                                 {coldest.weather.humidity}
//                             </span>
//                         </div>
//                         <div className="flex justify-between text-gray-600">
//                             <span>Vento:</span>
//                             <span className="font-medium text-gray-800">
//                                 {coldest.weather.windspeed}
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

const ROTATE_INTERVAL = 7000; // 5 segundos

export const TemperatureExtremes: React.FC<MapsProps> = ({
    width = "100%",
    height = "100%",
    neighborhoods,
    temperatures,
}) => {
    // Estados para controle de índice atual de rotação
    const [hotIndex, setHotIndex] = useState(0);
    const [coldIndex, setColdIndex] = useState(0);

    // Calcula os bairros mais quentes e mais frios
    const { hottestArray, coldestArray } = useMemo(() => {
        let maxTemp = -Infinity;
        let minTemp = Infinity;

        const temps: {
            neighborhood: Neighborhood;
            weather: WeatherData;
            temp: number;
        }[] = [];

        neighborhoods.forEach((neighborhood) => {
            const weather = temperatures[neighborhood.name];
            if (!weather) return;

            const temp = parseTemp(weather.temp);
            if (temp === undefined || isNaN(temp)) return;

            temps.push({ neighborhood, weather, temp });

            if (temp > maxTemp) maxTemp = temp;
            if (temp < minTemp) minTemp = temp;
        });

        const hottestArray = temps.filter((t) => t.temp === maxTemp);
        const coldestArray = temps.filter((t) => t.temp === minTemp);

        return { hottestArray, coldestArray };
    }, [neighborhoods, temperatures]);

    // Rotaciona os índices a cada 5 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setHotIndex((prev) =>
                hottestArray.length > 0 ? (prev + 1) % hottestArray.length : 0
            );
            setColdIndex((prev) =>
                coldestArray.length > 0 ? (prev + 1) % coldestArray.length : 0
            );
        }, ROTATE_INTERVAL);

        return () => clearInterval(interval);
    }, [hottestArray.length, coldestArray.length]);

    // Dados atuais sendo exibidos
    const hottest = hottestArray[hotIndex] || null;
    const coldest = coldestArray[coldIndex] || null;

    if (!hottest && !coldest) {
        return (
            <div className="flex gap-4 p-4">
                <div className="flex-1 bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                    Carregando dados de temperatura...
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-0" style={{ width, height }}>
            {/* Card Temperatura Mais Alta */}
            {hottest && (
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-md p-6 border border-orange-200 hover:shadow-lg transition-shadow duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                            🔥 Mais Quente
                        </h3>
                        <span className="text-4xl">☀️</span>
                    </div>

                    <div className="mb-4">
                        <div className="text-gray-600 text-sm mb-1">Bairro</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {hottest.neighborhood.name}
                        </div>
                    </div>

                    <div className="flex items-end gap-2 mb-4">
                        <div className="text-5xl font-light text-orange-600">
                            {hottest.weather.temp}
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Sensação:</span>
                            <span className="font-medium text-gray-800">
                                {hottest.weather.feelsLike}
                            </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Umidade:</span>
                            <span className="font-medium text-gray-800">
                                {hottest.weather.humidity}
                            </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Vento:</span>
                            <span className="font-medium text-gray-800">
                                {hottest.weather.windspeed}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Card Temperatura Mais Baixa */}
            {coldest && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-md p-6 border border-blue-200 hover:shadow-lg transition-shadow duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                            ❄️ Mais Frio
                        </h3>
                        <span className="text-4xl">🌤️</span>
                    </div>

                    <div className="mb-4">
                        <div className="text-gray-600 text-sm mb-1">Bairro</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {coldest.neighborhood.name}
                        </div>
                    </div>

                    <div className="flex items-end gap-2 mb-4">
                        <div className="text-5xl font-light text-blue-600">
                            {coldest.weather.temp}
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Sensação:</span>
                            <span className="font-medium text-gray-800">
                                {coldest.weather.feelsLike}
                            </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Umidade:</span>
                            <span className="font-medium text-gray-800">
                                {coldest.weather.humidity}
                            </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Vento:</span>
                            <span className="font-medium text-gray-800">
                                {coldest.weather.windspeed}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
