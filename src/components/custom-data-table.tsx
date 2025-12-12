"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ColumnSizingState, ColumnSizingInfoState } from "@tanstack/react-table";

function PagerButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="h-8"
    >
      {children}
    </Button>
  );
}

export type CustomDataTableProps<TData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  enableSorting?: boolean;
  enablePagination?: boolean;
  initialPageSize?: number;
  className?: string;
  emptyMessage?: string;
  tableHeight?: string;
  stickyPagination?: boolean;
  onRowClick?: (row: TData) => void;
  rowClassName?: string;
};

export default function CustomDataTable<TData>({
  columns,
  data,
  enableSorting = true,
  enablePagination = true,
  initialPageSize = 10,
  className,
  emptyMessage = "No results",
  tableHeight = "h-full",
  stickyPagination = true,
  onRowClick,
  rowClassName,
}: CustomDataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [columnSizingInfo, setColumnSizingInfo] = React.useState<ColumnSizingInfoState>({
    columnSizingStart: [],
    deltaOffset: 0,
    deltaPercentage: 0,
    isResizingColumn: false,
    startOffset: 0,
    startSize: 0,
  });

  // Ref to measure table container
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
    const updateWidth = () => {
      if (tableContainerRef.current) {
        setContainerWidth(tableContainerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination: { pageIndex, pageSize },
      columnSizing,
      columnSizingInfo,
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    onColumnSizingChange: setColumnSizing,
    onColumnSizingInfoChange: setColumnSizingInfo,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    debugAll: false,
  });

  // SCALE columns internally to remove right-side blank space
  React.useEffect(() => {
    const cols = table.getAllLeafColumns();
    if (!cols.length || !containerWidth) return;

    const totalColumnWidth = cols.reduce((sum, c) => sum + (c.getSize() || 0), 0);
    if (totalColumnWidth === 0) return;

    const scaleFactor = containerWidth / totalColumnWidth;

    const newSizing: Record<string, number> = {};
    cols.forEach((col) => {
      newSizing[col.id] = (col.getSize() || 0) * scaleFactor;
    });

    table.setColumnSizing(newSizing);
  }, [containerWidth, table]);

  return (
    
    <div className={cn("flex flex-col", tableHeight, className ?? "space-y-3")}>
      <div className="rounded-md border border-border/50 bg-card overflow-hidden flex flex-col">

        {/* HORIZONTAL SCROLL WRAPPER */}
        <div
          ref={tableContainerRef}
          className="overflow-x-auto overflow-y-auto w-full"
        >
          {/* Table itself */}
          <Table className="table-fixed w-full min-w-max">
            {/* HEADER */}
            <TableHeader className="sticky top-0 bg-card z-10">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      style={{ width: h.getSize() }}
                      className="relative group whitespace-nowrap"
                    >
                      {h.isPlaceholder
                        ? null
                        : enableSorting && h.column.getCanSort() ? (
                          <button
                            className="inline-flex items-center gap-1 hover:underline"
                            onClick={h.column.getToggleSortingHandler()}
                          >
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            <span aria-hidden className="text-muted-foreground">
                              {h.column.getIsSorted() === "asc" ? (
                                <ArrowUp size={14} />
                              ) : h.column.getIsSorted() === "desc" ? (
                                <ArrowDown size={14} />
                              ) : (
                                <ArrowUpDown size={14} />
                              )}
                            </span>
                          </button>
                        ) : (
                          flexRender(h.column.columnDef.header, h.getContext())
                        )}

                      {h.column.getCanResize() && (
                        <div
                          onMouseDown={h.getResizeHandler()}
                          onTouchStart={h.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent group-hover:bg-primary/40"
                        />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            {/* BODY */}
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={rowClassName}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className="truncate"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllLeafColumns().length}
                    className="text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>

        {/* PAGINATION */}
        {enablePagination && (
          <div
            className={cn(
              "py-2 px-3 bg-card",
              stickyPagination ? "border-t border-border/50" : ""
            )}
          >
            <div className="flex items-center justify-center gap-3">
              <PagerButton
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                label="First page"
              >
                «
              </PagerButton>

              <PagerButton
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                label="Previous page"
              >
                ‹
              </PagerButton>

              <span className="text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount() || 1}
              </span>

              <PagerButton
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                label="Next page"
              >
                ›
              </PagerButton>

              <PagerButton
                onClick={() =>
                  table.setPageIndex(
                    Math.max(0, (table.getPageCount() || 1) - 1)
                  )
                }
                disabled={!table.getCanNextPage()}
                label="Last page"
              >
                »
              </PagerButton>

              <label className="inline-flex items-center gap-2 text-sm">
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  aria-label="Rows per page"
                  className="border rounded px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {[10, 20, 50].map((ps) => (
                    <option key={ps} value={ps}>
                      {ps}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}