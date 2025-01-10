"use client";

import * as React from "react";
import { 
  ColumnDef,
  RowData,
  flexRender,
  useReactTable,
  Column,
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SegmentItem, RowSelection } from "@/types/fields";

declare module '@tanstack/react-table' {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

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
        className="mb-3"
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
    accessorKey: "segment_id",
    header: "",
    cell: ({ row }) => (
      <a href={`https://www.strava.com/segments/${row.getValue('segment_id')}`} target="_blank"><ArrowUpRight /></a>
    ),
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
    meta: {
      filterVariant: 'text',
    },
  },
  {
    accessorKey: "activity_type",
    header: ({ column }) => (
      <SortableHeader column={column} label="Typ" />
    ),
    cell: ({ row }) => (
      <p className="text-sm font-medium leading-none">
        {row.getValue("activity_type")}
      </p>
    ),
    meta: {
      filterVariant: 'select',
    },
    filterFn: "equals",
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

function Filter({ column, onFilterReset }: { column: Column<any, unknown>; onFilterReset: () => void }) {
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnFilterValue = column.getFilterValue()

  const sortedUniqueValues = React.useMemo(() => {
    if (filterVariant === "range") {
      return [];
    }
    const uniqueValues = Array.from(column.getFacetedUniqueValues().keys());
    return uniqueValues.sort().slice(0, 5000);
  }, [column, filterVariant]);

  return filterVariant === 'text' ? (
    <>
      <datalist id={column.id + 'list'}>
        {sortedUniqueValues.map((value: any) => (
          <option value={value} key={value} />
        ))}
      </datalist>
      <Input
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={e => {
          column.setFilterValue(e.target.value)
          if (e.target.value === "") {
            onFilterReset()
          }
        }}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        list={column.id + 'list'}
      />
      <div className="h-2" />
    </>
  ) : filterVariant === 'select' ? (
    <>
      <Select 
        value={columnFilterValue?.toString() || "all"}
        onValueChange={(value) => {
          if (value === "all") {
            column.setFilterValue("")
            onFilterReset()
          } else {
            column.setFilterValue(value)
          }
        }
      }>
        <SelectTrigger>
          <SelectValue placeholder="Alle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key="all" value="all">Alle</SelectItem>
          <>
            {sortedUniqueValues.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
          </>
        </SelectContent>
      </Select>          
      <div className="h-2" />
    </>
  ) : (
    <>
    </>
  )
}

export default function TableComponent({ data, defaultSelectedRows, onRowToggle }: TableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState(defaultSelectedRows)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id || '',
    state: { sorting, rowSelection, columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const handleResetFilter = React.useCallback(() => {
    const rows = table.getCoreRowModel().rows;
    rows.forEach((row) => {
      rowSelection[row.id] = true;
    });
    setRowSelection(rowSelection);
  }, [table, rowSelection]);

  React.useEffect(() => {
    const selectedRowIds = Object.keys(rowSelection);
    const filteredRows = table.getFilteredRowModel().rows;
    const filteredRowIds = filteredRows.map((row) => row.id);
  
    if (columnFilters.length > 0) {
      filteredRowIds.forEach((id) => {
        rowSelection[id] = true;
      });
      selectedRowIds.forEach((id) => {
        if (!filteredRowIds.includes(id)) {
          delete rowSelection[id];
        }
      });
    }
    onRowToggle(rowSelection);
  }, [table, rowSelection, columnFilters, onRowToggle]);
  

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
                      : (
                        <>
                          {header.column.getCanFilter() ? (
                            <div className="py-2">
                              <Filter column={header.column} onFilterReset={handleResetFilter} />
                            </div>
                          ) : null}
                          <div>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                        </>
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
