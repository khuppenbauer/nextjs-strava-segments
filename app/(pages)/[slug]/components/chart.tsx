"use client";

import * as React from "react";
import { format, subWeeks, subMonths, subYears, startOfToday, startOfMonth, startOfYear, endOfToday, addDays } from "date-fns"
import { DateRange } from "react-day-picker"
import { Calendar as CalendarIcon } from "lucide-react"

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

type DateRangeProps = Record<string, string>;

const groupLabels: GroupProps = {
  hour_complete: "Stunden (gesamt)",
  hour: "Stunden",
  day: "Tage",
  month: "Monate",
  year: "Jahre",
  week: "Wochen",
  weekday: "Wochentage",
};

const dayLabels: string[] = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const dateRangeLabels: DateRangeProps = {
  today: "Heute",
  "1w": "1 Woche",
  "1m": "1 Monat",
  "3m": "3 Monate",
  "1y": "1 Jahr",
  mtd: "Dieser Monat",
  ytd: "Dieses Jahr",
};

const dateRangeOptions: string[] = ["today", "1w", "1m", "3m", "1y", "mtd", "ytd"];

const processConfig = (data: SegmentItem[], selectedRows: string[]): ChartConfig => {
  const chartConfig: SegmentEffortData = {};
  const segments: string[] = [];

  data.forEach(({ id, name, segment_id, color, activity_type }) => {
    if (selectedRows.includes(id)) {
      chartConfig[segment_id] = { label: `${name} (${activity_type})`, color };
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

const getDateRange = (date: DateRange) => {
  return date.from && date.to ? { from: formatDate(date.from), to: formatDate(addDays(date.to, 1)) } : null;
};

const buildGraphQLQuery = (data: SegmentItem[], group: GroupProps, dateFilter: string, activeChart: string, group_aggregation: string, value_field: string) => {
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
  const [activeChart, setActiveChart] = React.useState("day");
  const [chartStyle, setChartStyle] = React.useState(style);
  const { chartConfig, segments } = processConfig(data, selectedRows);
  const [result, setResult] = React.useState<ChartArray>();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subWeeks(startOfToday(), 1),
    to: endOfToday(),
  })
  React.useEffect(() => {
    let active = true;

    const group: GroupProps = {
      hour_complete: `["hour(${date_field})"]`,
      hour: `["year(${date_field})", "month(${date_field})", "day(${date_field})", "hour(${date_field})"]`,
      day: `["year(${date_field})", "month(${date_field})", "day(${date_field})"]`,
      month: `["year(${date_field})", "month(${date_field})"]`,
      year: `["year(${date_field})"]`,
      week: `["year(${date_field})", "week(${date_field})"]`,
      weekday: `["day"]`,
    };

    const loadData = async () => {
      let dateRange;
      if (date) {
        dateRange = getDateRange(date);
      }

      let dateFilter = ``;
      if (dateRange) {
        dateFilter = `
          { ${date_field}: { _gte: "${dateRange.from}" }},
          { ${date_field}: { _lte: "${dateRange.to}" }},
        `;
      }

      const query = `query { ${buildGraphQLQuery(data, group, dateFilter, activeChart, group_aggregation, value_field)} }`;
      
      const segmentData: SegmentEffortResponse = await getSegmentEfforts(query);

      if (!active) return;

      const chartData: ChartArray = [];
      data.map((item) => {
        const { segment_id } = item;
        const efforts = segmentData[`query_${segment_id}`] || null;
        efforts.forEach((effort) => {
          const { 
            group: { date_created_year, date_created_month, date_created_day, date_created_hour, date_created_week, day }, 
            sum: { effort_count_interval } 
          } = effort;

          let date = date_created_year;
          if (date_created_month) {
            date = date_created_month;
          }
          if (date_created_day) {
            date = `${date_created_day}.${date_created_month}`;
          }
          if (date_created_hour && activeChart == 'hour') {
            date = `${date_created_day}.${date_created_month} ${date_created_hour}:00`;
          }
          if (date_created_hour && activeChart == 'hour_complete') {
            date = `${date_created_hour}:00`;
          }
          if (date_created_week) {
            date = date_created_week;
          }
          if (typeof day === 'number') {
            date = dayLabels[day];
          }
          let entry = chartData.find(item => item.date === date);
          if (!entry) {
            let time = `${date_created_year}-${date_created_month}-${date_created_day}`;
            if (date_created_hour) {
              time = `${time}T${date_created_hour}`;
            }
            entry = { date, time: new Date(time).getTime() };
            chartData.push(entry);
          }
          entry[segment_id] = parseInt(effort_count_interval) > 0 ? effort_count_interval : 0;
        });
      });

      chartData.sort((a, b) => a.time - b.time);
      setResult(chartData);
    };

    loadData();
    return () => { active = false };
  }, [activeChart, date, data, date_field, group_aggregation, value_field]);

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-stretch space-y-0 border-b p-0 flex-row">
        <div className="flex-auto flex flex-col border-t even:border-l sm:border-l sm:border-t-0">
          <span className="text-xs text-center py-2 pt-4">
            Zeitraum
          </span>
          <span className="py-2 px-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date" variant={"outline"} className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Select
                  onValueChange={(value) => {
                    let dateRange;
                    switch (value) {
                      case 'today':
                        dateRange = { from: startOfToday(), to: endOfToday()}
                        break;
                      case '1w':
                        dateRange = { from: subWeeks(startOfToday(), 1), to: endOfToday()}
                        break;
                      case '1m':
                        dateRange = { from: subMonths(startOfToday(), 1), to: endOfToday()}
                        break;
                      case '3m':
                        dateRange = { from: subMonths(startOfToday(), 3), to: endOfToday()}
                        break;
                      case '1y':
                        dateRange = { from: subYears(startOfToday(), 1), to: endOfToday()}
                        break;
                      case 'mtd':
                        dateRange = { from: startOfMonth(startOfToday()), to: endOfToday()}
                        break;
                      case 'ytd':
                        dateRange = { from: startOfYear(startOfToday()), to: endOfToday()}
                        break;          
                    }
                    setDate(dateRange)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Zeitraum" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <>
                      {dateRangeOptions.map((key) => <SelectItem key={key} value={key}>{dateRangeLabels[key]}</SelectItem>)}
                    </>
                  </SelectContent>
                </Select>
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </span>
        </div>
        <div className="flex-auto flex flex-col border-t even:border-l sm:border-l sm:border-t-0">
          <span className="text-xs text-center py-2 pt-4">
            Gruppierung
          </span>
          <span className="py-2 px-4">
            <Select value={activeChart} onValueChange={setActiveChart}>
              <SelectTrigger className="">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <>
                  {group_precision.map((key) => <SelectItem key={key} value={key}>{groupLabels[key]}</SelectItem>)}
                </>
              </SelectContent>
            </Select>
          </span>
        </div>
        <div className="flex-auto flex flex-col border-t even:border-l sm:border-l-0 sm:border-t-0">
          <span className="text-xs text-center py-2 pt-4">
            Darstellung
          </span>
          <span className="py-2 px-4">
            <Select value={chartStyle} onValueChange={setChartStyle}>
              <SelectTrigger className="">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="monotone">Line Smooth</SelectItem>
                <SelectItem value="step">Line Step</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="stacked">Bar stacked</SelectItem>
              </SelectContent>
            </Select>
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="px-2 sm:p-6">
        {["line", "monotone", "step"].includes(chartStyle) ? (
          <LineChartComponent data={result} chartConfig={chartConfig} segments={segments} type={chartStyle} />
        ) : (
          <BarChartComponent data={result} chartConfig={chartConfig} segments={segments} style={chartStyle} />
        )}
      </CardContent>
    </Card>
  );
}
