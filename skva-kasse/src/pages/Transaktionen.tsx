import React, { useEffect, useState, useCallback } from "react";
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
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  FileDown,
} from "lucide-react";
import api from "@/api";
import DateRangeFilter from "@/components/DateRangeFilter";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import DelayedSkeleton from "@/components/DelayedSkeleton";
import useDebounceValue from "@/lib/UseDebounceValue";

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
  const [totalCount, setTotalCount] = useState(0);
  const [expanded, setExpanded] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const debouncedFilter = useDebounceValue(globalFilter, 400);
  const [itemsMap, setItemsMap] = useState<Record<number, TransactionItem[]>>({});
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [statusFilter, setStatusFilter] = useState("");

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const setLoading = useState(true)[1];

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {
      limit: pageSize.toString(),
      offset: (pageIndex * pageSize).toString(),
    };

    if (dateRange.from) params.from = dateRange.from.toISOString();
    if (dateRange.to) params.to = dateRange.to.toISOString();
    if (statusFilter && statusFilter !== "all") params.status = statusFilter;
    if (debouncedFilter) params.search = debouncedFilter;

    try {
      const res = await api.get("/transactions", { params });
      setTransactions(res.data.data);
      setTotalCount(res.data.total);
    } catch (err) {
      console.error("Fehler beim Abrufen der Transaktionen:", err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, pageSize, pageIndex, dateRange.from, dateRange.to, statusFilter, debouncedFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const fetchItems = async (transactionId: number) => {
    if (!itemsMap[transactionId]) {
      // künstlicher Delay für Skeleton
      //await new Promise((resolve) => setTimeout(resolve, 1120));

      const res = await api.get(
        `/transaction-items/by-transaction/${transactionId}`
      );
      setItemsMap((prev) => ({ ...prev, [transactionId]: res.data }));
    }
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "expander",
      header: () => (
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            const areAnyExpanded = Object.values(expanded).some((v) => v);
            if (areAnyExpanded) {
              setExpanded({});
            } else {
              const newExpanded: Record<string, boolean> = {};
              const fetchAll: Promise<void>[] = [];

              for (const row of table.getRowModel().rows) {
                newExpanded[row.id] = true;
                fetchAll.push(fetchItems(row.original.id)); // <--- lade Items!
              }

              setExpanded(newExpanded);
              await Promise.all(fetchAll); // warte auf alle
            }
          }}
        >
          {Object.values(expanded).some((v) => v) ? "−" : "+"}
        </Button>
      ),
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
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
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

  async function exportCSV() {
    // 1. Stelle sicher, dass alle Items geladen sind
    const missingTransactionIds = transactions
      .map((t) => t.id)
      .filter((id) => !itemsMap[id]);

    if (missingTransactionIds.length > 0) {
      const itemRequests = missingTransactionIds.map((id) =>
        api.get(`/transaction-items/by-transaction/${id}`)
      );

      const responses = await Promise.all(itemRequests);
      const newItems: Record<number, TransactionItem[]> = {};
      responses.forEach((res, index) => {
        newItems[missingTransactionIds[index]] = res.data;
      });

      // Items in den aktuellen State einfügen
      setItemsMap((prev) => ({ ...prev, ...newItems }));

      // Weiter nach dem Update, mit neuem itemsMap arbeiten
      generateAndDownloadCSV({ ...itemsMap, ...newItems });
    } else {
      generateAndDownloadCSV(itemsMap);
    }
  }

  function generateAndDownloadCSV(
    fullItemsMap: Record<number, TransactionItem[]>
  ) {
    const headers = [
      "Datum/Zeit",
      "Kassierer",
      "Mitglied",
      "Tisch",
      "Zahlung",
      "Betrag (CHF)",
      "Status",
      "Produkte",
      "Menge",
      "Preis",
      "Subtotal",
      "Status",
    ];

    const rows: string[][] = [headers];

    transactions.forEach((t) => {
      rows.push([
        format(new Date(t.timestamp), "dd.MM.yyyy HH:mm"),
        t.cashier_name,
        t.member_name,
        t.table_number !== null ? t.table_number.toString() : "",
        t.payment_method,
        (t.total_amount / 100).toFixed(2),
        translateStatus(t.status),
        "",
        "",
        "",
        "",
        "",
      ]);

      const items = fullItemsMap[t.id];
      if (items?.length) {
        items.forEach((item) => {
          rows.push([
            "",
            "",
            "",
            "",
            "",
            "",
            "", // leer lassen für Transaktionszeile
            item.product_name,
            item.quantity.toString(),
            (item.price / 100).toFixed(2),
            (item.subtotal / 100).toFixed(2),
            translateItemStatus(item.status),
          ]);
        });
      }
    });

    const csv = rows.map((r) => r.join("\t")).join("\n");
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Input
            placeholder="Suchen..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-64"
          />
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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

          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="h-9"
          >
            <FileDown className="mr-2 h-6 w-6" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-muted-foreground">
          Gesamt: {totalCount} Transaktionen
        </p>
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
                                <DelayedSkeleton delay={150}>
                                  <tr>
                                    <td colSpan={5} className="py-2">
                                      <div className="space-y-2">
                                        <Skeleton className="h-4 w-full bg-slate-300" />
                                        <Skeleton className="h-4 w-full bg-slate-300" />
                                        <Skeleton className="h-4 w-full bg-slate-300" />
                                      </div>
                                    </td>
                                  </tr>
                                </DelayedSkeleton>
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
      <div className="grid grid-cols-1 md:grid-cols-3 items-center mt-4 gap-4">
        {/* Zurück-Button */}
        <div className="flex justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Zurück
          </Button>
        </div>

        {/* Seite x von y & Zeilen pro Seite */}
        <div className="flex flex-col items-center text-sm">
          <span>
            Seite{" "}
            {table.getPageCount() === 0
              ? 0
              : table.getState().pagination.pageIndex + 1}{" "}
            von {table.getPageCount()}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span>Zeilen pro Seite:</span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Zeilen" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50, totalCount].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size === totalCount ? "Alle" : size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Weiter-Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Weiter
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
