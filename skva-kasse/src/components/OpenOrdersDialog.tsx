import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  
  interface OpenOrdersDialogProps {
    open: boolean;
    onClose: () => void;
  }
  
  export const OpenOrdersDialog: React.FC<OpenOrdersDialogProps> = ({
    open,
    onClose,
  }) => {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Offene Bestellungen</DialogTitle>
          </DialogHeader>
  
          {/* Hier kannst du deine offene Bestellliste einbauen */}
          <div className="p-2">
            <p className="text-sm text-muted-foreground mb-2">
              (Beispiel-Inhalt)
            </p>
            <ul className="space-y-2">
              <li className="flex justify-between items-center border p-2 rounded">
                <span>Bestellung #123</span>
                <Button size="sm">Öffnen</Button>
              </li>
              <li className="flex justify-between items-center border p-2 rounded">
                <span>Bestellung #124</span>
                <Button size="sm">Öffnen</Button>
              </li>
            </ul>
          </div>
  
          <Button variant="secondary" onClick={onClose} className="w-full mt-2">
            Schließen
          </Button>
        </DialogContent>
      </Dialog>
    );
  };