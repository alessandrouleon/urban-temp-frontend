import L from "leaflet";
import "leaflet.heat";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface HeatmapLayerProps {
    points: [number, number, number][];
    options?: {
        minOpacity?: number;
        maxZoom?: number;
        max?: number;
        radius?: number;
        blur?: number;
        gradient?: Record<number, string>;
    };
}

export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({
    points,
    options = {},
}) => {
    const map = useMap();

    useEffect(() => {
        if (!points || points.length === 0) return;

        // Configurações padrão otimizadas para temperatura
        const defaultOptions = {
            minOpacity: 0.4,
            maxZoom: 18,
            max: 1.0,
            radius: 50, // Raio do gradiente em pixels
            blur: 35, // Suavização do gradiente
            gradient: {
                0.0: "#3B82F6", // Azul (frio)
                0.2: "#22C55E", // Verde
                0.4: "#84CC16", // Verde-limão
                0.5: "#FBBF24", // Amarelo
                0.6: "#F97316", // Laranja
                0.8: "#EF4444", // Vermelho
                1.0: "#DC2626", // Vermelho escuro (quente)
            },
            ...options,
        };

        // Cria a camada de heatmap
        const heatLayer = L.heatLayer(points, defaultOptions);
        heatLayer.addTo(map);

        // Cleanup: remove a camada quando o componente desmontar
        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points, options]);

    return null;
};
