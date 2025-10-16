export interface Neighborhood {
    name: string;
    lat: number;
    lon: number;
}

export interface OverpassElement {
    id: number;
    lat: number;
    lon: number;
    tags?: {
        name?: string;
        [key: string]: string | undefined;
    };
    type: string;
}
