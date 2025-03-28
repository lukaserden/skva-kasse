import React, { useState, useRef, useEffect } from "react";
import "../styles/Kasse.css";
import DropdownButton from "../components/Dropdown-Button";
import ArticleTabs from "../components/ArticleTabs";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenOrdersModal from "../components/OpenOrdersModal";
import api from "../api"; // Axios-Instanz

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

interface Member {
  id: number;
  first_name: string;
  last_name: string;
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
  const [customTableInput, setCustomTableInput] = useState("");
  const maxDefaultTables = 6;

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
    } catch (error: any) {
      console.error("Fehler beim Speichern:", error);
      const errorMessage =
        error.response?.data?.error || "Ein Fehler ist aufgetreten";
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

  return (
    <div className="kasse-wrapper">
      <nav className="navbar">
        <h1>Kassen-System</h1>
        <ul>
          <li>
            <a href="#">Start</a>
          </li>
          <li>
            <a href="/admin">Einstellungen</a>
          </li>
          <li>
            <a href="#">Logout</a>
          </li>
        </ul>
        <DropdownButton />
      </nav>

      <div className="kasse-container">
        <div className="left-panel">
          <div className="order-header">
            <button className="user-action-button">User Aktionen</button>
            <button
              className="member-select-button"
              onClick={() => setShowMemberModal(true)}
            >
              {selectedMemberName
                ? `Mitglied: ${selectedMemberName}`
                : "Mitglied auswählen"}
            </button>
            <button
              className="table-select-button"
              onClick={() => setShowTableModal(true)}
            >
              {selectedTable ? `Tisch: ${selectedTable}` : "Tisch auswählen"}
            </button>
          </div>

          {/* Bestell-Tabelle */}
          <div className="order-details" ref={orderDetailsRef}>
            {orders.length === 0 ? (
              <>
                <table className="order-table">
                  <thead>
                    <tr>
                      <th>Produkt</th>
                      <th>Menge</th>
                      <th>Preis CHF</th>
                      <th>Subtotal CHF</th>
                      <th></th>
                    </tr>
                  </thead>
                </table>
                <span>Keine Bestellungen</span>
              </>
            ) : (
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Produkt</th>
                    <th>Menge</th>
                    <th>Preis CHF</th>
                    <th>Subtotal CHF</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={index}>
                      <td>{order.artikel.name}</td>

                      <td>
                        <div className="quantity-controls">
                          <button
                            onClick={() => updateQuantity(order.artikel.id, -1)}
                          >
                            -
                          </button>
                          <span>{order.quantity}</span>
                          <button
                            onClick={() => updateQuantity(order.artikel.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td>{order.price.toFixed(2)}</td>
                      <td>{(order.quantity * order.price).toFixed(2)}</td>
                      <td>
                        <button
                          className="remove-button"
                          onClick={() => removeOrder(order.artikel.id)}
                          title="Entfernen"
                        >
                          <DeleteIcon
                            fontSize="small"
                            className="delete-icon"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="order-total">
            <p>Summe: {total.toFixed(2)} CHF</p>
          </div>

          <div className="order-footer">
            <button className="order-button" onClick={handleCompleteOrder}>
              Bestellung abschließen
            </button>
          </div>
        </div>

        <div className="right-panel">
          <div className="article-header">
            <h2>Artikel</h2>
            <button
              className="open-orders-button"
              onClick={() => setShowOpenOrdersModal(true)}
            >
              Offene Bestellungen
            </button>
          </div>
          <div className="article-list">
            <ArticleTabs addToOrder={addToOrder} />
          </div>
        </div>

        {showMemberModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Mitglied auswählen</h2>

              <input
                type="text"
                placeholder="Mitglied suchen"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                style={{
                  width: "100%",
                  marginBottom: "1rem",
                  padding: "0.5rem",
                }}
              />

              <ul className="member-list">
                {Object.keys(groupedMembers)
                  .sort()
                  .map((letter) => (
                    <li key={letter}>
                      <div className="section-header">{letter}</div>
                      <ul className="section-members">
                        {groupedMembers[letter].map((member) => (
                          <li key={member.id}>
                            <button
                              className="modal-member-button"
                              onClick={() => {
                                setSelectedMemberId(member.id);
                                setSelectedMemberName(
                                  `${member.first_name} ${member.last_name}`
                                );
                                setSelectedTable(null);
                                setShowMemberModal(false);
                                setMemberSearch("");
                              }}
                            >
                              {member.first_name} {member.last_name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
              </ul>

              <button
                className="modal-cancel-button"
                onClick={() => setShowMemberModal(false)}
              >
                Abbrechen
              </button>
              <button
                className="modal-clear-button"
                onClick={() => {
                  setSelectedMemberId(null);
                  setSelectedMemberName(null);
                  setShowMemberModal(false);
                }}
              >
                Auswahl zurücksetzen
              </button>
            </div>
          </div>
        )}

        {showTableModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Tischnummer wählen</h2>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "1rem",
                }}
              >
                {[...Array(maxDefaultTables)].map((_, index) => {
                  const num = index + 1;
                  return (
                    <button
                      key={num}
                      onClick={() => {
                        setSelectedTable(num);
                        setSelectedMemberId(null);
                        setSelectedMemberName(null);
                        setShowTableModal(false);
                      }}
                      style={{ padding: "0.75rem", flex: "1 0 30%" }}
                    >
                      Tisch {num}
                    </button>
                  );
                })}
              </div>

              <div>
                <input
                  type="number"
                  placeholder="Andere Tischnummer"
                  value={customTableInput}
                  onChange={(e) => setCustomTableInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                />
                <button
                  onClick={() => {
                    const parsed = parseInt(customTableInput);
                    if (!isNaN(parsed)) {
                      setSelectedTable(parsed);
                      setSelectedMemberId(null); //  Mitglied abwählen
                      setSelectedMemberName(null); //  Mitglied abwählen
                      setCustomTableInput("");
                      setShowTableModal(false);
                    }
                  }}
                  style={{ width: "100%", padding: "0.5rem" }}
                >
                  Tisch übernehmen
                </button>
              </div>

              <button
                className="modal-cancel-button"
                onClick={() => setShowTableModal(false)}
                style={{ marginTop: "1rem" }}
              >
                Abbrechen
              </button>
              <button
                className="modal-clear-button"
                onClick={() => {
                  setSelectedTable(null);
                  setShowTableModal(false);
                }}
              >
                Auswahl zurücksetzen
              </button>
            </div>
          </div>
        )}

        {showOpenOrdersModal && (
          <OpenOrdersModal onClose={() => setShowOpenOrdersModal(false)} />
        )}
      </div>
    </div>
  );
};

export default Kasse;
