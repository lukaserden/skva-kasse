import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import api from "@/api";

interface OpenOrder {
  id: number;
  member_name: string | null;
  table_number: number | null;
  total_amount: number;
  created_at: string;
}

interface OpenOrdersDialogProps {
  open: boolean;
  onClose: () => void;
  onLoadOrder: (orderId: number) => void;
}

export const OpenOrdersDialog: React.FC<OpenOrdersDialogProps> = ({
  open,
  onClose,
  onLoadOrder,
}) => {
  const [orders, setOrders] = useState<OpenOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!open) return;
      setLoading(true);
      try {
        const res = await api.get("/transactions?status=open");
        setOrders(res.data.data);
      } catch (error) {
        console.error("Fehler beim Laden der offenen Bestellungen", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Offene Bestellungen</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Lade Bestellungen...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine offenen Bestellungen
          </p>
        ) : (
          <div className="flex-1 overflow-auto">
            <ul className="space-y-2">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="flex justify-between items-center border p-2 rounded gap-2"
                >
                  <div>
                    <p className="font-medium">
                      #{o.id} –{" "}
                      {o.member_name
                        ? o.member_name
                        : `Tisch ${o.table_number ?? "?"}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CHF {(o.total_amount / 100).toFixed(2)} –{" "}
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button size="sm" onClick={() => onLoadOrder(o.id)}>
                      Laden
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (
                          !window.confirm("Bestellung wirklich abschliessen?")
                        )
                          return;
                        try {
                          await api.put(`/transactions/${o.id}/status`, {
                            status: "completed",
                          });
                          onClose();
                        } catch (error) {
                          console.error("Fehler beim Abschliessen:", error);
                        }
                      }}
                    >
                      Abschliessen
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button variant="secondary" onClick={onClose} className="w-full mt-2">
          Schliessen
        </Button>
      </DialogContent>
    </Dialog>
  );
};
