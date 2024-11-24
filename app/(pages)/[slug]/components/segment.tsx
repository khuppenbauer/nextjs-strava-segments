"use client";

import { useState, useMemo } from "react";
import { SegmentItem, RowSelection, PageChartConfig } from "@/types/fields";
import DataTable from "./table";
import Chart from "./chart";
import Map from "./map";

interface SegmentProps {
  data: SegmentItem[];
  title: string;
  config: PageChartConfig;
}

export default function SegmentComponent({ data, title, config }: SegmentProps) {
  const defaultRowSelection = useMemo(() => {
    return data.reduce((acc, item) => {
      acc[item.id] = true;
      return acc;
    }, {} as RowSelection);
  }, [data]);

  const [selectedRows, setSelectedRows] = useState<RowSelection>(defaultRowSelection);
  const selectedRowIds = Object.keys(selectedRows);

  const handleRowToggle = (items: RowSelection) => setSelectedRows(items);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <section className="mx-auto flex flex-col items-start gap-2 px-4 py-8 md:py-12 md:pb-8 lg:py-12 lg:pb-10">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {title}
        </h1>
      </section>
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        <Chart data={data} selectedRows={selectedRowIds} config={config} />
        <Map data={data} selectedRows={selectedRowIds} />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTable data={data} defaultSelectedRows={defaultRowSelection} onRowToggle={handleRowToggle} />
      </div>
    </div>
  );
}
