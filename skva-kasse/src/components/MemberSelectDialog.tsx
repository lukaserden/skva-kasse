import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Member } from "@/types";
import { useState } from "react";

interface MemberSelectDialogProps {
  open: boolean;
  onClose: () => void;
  members: Member[];
  search: string;
  setSearch: (value: string) => void;
  onSelect: (member: Member) => void;
  onClear: () => void;
  onSelectGuest: (guestName: string) => void;
}

export const MemberSelectDialog: React.FC<MemberSelectDialogProps> = ({
  open,
  onClose,
  members,
  search,
  setSearch,
  onSelect,
  onClear,
  onSelectGuest,
}) => {
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [guestName, setGuestName] = useState("");

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

  const handleGuestConfirm = () => {
    if (guestName.trim() !== "") {
      onSelectGuest(guestName.trim());
      setGuestName("");
      setShowGuestInput(false);
    }
  };

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

        <div className="flex flex-col gap-2 mt-4">
          {!showGuestInput ? (
            <Button variant="outline" onClick={() => setShowGuestInput(true)}>
              Als Gast buchen
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Gastname eingeben"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
              <Button onClick={handleGuestConfirm} disabled={guestName.trim() === ""}>
                Gast übernehmen
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={onClear} className="flex-1">
              Auswahl zurücksetzen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};