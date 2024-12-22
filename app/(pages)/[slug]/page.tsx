import { getPages } from "@/lib/pages";
import { Page, SegmentItem } from "@/types/fields";
import Segment from "./components/segment";

interface PageProps {
  params: { slug: string };
}

export default async function PageApp({ params }: PageProps) {
  const { slug } = params;

  const data: Page[] = await getPages({
    fields: ["*", "segments.*.*"],
    filter: { slug: { _eq: slug } },
    limit: 1,
  });

  if (!data.length) return <div>Error: Page not found</div>;

  const { title = '', segments } = data[0];
  const date_field = data[0].date_field || 'date_created';
  const value_field = data[0].value_field || 'effort_count_interval';
  const group_precision = data[0].group_precision || [ 'hour', 'day', 'month', 'year' ];
  const group_aggregation = data[0].group_aggregation || 'sum';
  const style = data[0].style || 'bar';

  const segmentCount = segments.length;
  const colorFactor = segmentCount ? Math.floor(360 / segmentCount) : 0;
  const config = {
    date_field,
    value_field,
    group_aggregation,
    group_precision,
    style,
  };

  const items: SegmentItem[] = segments.map((segment, index) => {
    const { strava_segments_id } = segment;

    const hue = index * colorFactor;
    const saturation = 80 - (index * 30 / segmentCount);
    const lightness = 40 + (index * 30 / segmentCount);
    return {
      ...strava_segments_id,
      color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    };
  });

  return <Segment data={items} title={title} config={config} />;
}
