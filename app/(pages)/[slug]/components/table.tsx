"use client";

import * as React from "react";
import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SegmentItem, RowSelection } from "@/types/fields";

export type TableProps = {
  data: SegmentItem[];
  defaultSelectedRows: Record<string, boolean>;
  onRowToggle: (selectedRows: RowSelection) => void;
}

export const columns: ColumnDef<SegmentItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column} label="Name" />
    ),
    cell: ({ row }) => (
      <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
        <span 
          className="flex h-2 w-2 translate-y-1 rounded-full"
          style={{ backgroundColor: row.original.color }}
        />
        <p className="text-sm font-medium leading-none">
          {row.getValue("name")}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <SortableHeader column={column} label="Stadt" />
    ),
    cell: ({ row }) => (
      <p className="text-sm font-medium leading-none">
        {row.getValue("city")}
      </p>
    ),
  },
  {
    accessorKey: "state",
    header: ({ column }) => (
      <SortableHeader column={column} label="Bundesland" />
    ),
    cell: ({ row }) => (
      <p className="text-sm font-medium leading-none">
        {row.getValue("state")}
      </p>
    ),
  },
  {
    accessorKey: "distance",
    header: ({ column }) => (
      <SortableHeader column={column} label="Länge" />
    ),
    cell: ({ row }) => <div className="lowercase">{parseFloat(row.getValue("distance"))}</div>,
  },
  {
    accessorKey: "average_grade",
    header: ({ column }) => (
      <SortableHeader column={column} label="Steigung" />
    ),
    cell: ({ row }) => <div className="lowercase">{parseFloat(row.getValue("average_grade"))}</div>,
  },
  {
    accessorKey: "elevation_high",
    header: ({ column }) => (
      <SortableHeader column={column} label="Höchster Punkt" />
    ),
    cell: ({ row }) => (
      <p className="text-sm font-medium leading-none">
        {row.getValue("elevation_high")}
      </p>
    ),
  },
  {
    accessorKey: "elevation_low",
    header: ({ column }) => (
      <SortableHeader column={column} label="Tiefster Punkt" />
    ),
    cell: ({ row }) => (
      <p className="text-sm font-medium leading-none">
        {row.getValue("elevation_low")}
      </p>
    ),
  },
]

/* eslint-disable  @typescript-eslint/no-explicit-any */
const SortableHeader = ({ column, label }: { column: any; label: string }) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    className="-px-4"
  >
    {label}
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>
)

export default function TableComponent({ data, defaultSelectedRows, onRowToggle }: TableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState(defaultSelectedRows)

  React.useEffect(() => onRowToggle(rowSelection), [rowSelection, onRowToggle])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id || '',
    state: { sorting, rowSelection },
  })

  return (
    <Card>
      <CardContent className="px-2 sm:p-6">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
