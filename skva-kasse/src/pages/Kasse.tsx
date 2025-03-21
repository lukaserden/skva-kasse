import React, { useState, useRef, useEffect } from "react";
import "../styles/Kasse.css";
import DropdownButton from "../components/Dropdown-Button";
import ArticleTabs from "../components/ArticleTabs";
import DeleteIcon from "@mui/icons-material/Delete";

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

  const handleCompleteOrder = () => {
    if (orders.length === 0) {
      alert("Keine Bestellungen vorhanden");
    } else if (
      window.confirm("Möchtest du die Bestellung wirklich abschließen?")
    ) {
      setOrders([]);
    }
  };

  const total = orders.reduce((sum, o) => sum + o.quantity * o.price, 0);

  return (
    <div className="kasse-wrapper">
      <nav className="navbar">
        <h1>Kassen-System</h1>
        <ul>
          <li>
            <a href="#">Start</a>
          </li>
          <li>
            <a href="/">Einstellungen</a>
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
            <button className="member-select-button">Mitglied auswählen</button>
            <button className="table-select-button">Tisch auswählen</button>
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
                          <DeleteIcon fontSize="small" className="delete-icon" />
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
          </div>
          <div className="article-list">
            <ArticleTabs addToOrder={addToOrder} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kasse;
