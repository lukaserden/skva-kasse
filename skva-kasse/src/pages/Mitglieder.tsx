import { useEffect, useState, useCallback } from "react";
import api from "../api";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
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
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  UserPlus,
} from "lucide-react";
import MemberActionMenu from "@/components/MemberActionMenu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MemberForm from "@/components/MemberForm";
import { Member, NewMember } from "@/types";
import { toast } from "sonner";
import useDebouncedValue from "@/lib/UseDebounceValue";

interface MemberState {
  id: number;
  name: string;
}

export default function Mitglieder() {
  const [members, setMembers] = useState<Member[]>([]);
  const [memberStates, setMemberStates] = useState<MemberState[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300); // <- Debounce
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMember, setViewMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        limit: pageSize.toString(),
        offset: (pageIndex * pageSize).toString(),
      };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      const res = await api.get("/members", { params });
      setMembers(res.data.data);
      setTotalCount(res.data.total);
    } catch (error) {
      console.error("Fehler beim Abrufen der Mitglieder:", error);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchMembers();
    api.get("/member-states").then((res) => setMemberStates(res.data));
  }, [fetchMembers]);

  const handleCreateMember = async (data: NewMember) => {
    const payload = {
      ...data,
      is_active: data.is_active ? 1 : 0,
      is_service_required: data.is_service_required ? 1 : 0,
    };
    try {
      await api.post("/members", payload);
      await fetchMembers();
      setShowModal(false);
      toast.success("Mitglied erfolgreich erstellt");
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
      toast.error("Fehler beim Erstellen des Mitglieds");
    }
  };

  const handleUpdateMember = async (data: Member) => {
    try {
      const payload = {
        ...data,
        is_active: data.is_active ? 1 : 0,
        is_service_required: data.is_service_required ? 1 : 0,
      };
      await api.put(`/members/${data.id}`, payload);
      await fetchMembers();
      setEditMember(null);
      setShowModal(false);
      toast.success("Mitglied erfolgreich aktualisiert");
    } catch (error) {
      console.error("Fehler beim Aktualisieren:", error);
      toast.error("Fehler beim Bearbeiten des Mitglieds");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/members/${id}`);
      await fetchMembers();
      toast.success("Mitglied erfolgreich gelöscht");
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      toast.error("Fehler beim Löschen des Mitglieds");
    }
  };

  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: "membership_number",
      header: () => "Mitgliedsnummer",
    },
    {
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      id: "name",
      header: () => "Name",
    },
    {
      id: "status",
      header: () => "Status",
      cell: ({ row }) => {
        const member = row.original;
        const state = memberStates.find((s) => s.id === member.member_state_id);
        const label = state?.name ?? "unbekannt";
        return <Badge variant={getBadgeVariant(label)}>{label}</Badge>;
      },
    },
    {
      id: "actions",
      header: () => "Aktionen",
      cell: ({ row }) => (
        <MemberActionMenu
          onView={() => setViewMember(row.original)}
          onEdit={() => {
            setEditMember(row.original);
            setShowModal(true);
          }}
          onDelete={() => handleDelete(row.original.id)}
        />
      ),
    },
  ];

  const table = useReactTable({
    data: members,
    columns,
    state: {
      sorting,
      pagination: { pageIndex, pageSize },
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
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
  });

  const getBadgeVariant = (state: string) => {
    switch (state.toLowerCase()) {
      case "aktiv":
        return "default";
      case "passiv":
        return "secondary";
      case "ehrenmitglied":
        return "outline";
      case "gesperrt":
        return "destructive";
      case "inaktiv":
        return "ghost";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Mitglieder</h1>
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <Input
          placeholder="Suchen..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPageIndex(0);
          }}
          className="w-64"
        />
        <Dialog
          open={showModal || !!editMember}
          onOpenChange={(open) => {
            setShowModal(open);
            if (!open) setEditMember(null);
          }}
        >
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <UserPlus className="mr-2 h-4 w-4" /> Mitglied hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editMember
                  ? "Mitglied bearbeiten"
                  : "Neues Mitglied hinzufügen"}
              </DialogTitle>
            </DialogHeader>
            <MemberForm
              onSave={(data) =>
                "id" in data
                  ? handleUpdateMember(data)
                  : handleCreateMember(data)
              }
              memberStates={memberStates}
              onClose={() => {
                setShowModal(false);
                setEditMember(null);
              }}
              initialData={editMember || undefined}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-muted-foreground">
          Gesamt: {totalCount} Mitglieder
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
                  {columns.map((_, j) => (
                    <TableCell key={`skeleton-cell-${j}`}>
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6"
                >
                  Keine Mitglieder gefunden.
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
                {[5, 10, 20, 50, totalCount].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size === totalCount ? "Alle" : size}
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

      <Dialog open={!!viewMember} onOpenChange={() => setViewMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mitglied anzeigen</DialogTitle>
          </DialogHeader>
          {viewMember && (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {viewMember.first_name}{" "}
                {viewMember.last_name}
              </p>
              <p>
                <strong>Geburtsdatum:</strong>{" "}
                {new Date(viewMember.birthdate).toLocaleDateString("de-CH")}
              </p>
              <p>
                <strong>Email:</strong> {viewMember.email || "-"}
              </p>
              <p>
                <strong>Telefon:</strong> {viewMember.phone || "-"}
              </p>
              <p>
                <strong>Mitgliedsnummer:</strong> {viewMember.membership_number}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {memberStates.find((s) => s.id === viewMember.member_state_id)
                  ?.name || "unbekannt"}
              </p>
              <p>
                <strong>Rabatt:</strong> {viewMember.discount ?? 0}%
              </p>
              <p>
                <strong>Aktiv:</strong> {viewMember.is_active ? "Ja" : "Nein"}
              </p>
              <p>
                <strong>Dienstpflicht:</strong>{" "}
                {viewMember.is_service_required ? "Ja" : "Nein"}
              </p>
              <p>
                <strong>Erstellt am:</strong>{" "}
                {new Date(viewMember.created_at).toLocaleString("de-CH")}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
