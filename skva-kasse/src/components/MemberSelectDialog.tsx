import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Member } from "@/types";

interface MemberSelectDialogProps {
  open: boolean;
  onClose: () => void;
  members: Member[];
  search: string;
  setSearch: (value: string) => void;
  onSelect: (member: Member) => void;
  onClear: () => void;
}

export const MemberSelectDialog: React.FC<MemberSelectDialogProps> = ({
  open,
  onClose,
  members,
  search,
  setSearch,
  onSelect,
  onClear,
}) => {
  const groupedMembers: Record<string, Member[]> = {};

  members
    .filter((m) =>
      `${m.first_name} ${m.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .forEach((m) => {
      const letter = m.first_name.charAt(0).toUpperCase();
      if (!groupedMembers[letter]) groupedMembers[letter] = [];
      groupedMembers[letter].push(m);
    });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mitglied auswählen</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Mitglied suchen"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ul className="border-t border-b divide-y max-h-64 overflow-auto">
          {Object.keys(groupedMembers)
            .sort()
            .map((letter) => (
              <li key={letter}>
                <div className="px-2 py-1 text-sm font-semibold bg-gray-100">
                  {letter}
                </div>
                <ul>
                  {groupedMembers[letter].map((m) => (
                    <li key={m.id}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => onSelect(m)}
                      >
                        {m.first_name} {m.last_name}
                      </Button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
        </ul>

        <div className="flex gap-2 mt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Abbrechen
          </Button>
          <Button variant="destructive" onClick={onClear} className="flex-1">
            Auswahl zurücksetzen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
