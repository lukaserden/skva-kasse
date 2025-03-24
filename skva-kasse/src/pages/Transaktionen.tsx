import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp, FileDown } from "lucide-react";
import api from "@/api";

import DateRangeFilter from "@/components/DateRangeFilter";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Transaction {
  id: number;
  timestamp: string;
  cashier_name: string;
  member_name: string;
  table_number: number;
  payment_method: string;
  total_amount: number;
  status: string;
}

interface TransactionItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  status: string;
}

export default function Transaktionen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expanded, setExpanded] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [itemsMap, setItemsMap] = useState<Record<number, TransactionItem[]>>(
    {}
  );
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      const params: Record<string, string> = {};
      if (dateRange.from) params.from = dateRange.from.toISOString();
      if (dateRange.to) params.to = dateRange.to.toISOString();
      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }
  
      const res = await api.get("/transactions", { params });
      setTransactions(res.data);
    };
  
    fetchTransactions();
  }, [dateRange, statusFilter]);

  const fetchItems = async (transactionId: number) => {
    if (!itemsMap[transactionId]) {
      const res = await api.get(
        `/transaction-items/by-transaction/${transactionId}`
      );
      setItemsMap((prev) => ({ ...prev, [transactionId]: res.data }));
    }
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "expander",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            row.toggleExpanded();
            await fetchItems(row.original.id);
          }}
        >
          {row.getIsExpanded() ? "−" : "+"}
        </Button>
      ),
    },
    {
      accessorKey: "timestamp",
      header: () => "Datum / Zeit",
      cell: ({ getValue }) =>
        format(new Date(getValue() as string), "dd.MM.yyyy HH:mm"),
    },
    {
      accessorKey: "cashier_name",
      header: () => "Kassierer",
    },
    {
      accessorKey: "member_name",
      header: () => "Mitglied",
    },
    {
      accessorKey: "table_number",
      header: () => "Tisch",
    },
    {
      accessorKey: "payment_method",
      header: () => "Zahlung",
    },
    {
      accessorKey: "total_amount",
      header: () => "Betrag (CHF)",
      cell: ({ getValue }) => ((getValue() as number) / 100).toFixed(2),
    },
    {
      accessorKey: "status",
      header: () => "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <Badge variant={getBadgeVariant(status)}>
            {translateStatus(status)}
          </Badge>
        );
      },
    },
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      sorting,
      globalFilter,
      expanded,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  function getBadgeVariant(
    status: string
  ): "default" | "secondary" | "destructive" | "outline" | "ghost" {
    switch (status) {
      case "paid":
        return "default";
      case "canceled":
        return "destructive";
      case "open":
        return "secondary";
      default:
        return "ghost";
    }
  }

  function translateStatus(status: string): string {
    switch (status) {
      case "open":
        return "Offen";
      case "paid":
        return "Bezahlt";
      case "canceled":
        return "Storniert";
      default:
        return "kein Status";
    }
  }

  function getItemBadgeVariant(
    status: string
  ): "default" | "secondary" | "destructive" | "outline" | "ghost" {
    switch (status) {
      case "confirmed":
        return "default";
      case "modified":
        return "secondary";
      case "new":
        return "outline";
      case "canceled":
      case "refunded":
        return "destructive";
      default:
        return "ghost";
    }
  }

  function translateItemStatus(status: string): string {
    switch (status) {
      case "new":
        return "Neu";
      case "modified":
        return "Geändert";
      case "confirmed":
        return "Bestätigt";
      case "canceled":
        return "Storniert";
      case "refunded":
        return "Erstattet";
      default:
        return "Unbekannt";
    }
  }

  function exportCSV() {
    const headers = [
      "Datum/Zeit",
      "Kassierer",
      "Mitglied",
      "Tisch",
      "Zahlung",
      "Betrag (CHF)",
      "Status",
    ];
    const rows = transactions.map((t) => [
      format(new Date(t.timestamp), "dd.MM.yyyy HH:mm"),
      t.cashier_name,
      t.member_name,
      t.table_number,
      t.payment_method,
      (t.total_amount / 100).toFixed(2),
      translateStatus(t.status),
    ]);
    const csv = [headers, ...rows].map((r) => r.join("; ")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transaktionen.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Transaktionen</h1>
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <Input
          placeholder="Suchen..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-64"
        />

        <div className="flex items-center gap-2">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>

        <Select
  onValueChange={(value) => setStatusFilter(value)}
  value={statusFilter}
>
  <SelectTrigger className="w-[160px]">
    <SelectValue placeholder="Status filtern" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Alle</SelectItem>
    <SelectItem value="open">Offen</SelectItem>
    <SelectItem value="paid">Bezahlt</SelectItem>
    <SelectItem value="canceled">Storniert</SelectItem>
  </SelectContent>
</Select>

        <Button variant="outline" size="sm" onClick={() => exportCSV()}>
          <FileDown />
          Export CSV
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: <ArrowUp className="inline-block ml-1 h-3 w-3" />,
                      desc: <ArrowDown className="inline-block ml-1 h-3 w-3" />,
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        <div className="p-4 bg-muted rounded-md">
                          <h4 className="font-medium mb-2">Details</h4>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-muted-foreground">
                                <th className="py-1 pr-4">Produkt</th>
                                <th className="py-1 pr-4">Menge</th>
                                <th className="py-1 pr-4">Preis (CHF)</th>
                                <th className="py-1 pr-4">Subtotal (CHF)</th>
                                <th className="py-1 pr-4">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(itemsMap[row.original.id] ?? []).map((item) => (
                                <tr
                                  key={item.id}
                                  className="border-t border-muted"
                                >
                                  <td className="py-1 pr-4">
                                    {item.product_name}
                                  </td>
                                  <td className="py-1 pr-4">{item.quantity}</td>
                                  <td className="py-1 pr-4">
                                    {(item.price / 100).toFixed(2)}
                                  </td>
                                  <td className="py-1 pr-4">
                                    {(item.subtotal / 100).toFixed(2)}
                                  </td>
                                  <td className="py-1 pr-4">
                                    <Badge
                                      variant={getItemBadgeVariant(item.status)}
                                    >
                                      {translateItemStatus(item.status)}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                              {!itemsMap[row.original.id] && (
                                <tr>
                                  <td
                                    colSpan={5}
                                    className="py-2 italic text-muted-foreground"
                                  >
                                    Lade...
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6"
                >
                  Keine Transaktionen gefunden im gewählten Zeitraum.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Zurück
        </Button>
        <span>
          Seite{" "}
          {table.getPageCount() === 0
            ? 0
            : table.getState().pagination.pageIndex + 1}{" "}
          von {table.getPageCount()}
        </span>
        <div className="flex items-center gap-2">
          <span>Zeilen pro Seite:</span>
          <select
            className="border rounded px-2 py-1"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Weiter
        </Button>
      </div>
    </div>
  );
}
