import React, { useState } from "react";
import "../styles/ArticleTabs.css";

interface ArticleTabsProps {
  addToOrder: (item: string) => void;
}

const ArticleTabs: React.FC<ArticleTabsProps> = ({ addToOrder }) => {
  const [activeTab, setActiveTab] = useState("Getränke");

  // Artikel-Daten (Beispiel)
  const articles: { [key: string]: string[] } = {
    Getränke: ["Cola", "Fanta", "Wasser", "Bier", "Wein", "Kaffee", "Tee", "Milch", "Saft"],
    Speisen: ["Pizza", "Burger", "Pommes", "Salat"],
    Diverses: ["Kaugummi", "Schokoriegel", "Chips"]
  };

  return (
    <div className="article-list">
      <div className="article-tabs">
        {Object.keys(articles).map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="article-items">
        {articles[activeTab].map((item, index) => (
          <button
            key={index}
            className="article-item"
            onClick={() => addToOrder(item)} // Beim Klick zur Bestellung hinzufügen
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ArticleTabs;