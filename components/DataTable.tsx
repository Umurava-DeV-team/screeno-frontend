"use client";
import CustomSelect from "@/components/CustomSelect";
import ExportMenu from "@/components/ExportMenu";

import { isValidElement, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T, index: number) => ReactNode);
  className?: string;
  exportable?: boolean;
}
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  onRowSelect?: (item: T) => void;
  selectedRowKey?: string | number;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchPlaceholder?: string;
  rowKey?: keyof T | ((item: T, index: number) => string | number);
  emptyState?: {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: ReactNode;
  };
}
function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(cellText).join(", ");
  return typeof value === "object" ? "" : String(value);
}
function renderedText(value: ReactNode): string {
  if (isValidElement<{ children?: ReactNode }>(value))
    return renderedText(value.props.children);
  if (Array.isArray(value)) return value.map(renderedText).join(" ");
  return cellText(value);
}

export default function DataTable<T>({
  columns,
  data,
  title,
  onRowSelect,
  selectedRowKey,
  onView,
  onEdit,
  onDelete,
  searchPlaceholder = "Search records…",
  rowKey,
  emptyState,
}: DataTableProps<T>) {
  const reportColumns=columns.filter(column=>column.exportable!==false&&column.header.trim()&&!/^(actions|applicant tools|select)$/i.test(column.header));
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [controls, setControls] = useState(false);
  const [sort, setSort] = useState("");
  const [descending, setDescending] = useState(false);
  const sorted = useMemo(() => {
    const filtered = data.filter((item) =>
      Object.values(item as Record<string, unknown>).some((v) =>
        cellText(v).toLowerCase().includes(query.trim().toLowerCase()),
      ),
    );
    if (sort) {
      const column = columns[Number(sort)];
      if (column) {
        const text = (item: T) =>
          typeof column.accessor === "function"
            ? renderedText(column.accessor(item, 0))
            : cellText(item[column.accessor]);
        filtered.sort(
          (a, b) =>
            text(a).localeCompare(text(b), undefined, { numeric: true }) *
            (descending ? -1 : 1),
        );
      }
    }
    return filtered;
  }, [data, query, sort, descending, columns]);
  const pages = Math.max(1, Math.ceil(sorted.length / size));
  const current = Math.min(page, pages);
  const start = (current - 1) * size;
  const rows = sorted.slice(start, start + size);
  const actions = !!(onView || onEdit || onDelete);
  function key(item: T, index: number) {
    if (typeof rowKey === "function") return rowKey(item, index);
    if (rowKey) return String(item[rowKey]);
    const record = item as Record<string, unknown>;
    return String(record._id || record.id || index);
  }
  
  return (
    <section className="ts-panel screeno-record-table overflow-hidden">
      {title && (
        <div className="border-b border-[#e5e9df] px-5 py-4">
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
      )}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block sm:w-80">
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
          <span className="sr-only">Search records</span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded border border-[#e0e5d9] bg-white py-2.5 pl-9 pr-3 text-xs placeholder:text-slate-400"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setControls(!controls)}
            aria-expanded={controls}
            className="inline-flex items-center gap-2 rounded border border-[#e0e5d9] px-3 py-2 text-xs text-slate-600 hover:bg-canvas"
          >
            <SlidersHorizontal size={13} />
            Sort & view
          </button>
          <ExportMenu disabled={!sorted.length||!reportColumns.length} report={{title:title||"Screeno records",subtitle:"All records matching the current search and sort.",columns:reportColumns.map(column=>column.header),rows:sorted.map((item,index)=>reportColumns.map(column=>renderedText(typeof column.accessor==="function"?column.accessor(item,index):item[column.accessor] as ReactNode)))}}/>
        </div>
      </div>
      {controls && (
        <div className="flex flex-wrap items-center gap-3 border-t border-[#e8ebe2] bg-canvas px-4 py-3 text-xs">
          <label>
            Sort by{" "}
            <CustomSelect
              aria-label="Sort column"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="ml-2 rounded border border-[#dde3d5] bg-white p-2"
            >
              <option value="">Original order</option>
              {columns.map((c, index) => (
                <option key={c.header} value={String(index)}>
                  {c.header}
                </option>
              ))}
            </CustomSelect>
          </label>
          <button
            type="button"
            disabled={!sort}
            onClick={() => setDescending(!descending)}
            className="inline-flex items-center gap-1 rounded border border-[#dde3d5] bg-white p-2 disabled:opacity-40"
          >
            <ArrowDownUp size={12} />
            {descending ? "Descending" : "Ascending"}
          </button>
          <label className="ml-auto">
            Rows{" "}
            <CustomSelect
              aria-label="Rows per page"
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
              className="ml-2 rounded border border-[#dde3d5] bg-white p-2"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </CustomSelect>
          </label>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] border-collapse text-left">
          <thead>
            <tr className="bg-ink">
              {columns.map((c) => (
                <th
                  key={c.header}
                  className={`px-5 py-3.5 text-[11px] font-medium text-white ${c.className || ""}`}
                >
                  {c.header}
                </th>
              ))}
              {actions && (
                <th className="px-5 py-3.5 text-right text-[11px] font-medium text-white">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((item, i) => (
                <tr
                  key={key(item, start + i)}
                  data-selected={selectedRowKey === key(item, start + i)}
                  onClick={(event) => { if (onRowSelect && !(event.target as HTMLElement).closest("button,a,input,select")) onRowSelect(item); }}
                  className="border-b border-[#e9ece3] bg-white transition-colors even:bg-[#fafbf8] hover:bg-[#f1f5e9]"
                >
                  {columns.map((c) => (
                    <td
                      key={c.header}
                      className={`px-5 py-4 text-xs font-normal text-slate-600 ${c.className || ""}`}
                    >
                      {onRowSelect && c === columns[0] ? <button type="button" className="screeno-record-name" aria-label={"Select " + renderedText(typeof c.accessor === "function" ? c.accessor(item, start + i) : item[c.accessor] as ReactNode)} aria-pressed={selectedRowKey === key(item, start + i)} onClick={() => onRowSelect(item)}>{typeof c.accessor === "function" ? c.accessor(item,start+i) : item[c.accessor] as ReactNode}</button> : typeof c.accessor === "function"
                        ? c.accessor(item, start + i)
                        : (item[c.accessor] as ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        {onView && (
                          <button
                            aria-label="View record"
                            onClick={() => onView(item)}
                            className="rounded p-2 text-slate-400 hover:bg-brand/5 hover:text-brand"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            aria-label="Edit record"
                            onClick={() => onEdit(item)}
                            className="rounded p-2 text-slate-400 hover:bg-brand/5 hover:text-brand"
                          >
                            <Edit3 size={15} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            aria-label="Delete record"
                            onClick={() => onDelete(item)}
                            className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-16 text-center"
                >
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-md bg-canvas text-slate-400">
                    {emptyState?.icon || <Search size={22} />}
                  </div>
                  <p className="text-sm font-semibold text-ink">
                    {query
                      ? "No matching records"
                      : emptyState?.title || "A fresh start."}
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-500">
                    {query
                      ? "Try a different name, role or keyword."
                      : emptyState?.description ||
                        "Your records will appear here when they are added."}
                  </p>
                  {emptyState?.onAction && emptyState.actionLabel && !query && (
                    <button
                      className="ts-button mt-5"
                      onClick={emptyState.onAction}
                    >
                      {emptyState.actionLabel}
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-[11px] text-slate-500">
        <p aria-live="polite">
          Showing {sorted.length ? start + 1 : 0}–
          {Math.min(start + size, sorted.length)} of {sorted.length} records
        </p>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous page"
            onClick={() => setPage(current - 1)}
            disabled={current === 1}
            className="rounded border border-[#e0e5d9] p-2 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-2">
            {current} / {pages}
          </span>
          <button
            aria-label="Next page"
            onClick={() => setPage(current + 1)}
            disabled={current === pages}
            className="rounded border border-[#e0e5d9] p-2 disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
