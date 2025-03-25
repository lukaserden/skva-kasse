import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { MoreHorizontal, Eye, SquarePen, Trash2 } from "lucide-react";
  import { Button } from "@/components/ui/button";
  
  interface ArtikelActionMenuProps {
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
  }
  
  export function ArtikelActionMenu({
    onView,
    onEdit,
    onDelete,
  }: ArtikelActionMenuProps) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
          <DropdownMenuItem onClick={onView} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" /> Anzeigen
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
            <SquarePen className="mr-2 h-4 w-4" /> Bearbeiten
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            className="cursor-pointer text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  export default ArtikelActionMenu;