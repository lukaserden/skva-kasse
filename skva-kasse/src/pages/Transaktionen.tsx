// src/pages/Transaktionen.tsx
import React, { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

export default function Transaktionen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    api.get("/transactions").then((res) => {
      setTransactions(res.data);
    });
  }, []);

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "timestamp",
      header: "Datum / Zeit",
      cell: ({ getValue }) => format(new Date(getValue() as string), "dd.MM.yyyy HH:mm"),
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
      cell: ({ getValue }) => `${(getValue() as number / 100).toFixed(2)}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => <Badge variant="outline">{getValue() as string}</Badge>,
    },
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

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
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}