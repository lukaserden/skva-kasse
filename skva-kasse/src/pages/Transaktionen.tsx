// src/pages/Transaktionen.tsx
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
import api from "@/api";

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

  useEffect(() => {
    api.get("/transactions").then((res) => {
      setTransactions(res.data);
    });
  }, []);

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
      header: "Datum / Zeit",
      cell: ({ getValue }) =>
        format(new Date(getValue() as string), "dd.MM.yyyy HH:mm"),
    },
    {
      accessorKey: "cashier_name",
      header: "Kassierer",
    },
    {
      accessorKey: "member_name",
      header: "Mitglied",
    },
    {
      accessorKey: "table_number",
      header: "Tisch",
    },
    {
      accessorKey: "payment_method",
      header: "Zahlung",
    },
    {
      accessorKey: "total_amount",
      header: "Betrag (CHF)",
      cell: ({ getValue }) => ((getValue() as number) / 100).toFixed(2),
    },
    {
      accessorKey: "status",
      header: "Status",
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Transaktionen</h1>
        <Input
          placeholder="Suchen..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-64"
        />
      </div>

      <div className="border rounded-md">
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
            {table.getRowModel().rows.map((row) => (
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Zurück
        </Button>
        <span>
          Seite {table.getState().pagination.pageIndex + 1} von{" "}
          {table.getPageCount()}
        </span>
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
