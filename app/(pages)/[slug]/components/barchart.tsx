"use client";

import * as React from "react";
import { CartesianGrid, Bar, BarChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ChartConfig } from "@/types/fields";

export default function BarChartComponent({ data, chartConfig, segments, style }: ChartConfig) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[250px] w-full min-h-[200px]"
    >
      <BarChart
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
          minTickGap={32}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <YAxis width={20} />
        {segments.map((key) => (
          <Bar
            key={key}
            {...(style === 'stacked' ? { stackId: "0" } : {})}
            dataKey={key}
            fill={chartConfig[key].color}
            barSize={20}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
