"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ChartConfig } from "@/types/fields";

export default function LineChartComponent({ data, chartConfig, segments, type }: ChartConfig) {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const lineType: any = type || "linear";
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[250px] w-full min-h-[200px]"
    >
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ left: 15, right: 0, top: 10, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <YAxis width={20} />
        {segments.map((key) => (
          <Line
            key={key}
            dataKey={key}
            type={lineType}
            stroke={chartConfig[key].color}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
