// import WeatherAreaChart from "../../components/ApexChart/AreaChart";
import WeatherComposedChart from "../../components/LineBar/WeatherComposedChart";

// src/home/dashboard.tsx (já existe, mas simplifique)
export function Dashboard() {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
            <p className="text-gray-600">
                Dados de temperatura e umidade exibidos em gráficos
            </p>
            <div>
                {/* <div>
                    <WeatherAreaChart />
                </div> */}
                <div>
                    <WeatherComposedChart />
                </div>
            </div>
        </div>
    );
}
