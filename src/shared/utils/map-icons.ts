// src/utils/map-icons.ts
import { Icon } from "leaflet";

// importa os arquivos locais
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

// função auxiliar para escolher o ícone conforme a temperatura
export function getIconByTemperature(temp: number): Icon {
    if (temp <= 27) return mapIcons.cold;
    if (temp <= 30) return mapIcons.warm;
    return mapIcons.hot;
}
