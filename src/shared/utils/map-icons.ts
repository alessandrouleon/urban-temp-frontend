// src/utils/map-icons.ts
import L, { Icon } from "leaflet";
import blueIcon from "../assets/icons/marker-icon-blue.png";
import orangeIcon from "../assets/icons/marker-icon-orange.png";
import redIcon from "../assets/icons/marker-icon-red.png";
import shadowIcon from "../assets/icons/marker-shadow.png";

export type TemperatureLevel = "cold" | "warm" | "hot";

const ICON_SIZE: [number, number] = [25, 41];
const ICON_ANCHOR: [number, number] = [12, 41];

// função genérica para criar ícones
function createMarker(iconUrl: string): Icon {
    return new Icon({
        iconUrl,
        shadowUrl: shadowIcon,
        iconSize: ICON_SIZE,
        iconAnchor: ICON_ANCHOR,
    });
}

// exporta os ícones já prontos
export const mapIcons = {
    cold: createMarker(blueIcon),
    warm: createMarker(orangeIcon),
    hot: createMarker(redIcon),
};

export const getColorByTemperature = (temp: number): string => {
    if (temp >= 34) return "#991B1B"; // Vermelho escuro (extremamente quente)
    if (temp >= 32) return "#DC2626"; // Vermelho (muito quente)
    if (temp >= 30) return "#EF4444"; // Vermelho (quente)
    if (temp >= 29) return "#F97316"; // Laranja (morno-quente)
    if (temp >= 28) return "#FB923C"; // Laranja claro
    if (temp >= 27) return "#FBBF24"; // Amarelo (agradável)
    if (temp >= 26) return "#FCD34D"; // Amarelo claro
    if (temp >= 25) return "#84CC16"; // Verde-limão (fresco)
    if (temp >= 24) return "#22C55E"; // Verde (frio)
    if (temp >= 23) return "#10B981"; // Verde escuro
    return "#3B82F6"; // Azul (muito frio)
};

export const getIconByTemperature = (temp: number): L.DivIcon => {
    const color = getColorByTemperature(temp);
    const displayTemp = temp.toFixed(1); // Mostra com 1 casa decimal

    const html = `
        <div style="
            position: relative;
            width: 38px;
            height: 38px;
        ">
            <div style="
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 19px solid transparent;
                border-right: 19px solid transparent;
                border-top: 28px solid ${color};
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            "></div>
            <div style="
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 32px;
                height: 32px;
                background: ${color};
                border-radius: 50%;
                border: 2px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: bold;
                color: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
                ${displayTemp}°
            </div>
        </div>
    `;

    return L.divIcon({
        html,
        className: "custom-temp-marker",
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
    });
};

/**
 * Versão alternativa: ícone circular simples
 */
export const getSimpleIconByTemperature = (temp: number): L.DivIcon => {
    const color = getColorByTemperature(temp);
    const displayTemp = temp.toFixed(1); // Mostra com 1 casa decimal

    const html = `
        <div style="
            width: 32px;
            height: 32px;
            background: ${color};
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            cursor: pointer;
        ">
            ${displayTemp}°
        </div>
    `;

    return L.divIcon({
        html,
        className: "custom-temp-marker-simple",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });
};
