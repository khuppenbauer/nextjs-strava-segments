"use client";

import * as React from "react";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import OSM from 'ol/source/OSM';
import { Style, Stroke } from 'ol/style';
import { Card, CardContent } from "@/components/ui/card";
import { featureCollection } from "@/lib/featureCollection";
import { SegmentItem } from "@/types/fields";
import { GeoJsonFeature } from "@/types/geojson";

interface MapProps {
  data: SegmentItem[];
  selectedRows: string[];
}

interface PopupContent {
  name?: string;
}

const lineStyle = new Style({
  stroke: new Stroke({
    width: 2,
  }),
});

const borderStyle = new Style({
  stroke: new Stroke({
    color: '#000000',
    width: 4,
  })
});

export default function MapComponent({ data, selectedRows }: MapProps) {
  const [ popupContent, setPopupContent ] = React.useState<PopupContent>({});

  React.useEffect(() => {
    const selectedFeatures: GeoJsonFeature[] = data
      .filter(segment => selectedRows.includes(segment.id))
      .map(({ id, name, geojson, color }) => {
        geojson.properties = { id, name, color };
        return geojson;
      });

    if (!selectedFeatures.length) return;

    const geojson = featureCollection(selectedFeatures);

    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: feature => {
        lineStyle.getStroke()?.setColor(feature.get('color'));
        return [borderStyle, lineStyle];
      },
    });

    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer,
      ],
      view: new View(),
    });

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    map.on('click', (event: any): void => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => {
        return feature;
      });
      if (feature) {
        const properties = feature.getProperties();
        const { name } = properties;
        const popupContent = {
          name,
        }
        setPopupContent(popupContent);
      } else {
        setPopupContent({});
      }
    });

    map.getView().fit(vectorSource.getExtent(), { padding: [100, 100, 100, 100] });

    return () => {
      map.setTarget('');
    };
  }, [data, selectedRows]);

  return (
    <Card>
      <CardContent className="px-2 sm:p-6">
        <div id="map" style={{ height: '50vh' }} />
        {popupContent.name && (
          <div
            id="popup"
            className="bg-white border rounded-lg shadow-lg p-3 z-50 text-sm"
          >
            {popupContent.name}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
