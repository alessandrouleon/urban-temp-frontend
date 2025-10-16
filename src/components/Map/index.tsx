import { Icon, type LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import type { Neighborhood } from "../../interfaces";
import { getNeighborhoodsFromManaus } from "../../services/overpassService";
import { getTemperature } from "../../services/weatherService";

const markerIcon = new Icon({
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const center: LatLngTuple = [-3.1019, -60.025];

const MapaManaus: React.FC = () => {
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
    const [temperaturas, setTemperaturas] = useState<
        Record<string, number | string>
    >({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const dados = await getNeighborhoodsFromManaus();
                setNeighborhoods(dados);
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
            const tempData: Record<string, number | string> = {};
            for (const n of neighborhoods) {
                tempData[n.name] = await getTemperature(n.lat, n.lon);
            }
            setTemperaturas(tempData);
        };

        fetchTemps();
        const interval = setInterval(fetchTemps, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [neighborhoods]);

    if (loading) return <p>Carregando bairros de Manaus...</p>;

    return (
        <MapContainer
            center={center}
            zoom={12}
            style={{ width: "100%", height: "80vh" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {neighborhoods.map((n) => (
                <Marker
                    key={`${n.name}-${n.lat}-${n.lon}`}
                    position={[n.lat, n.lon]}
                    icon={markerIcon}
                >
                    <Popup>
                        <strong>{n.name}</strong>
                        <br />
                        Temperatura: {temperaturas[n.name] ??
                            "Carregando..."}{" "}
                        °C
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapaManaus;
