import React, { useEffect, useState } from "react";
import api from "@/api";

interface OpenOrdersModalProps {
  onClose: () => void;
}

interface Transaction {
  id: number;
  timestamp: string;
  member_id: number | null;
  table_number: number | null;
  total_amount: number;
  status: string;
}

const OpenOrdersModal: React.FC<OpenOrdersModalProps> = ({ onClose }) => {
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpenOrders = async () => {
      try {
        const response = await api.get("/transactions/open");
        setOrders(response.data);
      } catch (error) {
        console.error("Fehler beim Laden der offenen Bestellungen:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpenOrders();
  }, []);

  const handleMarkAsPaid = async (id: number) => {
    try {
      await api.put(`/transactions/${id}`, { status: "paid" });
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Transaktion", error);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Willst du diese Bestellung wirklich stornieren?")) return;

    try {
      await api.put(`/transactions/${id}`, { status: "canceled" });
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (error) {
      console.error("Fehler beim Stornieren:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Offene Bestellungen</h2>

        {loading ? (
          <p>Lade...</p>
        ) : orders.length === 0 ? (
          <p>Keine offenen Bestellungen</p>
        ) : (
          <ul className="order-list">
            {orders.map((order) => (
              <li key={order.id} style={{ marginBottom: "1rem" }}>
                <strong>#{order.id}</strong> –{" "}
                {order.member_id
                  ? `Mitglied ${order.member_id}`
                  : `Tisch ${order.table_number}`}{" "}
                – {order.total_amount / 100} CHF
                <div
                  style={{
                    marginTop: "0.5rem",
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <button
                    onClick={() => handleMarkAsPaid(order.id)}
                    style={{
                      backgroundColor: "#4CAF50",
                      color: "white",
                      padding: "0.5rem",
                    }}
                  >
                    Als bezahlt markieren
                  </button>
                  <button
                    onClick={() => handleCancel(order.id)}
                    style={{
                      backgroundColor: "#e53935",
                      color: "white",
                      padding: "0.5rem",
                    }}
                  >
                    Stornieren
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button className="modal-cancel-button" onClick={onClose}>
          Schließen
        </button>
      </div>
    </div>
  );
};

export default OpenOrdersModal;