import React, { useState, useRef, useEffect } from "react";
import ArticleTabs from "../components/ArticleTabs";
import { Delete as DeleteIcon } from "lucide-react";
import api from "../api"; // Axios-Instanz
import { Button } from "@/components/ui/button";
import { MemberSelectDialog } from "@/components/MemberSelectDialog";
import { TableSelectDialog } from "@/components/TableSelectDialog";
import { OpenOrdersDialog } from "@/components/OpenOrdersDialog";
import { Member } from "../types";

// Artikel-Interface
interface Artikel {
  id: number;
  name: string;
  category_id: number;
  price: number;
}

// Bestellobjekt mit Menge und Preis
interface OrderItem {
  artikel: Artikel;
  quantity: number;
  price: number;
}

const Kasse: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const orderDetailsRef = useRef<HTMLDivElement>(null);

  // Mitglieder-Modal
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(
    null
  );

  // Mitglieder laden
  const [members, setMembers] = useState<Member[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  // Tisch-Modal
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);
  // const [customTableInput, setCustomTableInput] = useState("");
  // const maxDefaultTables = 6;

  // Offene Bestellungen-Modal
  const [showOpenOrdersModal, setShowOpenOrdersModal] = useState(false);

  // Artikel zur Bestellung hinzufügen
  const addToOrder = (item: Artikel) => {
    const price = item.price / 100; // 💰 Cent → Franken

    setOrders((prevOrders) => {
      const existing = prevOrders.find((o) => o.artikel.id === item.id);

      if (existing) {
        return prevOrders.map((o) =>
          o.artikel.id === item.id ? { ...o, quantity: o.quantity + 1 } : o
        );
      }

      return [...prevOrders, { artikel: item, quantity: 1, price }];
    });
  };

  // Menge eines Artikels in der Bestellung anpassen
  const updateQuantity = (artikelId: number, delta: number) => {
    setOrders((prevOrders) =>
      prevOrders
        .map((o) =>
          o.artikel.id === artikelId
            ? { ...o, quantity: o.quantity + delta }
            : o
        )
        .filter((o) => o.quantity > 0)
    );
  };

  // Bestellung entfernen
  const removeOrder = (artikelId: number) => {
    setOrders((prevOrders) =>
      prevOrders.filter((o) => o.artikel.id !== artikelId)
    );
  };

  // Auto-Scroll nach unten bei neuer Bestellung
  useEffect(() => {
    if (orderDetailsRef.current) {
      orderDetailsRef.current.scrollTop = orderDetailsRef.current.scrollHeight;
    }
  }, [orders]);

  // Bestellung abschliessen -> Post-Request an API senden
  const handleCompleteOrder = async () => {
    if (orders.length === 0) {
      alert("Keine Bestellungen vorhanden");
      return;
    }

    if (!selectedMemberId && !selectedTable) {
      alert("Bitte wähle ein Mitglied oder einen Tisch aus.");
      return;
    }

    if (selectedMemberId && selectedTable) {
      alert("Es darf nur ein Tisch ODER ein Mitglied ausgewählt sein.");
      return;
    }

    if (!window.confirm("Möchtest du die Bestellung wirklich abschließen?")) {
      return;
    }

    // ✨ Transaktion vorbereiten
    const payload = {
      member_id: selectedMemberId ?? null,
      table_number: selectedTable ?? null,
      payment_method: "cash",
      status: "open",
      total_amount: Math.round(
        orders.reduce((sum, o) => sum + o.quantity * o.price, 0) * 100
      ), // wieder in Rappen umrechnen
      items: orders.map((o) => ({
        product_id: o.artikel.id,
        quantity: o.quantity,
        price: Math.round(o.price * 100),
      })),
    };

    try {
      const response = await api.post("/transactions", payload);

      console.log("Transaktion erfolgreich gespeichert:", response.data.data);

      // 🧹 Reset
      setOrders([]);
      setSelectedMemberId(null);
      setSelectedMemberName(null);
      setSelectedTable(null);
      alert("Bestellung gespeichert ✅");
    } catch (error: unknown) {
      console.error("Fehler beim Speichern:", error);
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Ein Fehler ist aufgetreten";
      alert("Fehler: " + errorMessage);
    }
  };

  const total = orders.reduce((sum, o) => sum + o.quantity * o.price, 0);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get("/members");
        setMembers(response.data.data);
      } catch (error) {
        console.error("Fehler beim Laden der Mitglieder:", error);
      }
    };

    fetchMembers();
  }, []);

  const filtered = members.filter((m) =>
    `${m.first_name} ${m.last_name}`
      .toLowerCase()
      .includes(memberSearch.toLowerCase())
  );

  const groupedMembers: Record<string, Member[]> = {};

  filtered.forEach((m) => {
    const name = `${m.first_name} ${m.last_name}`;
    const letter = name.charAt(0).toUpperCase();

    if (!groupedMembers[letter]) {
      groupedMembers[letter] = [];
    }

    groupedMembers[letter].push(m);
  });

  const handleLoadOrder = async (orderId: number) => {
    try {
      const res = await api.get(`/transactions/${orderId}`);
      const transaction = res.data.data;

      const loadedOrders = transaction.items.map(
        (item: {
          product_id: number;
          product_name: string;
          category_id: number;
          price: number;
          quantity: number;
        }) => ({
          artikel: {
            id: item.product_id,
            name: item.product_name, // sollte das Backend mitliefern
            category_id: item.category_id,
            price: item.price,
          },
          quantity: item.quantity,
          price: item.price / 100,
        })
      );

      setOrders(loadedOrders);
      setSelectedMemberId(transaction.member_id);
      setSelectedTable(transaction.table_number);
      setShowOpenOrdersModal(false);
    } catch (error) {
      console.error("Fehler beim Laden der Bestellung:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-gray-900 text-white p-4">
        <h1 className="text-xl font-semibold">Kassen-System</h1>
        <ul className="flex gap-4">
          <li>
            <a href="/admin">Einstellungen</a>
          </li>
          <li>
            <a href="#">Logout</a>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 bg-black">
        {/* Linkes Panel */}
        <div className="flex flex-col w-[40%] h-full bg-muted p-2">
          {/* Header: Member- und Tischauswahl */}
          <div className="flex justify-around items-center bg-red-300 p-2 rounded-md mb-2">
            <Button variant="secondary">User Aktionen</Button>
            <Button onClick={() => setShowMemberModal(true)}>
              {selectedMemberName
                ? `Mitglied: ${selectedMemberName}`
                : "Mitglied auswählen"}
            </Button>
            <Button onClick={() => setShowTableModal(true)}>
              {selectedTable ? `Tisch: ${selectedTable}` : "Tisch auswählen"}
            </Button>
          </div>

          {/* Bestell-Liste */}
          <div className="max-h-[85vh] flex flex-col flex-1 overflow-hidden border rounded-md bg-white">
            <div className="p-2 border-b text-sm font-semibold bg-gray-100">
              Bestellung
            </div>
            <div ref={orderDetailsRef} className="flex-1 overflow-auto p-2">
              {orders.length === 0 ? (
                <p className="text-muted-foreground">Keine Bestellungen</p>
              ) : (
                <table className="w-full text-sm ">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Produkt</th>
                      <th className="text-center">Menge</th>
                      <th className="text-right">Preis</th>
                      <th className="text-right">Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={index} className="border-b last:border-none ">
                        <td className="p-2">{order.artikel.name}</td>
                        <td className="p-2">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(order.artikel.id, -1)
                              }
                            >
                              -
                            </Button>
                            <span>{order.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(order.artikel.id, 1)
                              }
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td className="text-right p-2">
                          {order.price.toFixed(2)}
                        </td>
                        <td className="text-right p-2">
                          {(order.price * order.quantity).toFixed(2)}
                        </td>
                        <td className="p-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeOrder(order.artikel.id)}
                          >
                            <DeleteIcon
                              className=" text-red-600 "
                              fontSize="small"
                            />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Total + Abschließen */}
            <div className="p-2 border-t bg-gray-100 flex flex-col gap-2">
              <div className="flex justify-between font-semibold">
                <span>Summe:</span>
                <span>{total.toFixed(2)} CHF</span>
              </div>
              <Button onClick={handleCompleteOrder}>
                Bestellung abschliessen
              </Button>
            </div>
          </div>
        </div>

        {/* Rechte Seite: Artikel-Liste */}
        <div className="flex flex-col w-[60%] h-full bg-muted p-2">
          <div className="flex justify-between items-center bg-green-400 text-white p-2 rounded-md mb-2">
            <h2 className="text-lg font-semibold">Artikel</h2>
            <Button
              variant="secondary"
              onClick={() => setShowOpenOrdersModal(true)}
            >
              Offene Bestellungen
            </Button>
          </div>

          <div className="max-h-[85vh] flex-1 p-2 overflow-hidden border rounded-md bg-white">
            <ArticleTabs addToOrder={addToOrder} />
          </div>
        </div>

        {/* Modals */}
        <MemberSelectDialog
          open={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          members={members}
          search={memberSearch}
          setSearch={setMemberSearch}
          onSelect={(member) => {
            setSelectedMemberId(member.id);
            setSelectedMemberName(`${member.first_name} ${member.last_name}`);
            setSelectedTable(null);
            setShowMemberModal(false);
            setMemberSearch("");
          }}
          onClear={() => {
            setSelectedMemberId(null);
            setSelectedMemberName(null);
            setShowMemberModal(false);
          }}
        />

        <TableSelectDialog
          open={showTableModal}
          onClose={() => setShowTableModal(false)}
          onSelect={(num) => {
            setSelectedTable(num);
            setSelectedMemberId(null);
            setSelectedMemberName(null);
            setShowTableModal(false);
          }}
          onClear={() => {
            setSelectedTable(null);
            setShowTableModal(false);
          }}
        />

        <OpenOrdersDialog
          open={showOpenOrdersModal}
          onClose={() => setShowOpenOrdersModal(false)}
          onLoadOrder={handleLoadOrder}
        />
      </div>
    </div>
  );
};

export default Kasse;
