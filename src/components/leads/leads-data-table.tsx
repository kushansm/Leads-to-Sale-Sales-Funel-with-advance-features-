"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { LeadStatusBadge, LeadTemperatureBadge } from "@/components/shared/lead-badges";
import { LeadFormDialog } from "./lead-form-dialog";
import { DeleteLeadDialog } from "./delete-lead-dialog";
import type { Lead } from "@/actions/leads";

const STATUSES = [
  { value: "all",           label: "All Statuses" },
  { value: "new",           label: "New" },
  { value: "contacting",    label: "Contacting" },
  { value: "interested",    label: "Interested" },
  { value: "evaluating",    label: "Evaluating" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiation",   label: "Negotiation" },
  { value: "won",           label: "Won" },
  { value: "lost",          label: "Lost" },
  { value: "dormant",       label: "Dormant" },
];

const TEMPERATURES = [
  { value: "all",  label: "All Temps" },
  { value: "hot",  label: "🔥 Hot" },
  { value: "warm", label: "☀️ Warm" },
  { value: "cold", label: "❄️ Cold" },
];

type Props = {
  leads: Lead[];
  organizationId: string;
};

export function LeadsDataTable({ leads, organizationId }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tempFilter, setTempFilter] = useState("all");

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null);

  // Apply external filters (status / temperature) on top of the data
  const filteredData = useMemo(() => {
    return leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (tempFilter !== "all" && lead.temperature !== tempFilter) return false;
      return true;
    });
  }, [leads, statusFilter, tempFilter]);

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableHeader column={column} label="Name" />
        ),
        cell: ({ row }) => {
          const isActive = !["won", "lost", "unqualified"].includes(row.original.status);
          const needsFollowUp = isActive && !row.original.nextActionDate;
          
          return (
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{row.original.name}</p>
                {needsFollowUp && (
                  <div title="No Follow-Up Scheduled">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  </div>
                )}
              </div>
              {row.original.company && (
                <p className="text-xs text-muted-foreground">{row.original.company}</p>
              )}
              {row.original.nextActionDate && isActive && (
                <p className="text-xs text-blue-600 mt-0.5 font-medium">
                  Next: {new Date(row.original.nextActionDate).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => (
          <div className="min-w-[160px]">
            {row.original.email && (
              <p className="text-sm truncate max-w-[200px]">{row.original.email}</p>
            )}
            {row.original.phone && (
              <p className="text-xs text-muted-foreground">{row.original.phone}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.location ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column} label="Status" />
        ),
        cell: ({ row }) => <LeadStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "temperature",
        header: "Temp",
        cell: ({ row }) => <LeadTemperatureBadge temperature={row.original.temperature} />,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <SortableHeader column={column} label="Created" />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditLead(row.original)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteLead(row.original)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } },
    globalFilterFn: (row, _, filterValue) => {
      const search = filterValue.toLowerCase();
      return (
        row.original.name.toLowerCase().includes(search) ||
        row.original.email?.toLowerCase().includes(search) ||
        row.original.company?.toLowerCase().includes(search) ||
        row.original.location?.toLowerCase().includes(search) ||
        false
      );
    },
  });

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="leads-search"
            placeholder="Search leads…"
            className="pl-9"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="filter-status" className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Temperature filter */}
          <Select value={tempFilter} onValueChange={setTempFilter}>
            <SelectTrigger id="filter-temp" className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPERATURES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Active filter badges */}
          {(statusFilter !== "all" || tempFilter !== "all" || globalFilter) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                setStatusFilter("all");
                setTempFilter("all");
                setGlobalFilter("");
              }}
            >
              Clear filters
            </Button>
          )}

          {/* Add lead */}
          <Button id="add-lead-btn" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="flex gap-3 flex-wrap text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">{filteredData.length}</strong> leads
        </span>
        {table.getRowModel().rows.length !== filteredData.length && (
          <span>
            (showing <strong className="text-foreground">{table.getRowModel().rows.length}</strong> after search)
          </span>
        )}
      </div>

      {/* ── Table (scrollable on mobile) ── */}
      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/30 hover:bg-muted/30">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="whitespace-nowrap">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="group">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-16 text-muted-foreground">
                  {globalFilter || statusFilter !== "all" || tempFilter !== "all"
                    ? "No leads match your filters."
                    : "No leads yet. Click “Add Lead” to create your first one."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger id="page-size-select" className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {Math.max(1, table.getPageCount())}
          </span>
          <div className="flex gap-1">
            <Button
              id="prev-page-btn"
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              ← Previous
            </Button>
            <Button
              id="next-page-btn"
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next →
            </Button>
          </div>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <LeadFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        organizationId={organizationId}
      />
      {editLead && (
        <LeadFormDialog
          open={!!editLead}
          onOpenChange={(o) => !o && setEditLead(null)}
          organizationId={organizationId}
          lead={editLead}
        />
      )}
      {deleteLead && (
        <DeleteLeadDialog
          open={!!deleteLead}
          onOpenChange={(o) => !o && setDeleteLead(null)}
          organizationId={organizationId}
          leadId={deleteLead.id}
          leadName={deleteLead.name}
        />
      )}
    </div>
  );
}

// ── Sortable header helper ─────────────────────────────────────────────────────
function SortableHeader({ column, label }: { column: any; label: string }) {
  const sorted = column.getIsSorted();
  return (
    <button
      className="flex items-center gap-1.5 group select-none"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? (
        <ChevronUp className="h-3.5 w-3.5 text-foreground" />
      ) : sorted === "desc" ? (
        <ChevronDown className="h-3.5 w-3.5 text-foreground" />
      ) : (
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-muted-foreground" />
      )}
    </button>
  );
}
