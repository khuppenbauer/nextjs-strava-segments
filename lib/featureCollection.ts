import * as turf from '@turf/turf'
import { GeoJsonFeature, GeoJsonFeatureCollection } from '@/types/geojson';

export function featureCollection(features: GeoJsonFeature[]) {
  const featureCollection: GeoJsonFeatureCollection = {
    type: 'FeatureCollection',
    features,
  }

  const bbox = turf.bbox(featureCollection);
  const center = turf.center(featureCollection);

  const geoJsonFeatureCollection: GeoJsonFeatureCollection = {
    ...featureCollection,
    properties: {
      center: center.geometry.coordinates,
      bbox,
    }
  }
  return geoJsonFeatureCollection;
}
