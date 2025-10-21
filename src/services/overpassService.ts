import axios from "axios";
import type {
    Neighborhood,
    OverpassElement,
} from "../interfaces/map-interface";

export const getNeighborhoodsFromCity = async (): Promise<Neighborhood[]> => {
    const query = `
    [out:json];
    area["name"="Manaus"]->.a;
    (
      node["place"="neighbourhood"](area.a);
      node["place"="suburb"](area.a);
    );
    out center;
  `;

    const res = await axios.get<{ elements: OverpassElement[] }>(
        "https://overpass-api.de/api/interpreter",
        { params: { data: query }, timeout: 60000 }
    );

    return res.data.elements
        .filter(
            (
                el
            ): el is OverpassElement & {
                tags: { name: string };
                lat: number;
                lon: number;
            } =>
                Boolean(el.tags?.name) &&
                typeof el.lat === "number" &&
                typeof el.lon === "number"
        )
        .map((el) => ({
            name: el.tags.name,
            lat: el.lat,
            lon: el.lon,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
};
