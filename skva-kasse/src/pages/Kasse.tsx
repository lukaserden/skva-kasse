import React, { useState } from "react";
import "../styles/Kasse.css";
import DropdownButton from "../components/Dropdown-Button";
import ArticleTabs from "../components/ArticleTabs";

const Kasse: React.FC = () => {
  // State für die Bestellungen
  const [orders, setOrders] = useState<string[]>([]);

  // Funktion, um Artikel hinzuzufügen
  const addToOrder = (item: string) => {
    setOrders((prevOrders) => [...prevOrders, item]);
  };

  // Funktion zum Abschließen der Bestellung (leert die Liste)
  const handleCompleteOrder = () => {
    setOrders([]); // Setzt die Bestellungen zurück
  };

  return (
    <div className="kasse-wrapper">
      <nav className="navbar">
        <h1>Kassen-System</h1>
        {/* <ul>
          <li><a href="#">Start</a></li>
          <li><a href="#">Einstellungen</a></li>
          <li><a href="#">Logout</a></li>
        </ul> */}
        <DropdownButton />
      </nav>

      <div className="kasse-container">
        <div className="left-panel">
          <div className="order-header">
            <button className="user-action-button">User Aktionen</button>
            <button className="member-select-button">Mitglied auswählen</button>
            <button className="table-select-button">Tisch auswählen</button>
          </div>

          {/* Bestellungsliste */}
          <div className="order-details">
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

          {/* Button zum Abschließen der Bestellung */}
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