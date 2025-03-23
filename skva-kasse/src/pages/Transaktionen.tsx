// src/pages/Transaktionen.tsx
import React, { useEffect, useState } from "react"
import { ColumnDef, flexRender, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import api from "@/api"

interface Transaction {
  id: number
  timestamp: string
  cashier_name: string
  member_name: string
  table_number: number
  payment_method: string
  total_amount: number
  status: string
}

interface TransactionItem {
  id: number
  product_id: number
  quantity: number
  price: number
  subtotal: number
  status: string
}

export default function Transaktionen() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [expanded, setExpanded] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [itemsMap, setItemsMap] = useState<Record<number, TransactionItem[]>>({})

  useEffect(() => {
    api.get("/transactions").then((res) => {
      setTransactions(res.data)
    })
  }, [])

  const fetchItems = async (transactionId: number) => {
    if (!itemsMap[transactionId]) {
      const res = await api.get(`/transaction-items/by-transaction/${transactionId}`)
      setItemsMap((prev) => ({ ...prev, [transactionId]: res.data }))
    }
  }

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "expander",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            row.toggleExpanded()
            await fetchItems(row.original.id)
          }}
        >
          {row.getIsExpanded() ? "−" : "+"}
        </Button>
      )
    },
    {
      accessorKey: "timestamp",
      header: "Datum / Zeit",
      cell: ({ getValue }) =>
        format(new Date(getValue() as string), "dd.MM.yyyy HH:mm")
    },
    {
      accessorKey: "cashier_name",
      header: "Kassierer"
    },
    {
      accessorKey: "member_name",
      header: "Mitglied"
    },
    {
      accessorKey: "table_number",
      header: "Tisch"
    },
    {
      accessorKey: "payment_method",
      header: "Zahlung"
    },
    {
      accessorKey: "total_amount",
      header: "Betrag (CHF)",
      cell: ({ getValue }) => (getValue() as number / 100).toFixed(2)
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => (
        <Badge variant="outline">{getValue() as string}</Badge>
      )
    }
  ]

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      sorting,
      globalFilter,
      expanded
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel()
  })

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
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <div className="p-4 bg-muted rounded-md">
                        <h4 className="font-medium mb-2">Details</h4>
                        <ul className="space-y-1 text-sm">
                          {itemsMap[row.original.id]?.map((item) => (
                            <li key={item.id}>
                              Produkt-ID: {item.product_id} — Menge: {item.quantity} — Preis:{" "}
                              {(item.price / 100).toFixed(2)} — Subtotal:{" "}
                              {(item.subtotal / 100).toFixed(2)}
                            </li>
                          )) ?? <p>Lade...</p>}
                        </ul>
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
  )
}