import React, { useState, useRef, useEffect } from "react";
import "../styles/Kasse.css";
import DropdownButton from "../components/Dropdown-Button";
import ArticleTabs from "../components/ArticleTabs";

const Kasse: React.FC = () => {
  const [orders, setOrders] = useState<string[]>([]);
  const orderDetailsRef = useRef<HTMLDivElement>(null); // Referenz auf order-details

  // Funktion zum Hinzufügen eines Artikels zur Bestellung
  const addToOrder = (item: string) => {
    setOrders((prevOrders) => [...prevOrders, item]);
  };

  // Automatisches Scrollen nach unten, wenn eine neue Bestellung hinzugefügt wird
  useEffect(() => {
    if (orderDetailsRef.current) {
      orderDetailsRef.current.scrollTop = orderDetailsRef.current.scrollHeight;
    }
  }, [orders]);

  // Funktion zum Abschließen der Bestellung
  const handleCompleteOrder = () => {
    if (orders.length === 0) {
      alert("Keine Bestellungen vorhanden");
    } else if (window.confirm("Möchtest du die Bestellung wirklich abschließen?")) {
      setOrders([]);
    }
  };

  return (
    <div className="kasse-wrapper">
      <nav className="navbar">
        <h1>Kassen-System</h1>
        <ul>
          <li><a href="#">Start</a></li>
          <li><a href="/">Einstellungen</a></li>
          <li><a href="#">Logout</a></li>
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

          {/* Bestellungsliste mit Referenz für Auto-Scroll */}
          <div className="order-details" ref={orderDetailsRef}>
            {orders.length === 0 ? (
              <p>Keine Bestellungen</p>
            ) : (
              orders.map((order, index) => (
                <p key={index}>{order}</p>
              ))
            )}
          </div>

          <div className="order-total">
            <p>Summe: 100€</p>
          </div>

          <div className="order-footer">
            <button className="order-button" onClick={handleCompleteOrder}>
              Bestellung abschließen
            </button>
          </div>
        </div>

        <div className="right-panel">
          <div className="article-header">
            <h2>ArtikelHeader</h2>
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