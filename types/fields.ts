import { GeoJsonFeature } from "./geojson";

export interface ItemsQuery {
  limit?: number;
  fields?: Array<string>;
  filter?: Record<string, {
    _eq?: string | number;
  }>;
  sort?: Array<string>;
}

export interface Page {
  id?: string;
  slug?: string;
  title?: string;
  headline?: string;
  description?: string;
  segments: Segment[];
  style?: string;
  metadata?: any[];
  value_field?: string;
  date_field?: string;
  group_aggregation?: string;
  group_precision?: string[];
}

export interface PageChartConfig {
  value_field: string;
  date_field: string;
  group_aggregation: string;
  group_precision: string[];
  style: string;
}

export interface Segment {
  strava_segments_id: SegmentItem;
}

export interface SegmentItem {
  id: string;
  segment_id: string;
  name: string;
  activity_type: string;
  city: string;
  state: string;
  country: string;
  color: string;
  efforts: SegmentEffort[];
  geojson: GeoJsonFeature;
}

export interface SegmentEffort {
  group: {
    date_created_year: string;
    date_created_month?: string;
    date_created_day?: string;
    date_created_hour?: string;
    date_created_week?: string;
    day?: number;
  };
  sum: {
    effort_count_interval: string;
  };
}

export interface SegmentEffortResponse {
  [queryKey: string]: SegmentEffort[];
};

export interface ChartPoint {
  date: string;
  [key: string]: number | string;
};

export interface ChartInfo {
  label: string;
  color: string;
};

export interface ChartConfig {
  chartConfig: SegmentEffortData;
  segments: string[];
  data?: ChartArray;
  style?: string;
  type?: string;
};

export type ChartArray = ChartPoint[];

export type SegmentEffortData = Record<string, ChartInfo>;

export type RowSelection = Record<string, boolean>;
