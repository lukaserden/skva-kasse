import { useEffect, useState, useCallback } from "react";
import api from "@/api";
import useDebouncedValue from "@/lib/UseDebounceValue";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Artikel {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock?: number | null;
  unit: string;
  category_id: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface ArtikelResponse {
  data: Artikel[];
  total: number;
}

export default function ArtikelListe() {
  const [artikel, setArtikel] = useState<Artikel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const fetchArtikel = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        limit: pageSize.toString(),
        offset: (pageIndex * pageSize).toString(),
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      const res = await api.get<ArtikelResponse>("/products", { params });
      setArtikel(res.data.data);
      setTotalCount(res.data.total);
    } catch (err) {
      console.error("Fehler beim Laden:", err);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchArtikel();
  }, [fetchArtikel]);

  const columns: ColumnDef<Artikel>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Beschreibung",
      cell: ({ getValue }) => getValue() || "Keine Beschreibung",
    },
    {
      accessorKey: "price",
      header: "Preis (CHF)",
      cell: ({ getValue }) =>
        (Number(getValue()) / 100).toLocaleString("de-CH", {
          style: "currency",
          currency: "CHF",
        }),
    },
    {
      accessorKey: "unit",
      header: "Einheit",
    },
    {
      accessorKey: "category_id",
      header: "Kategorie ID",
    },
    {
      accessorKey: "created_at",
      header: "Erstellt am",
      cell: ({ getValue }) =>
        new Intl.DateTimeFormat("de-CH", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(getValue() as string)),
    },
    {
      accessorKey: "is_active",
      header: "Aktiv",
      cell: ({ getValue }) => (getValue() ? "Ja" : "Nein"),
    },
  ];

  const table = useReactTable({
    data: artikel,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex,
        pageSize,
      },
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
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Artikel</h1>
      <p className="text-muted-foreground">
        Verwaltung der Artikel und Produkte.
      </p>

      <Input
        placeholder="Artikel suchen..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPageIndex(0);
        }}
        className="w-64"
      />

      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-muted-foreground">
          Gesamt: {totalCount} Artikel
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
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((_col, j) => (
                    <TableCell key={`skeleton-cell-${j}`}>
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : artikel.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6"
                >
                  Keine Artikel gefunden.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-3 items-center mt-4 gap-4">
        <div className="flex justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Zurück
          </Button>
        </div>

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
                {[5, 10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size === 100 ? "Alle" : size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Weiter <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
