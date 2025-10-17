import { Maps } from "../../components/Map";

export function PageMaps() {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Maps</h1>
            <p className="text-gray-600 mb-3">
                Lista de temperatura por bairro no mapa
            </p>
            <Maps width="70%" height="70vh" />
        </div>
    );
}
