// Mitglieder.tsx
import { useEffect, useState } from "react";
import api from "../api";
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
import { UserPlus } from "lucide-react";
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

interface MemberState {
  id: number;
  name: string;
}

export default function Mitglieder() {
  const [members, setMembers] = useState<Member[]>([]);
  const [memberStates, setMemberStates] = useState<MemberState[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get("/members").then((res) => setMembers(res.data));
    api.get("/member-states").then((res) => setMemberStates(res.data));
  }, []);

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

  const handleDelete = (id: number) => {
    api.delete(`/members/${id}`).then(() => {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    });
  };

  const handleEdit = (id: number) => {
    console.log("Edit member with id:", id);
  };

  const handleCreateMember = async (data: NewMember) => {
    const payload = {
      ...data,
      is_active: data.is_active ? 1 : 0,
      is_service_required: data.is_service_required ? 1 : 0,
    };

    try {
      const res = await api.post("/members", payload);
      const createdId = res.data.member_id;
      setMembers((prev) => [
        ...prev,
        {
          ...payload,
          id: createdId,
          created_at: new Date().toISOString(), // oder hole aus res.data wenn möglich
        } as Member,
      ]);
    } catch (error) {
      console.error("Fehler beim Erstellen des Mitglieds:", error);
    }
  };

  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: "membership_number",
      header: "Mitgliedsnummer",
    },
    {
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      id: "name",
      header: "Name",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const member = row.original;
        const state = memberStates.find((s) => s.id === member.member_state_id);
        const label = state?.name ?? "unbekannt";
        return <Badge variant={getBadgeVariant(label)}>{label}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Aktionen",
      cell: ({ row }) => (
        <MemberActionMenu
          onEdit={() => handleEdit(row.original.id)}
          onDelete={() => handleDelete(row.original.id)}
        />
      ),
    },
  ];

  const table = useReactTable({
    data: members,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Mitglieder</h1>
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <Input
          placeholder="Suchen..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-64"
        />
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <UserPlus className="mr-2 h-4 w-4" /> Mitglied hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Mitglied hinzufügen</DialogTitle>
            </DialogHeader>
            <MemberForm
              onSave={handleCreateMember}
              memberStates={memberStates}
              onClose={() => setShowModal(false)}
            />
          </DialogContent>
        </Dialog>
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
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Zeilen" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
