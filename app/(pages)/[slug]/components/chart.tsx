"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSegmentEfforts } from "@/lib/segments";
import { cn } from "@/lib/utils";
import { SegmentItem, SegmentEffortResponse, PageChartConfig, ChartConfig, SegmentEffortData, ChartArray } from "@/types/fields";
import LineChartComponent from "./linechart";
import BarChartComponent from "./barchart";

interface ChartProps {
  data: SegmentItem[];
  selectedRows: string[];
  config: PageChartConfig;
}

type GroupProps = Record<string, string>;

const groupLabels: GroupProps = {
  hour_complete: "Stunden (gesamt)",
  hour: "Stunden",
  day: "Tage",
  month: "Monate",
  year: "Jahre",
};

const processConfig = (data: SegmentItem[], selectedRows: string[]): ChartConfig => {
  const chartConfig: SegmentEffortData = {};
  const segments: string[] = [];

  data.forEach(({ id, name, segment_id, color }) => {
    if (selectedRows.includes(id)) {
      chartConfig[segment_id] = { label: name, color };
      if (!segments.includes(segment_id)) segments.push(segment_id);
    }
  });

  return { chartConfig, segments };
};

const parseDate = (date: Date) => ({
  day: date.getDate(),
  month: date.getMonth() + 1,
  year: date.getFullYear(),
});

const formatDate = (date: Date) => {
  const { day, month, year } = parseDate(date);
  return `${year}-${month}-${day}`;
};

const getDateRange = (activeChart: string, currentDate: Date) => {
  const { year, month } = parseDate(currentDate);
  let from: Date | null = null;
  let to: Date | null = null;

  switch (activeChart) {
    case "hour":
      from = currentDate;
      to = new Date(currentDate.getTime() + 86400000);
      break;
    case "day":
      from = new Date(year, month - 1, 1);
      to = new Date(year, month, 1);
      break;
    case "month":
      from = new Date(year, 0, 1);
      to = new Date(year + 1, 0, 1);
      break;
  }

  return from && to ? { from: formatDate(from), to: formatDate(to) } : null;
};

const buildGraphQLQuery = (data: SegmentItem[], group: GroupProps, dateFilter: string, activeChart: string, date_field: string, group_aggregation: string, value_field: string) => {
  return data.map(({ segment_id }) => `
    query_${segment_id}: strava_segments_efforts_aggregated(
      limit: -1,
      filter: { 
        _and: [
          { segment_id: { _eq: ${segment_id} }},
          ${dateFilter}
        ]
      },
      groupBy: ${group[activeChart]}
    ) {
      ${group_aggregation} { ${value_field} }
      group
    }
  `).join("\n");
};

export default function ChartComponent({ data, selectedRows, config }: ChartProps) {
  const { group_aggregation, group_precision, value_field, date_field, style } = config;
  const [activeChart, setActiveChart] = React.useState(group_precision[0]);
  const [currentDate, setCurrentDate] = React.useState<Date>();
  const [chartStyle, setChartStyle] = React.useState(style);
  const { chartConfig, segments } = processConfig(data, selectedRows);
  const [result, setResult] = React.useState<ChartArray>();

  React.useEffect(() => {
    let active = true;

    const group: GroupProps = {
      hour_complete: `["hour(${date_field})"]`,
      hour: `["year(${date_field})", "month(${date_field})", "day(${date_field})", "hour(${date_field})"]`,
      day: `["year(${date_field})", "month(${date_field})", "day(${date_field})"]`,
      month: `["year(${date_field})", "month(${date_field})"]`,
      year: `["year(${date_field})"]`,
    };

    const loadData = async () => {
      const defaultDate = currentDate || new Date();
      const dateRange = getDateRange(activeChart, defaultDate);

      let dateFilter = ``;
      if (dateRange) {
        dateFilter = `
          { ${date_field}: { _gte: "${dateRange.from}" }},
          { ${date_field}: { _lte: "${dateRange.to}" }},
        `;
      }

      const query = `query { ${buildGraphQLQuery(data, group, dateFilter, activeChart, date_field, group_aggregation, value_field)} }`;
      
      const segmentData: SegmentEffortResponse = await getSegmentEfforts(query);

      if (!active) return;

      const chartData: ChartArray = [];
      data.map((item) => {
        const { segment_id } = item;
        const efforts = segmentData[`query_${segment_id}`] || null;
        efforts.forEach((effort) => {
          const { 
            group: { date_created_year, date_created_month, date_created_day, date_created_hour }, 
            sum: { effort_count_interval } 
          } = effort;
          let date = `${date_created_year}`;
          if (date_created_month) {
            date = `${date_created_month}`;
          }
          if (date_created_day) {
            date = `${date_created_day}`;
          }
          if (date_created_hour) {
            date = `${date_created_hour}:00`;
          }
          let entry = chartData.find(item => item.date === date);
          if (!entry) {
            entry = { date };
            chartData.push(entry);
          }
          entry[segment_id] = effort_count_interval;
        });
      });

      setResult(chartData);
    };

    loadData();
    return () => { active = false };
  }, [activeChart, currentDate, data, date_field, group_aggregation, value_field]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[160px] mt-4 mx-4 text-left", !currentDate && "text-muted-foreground")}>
                <CalendarIcon />
                {currentDate ? format(currentDate, "dd.MM.yyyy") : format(new Date(), "dd.MM.yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar mode="single" selected={currentDate} onSelect={setCurrentDate} initialFocus />
            </PopoverContent>
          </Popover>
          <Select value={chartStyle} onValueChange={setChartStyle}>
            <SelectTrigger className="w-[120px] sm:ml-auto m-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="stacked">Bar stacked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex">
          {group_precision.map((key) => {
            const visible = key == "hour_complete" ? "max-sm:hidden" : "";
            if (!groupLabels[key]) {
              return null;
            }
            return (
              <button
                key={key}
                data-active={activeChart === key}
                className={cn(`relative flex-1 px-3 py-4 ${visible}`, activeChart === key && "bg-muted/50")}
                onClick={() => setActiveChart(key)}
              >
                <span>{groupLabels[key]}</span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      
      <CardContent className="px-2 sm:p-6">
        {chartStyle === "line" ? (
          <LineChartComponent data={result} chartConfig={chartConfig} segments={segments} />
        ) : (
          <BarChartComponent data={result} chartConfig={chartConfig} segments={segments} style={chartStyle} />
        )}
      </CardContent>
    </Card>
  );
}
