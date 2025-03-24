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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  membership_number: string;
  member_state_id: number;
  email?: string;
  phone?: string;
  discount?: number;
  is_active?: number;
  is_service_required?: number;
}

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
  const [newMember, setNewMember] = useState<Partial<Member>>({
    first_name: "",
    last_name: "",
    birthdate: "",
    membership_number: "",
    member_state_id: 1,
  });

  useEffect(() => {
    api.get("/members").then((res) => setMembers(res.data));
    api.get("/member-states").then((res) => setMemberStates(res.data));
  }, []);

  const handleEdit = (id: number) => {
    console.log("Edit", id);
  };

  const handleDelete = (id: number) => {
    console.log("Delete", id);
  };

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
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await api.post("/members", newMember);
                  const createdId = response.data.member_id;
                  setMembers((prev) => [
                    ...prev,
                    { ...newMember, id: createdId } as Member,
                  ]);
                  setNewMember({
                    first_name: "",
                    last_name: "",
                    birthdate: "",
                    membership_number: "",
                    email: "",
                    phone: "",
                    discount: 0,
                    is_active: 1,
                    is_service_required: 1,
                    member_state_id: 1,
                  });
                  setShowModal(false);
                } catch (error) {
                  console.error("Fehler beim Erstellen des Mitglieds:", error);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="first_name">Vorname</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={newMember.first_name || ""}
                  onChange={(e) =>
                    setNewMember((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Nachname</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={newMember.last_name || ""}
                  onChange={(e) =>
                    setNewMember((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Geburtsdatum</Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  value={newMember.birthdate || ""}
                  onChange={(e) =>
                    setNewMember((prev) => ({
                      ...prev,
                      birthdate: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="membership_number">Mitgliedsnummer</Label>
                <Input
                  id="membership_number"
                  name="membership_number"
                  value={newMember.membership_number || ""}
                  onChange={(e) =>
                    setNewMember((prev) => ({
                      ...prev,
                      membership_number: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail (optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newMember.email || ""}
                  onChange={(e) =>
                    setNewMember((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon (optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newMember.phone || ""}
                  onChange={(e) =>
                    setNewMember((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Rabatt (%)</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  min={0}
                  value={newMember.discount?.toString() || "0"}
                  onChange={(e) =>
                    setNewMember((prev) => ({
                      ...prev,
                      discount: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newMember.member_state_id?.toString() ?? "1"}
                  onValueChange={(value) =>
                    setNewMember((prev) => ({
                      ...prev,
                      member_state_id: Number(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {memberStates.map((state) => (
                      <SelectItem key={state.id} value={state.id.toString()}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={newMember.is_active === 1}
                    onCheckedChange={(value) =>
                      setNewMember((prev) => ({
                        ...prev,
                        is_active: value ? 1 : 0,
                      }))
                    }
                  />
                  <Label htmlFor="is_active">Aktiv</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_service_required"
                    checked={newMember.is_service_required === 1}
                    onCheckedChange={(value) =>
                      setNewMember((prev) => ({
                        ...prev,
                        is_service_required: value ? 1 : 0,
                      }))
                    }
                  />
                  <Label htmlFor="is_service_required">Dienstpflicht</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">Speichern</Button>
              </DialogFooter>
            </form>
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
