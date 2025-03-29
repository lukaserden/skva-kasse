import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TableSelectDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (tableNumber: number) => void;
  onClear: () => void;
}

export const TableSelectDialog: React.FC<TableSelectDialogProps> = ({
  open,
  onClose,
  onSelect,
  onClear,
}) => {
  const maxDefaultTables = 5;
  const [customTable, setCustomTable] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Tischnummer wählen</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 mb-4">
          {[...Array(maxDefaultTables)].map((_, index) => {
            const num = index + 1;
            return (
              <Button
                key={num}
                onClick={() => {
                  onSelect(num);
                  setCustomTable("");
                }}
                className="flex-1"
              >
                Tisch {num}
              </Button>
            );
          })}
        </div>

        <Input
          type="number"
          placeholder="Andere Tischnummer"
          value={customTable}
          onChange={(e) => setCustomTable(e.target.value)}
        />
        <Button
          className="w-full mt-2"
          variant="outline"
          onClick={() => {
            const parsed = parseInt(customTable);
            if (!isNaN(parsed)) {
              onSelect(parsed);
              setCustomTable("");
            }
          }}
        >
          Tisch übernehmen
        </Button>

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