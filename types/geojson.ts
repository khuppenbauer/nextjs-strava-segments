export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
  properties?: any;
};

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: Polygon | MultiPolygon | LineString;
  properties: {
    id: string;
    name: string;
    color: string;
  };
};

export interface MultiPolygon {
  type: 'MultiPolygon';
  coordinates: number[][][][];
};

export interface Polygon {
  type: 'Polygon';
  coordinates: number[][][];
};

export interface LineString {
  type: 'LineString';
  coordinates: number[][];
};
