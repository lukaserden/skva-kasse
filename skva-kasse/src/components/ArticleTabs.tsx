import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ArticleTabs.css";

interface ArticleTabsProps {
  addToOrder: (item: Artikel) => void;
}

// Kategorie-Interface aus der API
interface Kategorie {
  id: number;
  name: string;
  parent_id: number | null;
}

// Artikel-Interface aus der API
interface Artikel {
  id: number;
  name: string;
  category_id: number;
  price: number;
}

// Dynamische Hauptkategorien (Tabs)
const mainCategories: Record<number, string> = {
  1: "Essen",
  2: "Getränke",
  3: "Diverses",
};

// Dynamische Farben für Child-Kategorien
const categoryColors: Record<string, string> = {
  "Snacks": "btn-orange",
  "Warme Speisen": "btn-red",
  "Kalte Speisen": "btn-green",
  "Süsswaren & Desserts": "btn-purple",
  "Alkoholfreie Getränke": "btn-blue",
  "Heissgetränke": "btn-brown",
  "Bier & Cider": "btn-yellow",
  "Wein & Sekt": "btn-pink",
  "Spirituosen & Cocktails": "btn-darkblue",
};

const ArticleTabs: React.FC<ArticleTabsProps> = ({ addToOrder }) => {
  const [categories, setCategories] = useState<Kategorie[]>([]);
  const [articles, setArticles] = useState<Artikel[]>([]);
  const [groupedArticles, setGroupedArticles] = useState<{ [key: string]: Artikel[] }>({});
  const [activeTab, setActiveTab] = useState<string>("Getränke");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // 🚀 Kategorien & Artikel holen
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          axios.get<Kategorie[]>(`${API_URL}/categories`),
          axios.get<Artikel[]>(`${API_URL}/products`),
        ]);

        const categoryData = categoryResponse.data;
        const productData = productResponse.data;
        setCategories(categoryData);
        console.log(articles);
        setArticles(productData);

        // 🔥 Artikel nach Hauptkategorie (parent_id) gruppieren
        const grouped: { [key: string]: Artikel[] } = {};

        productData.forEach((product) => {
          const category = categoryData.find((cat) => cat.id === product.category_id);
          if (!category || category.parent_id === null) return; // Falls kein Parent, ignorieren

          const parentName = mainCategories[category.parent_id] || "Sonstiges";

          if (!grouped[parentName]) {
            grouped[parentName] = [];
          }
          grouped[parentName].push(product);
        });

        setGroupedArticles(grouped);
        setLoading(false);
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
        setError("Fehler beim Laden der Artikel und Kategorien");
        setLoading(false);
      }
    };

     fetchData();
  }, []);

  if (loading) return <p>Lade Artikel...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="article-list">
      {/* 🔥 Tabs Dynamisch aus Hauptkategorien */}
      <div className="article-tabs">
        {Object.values(mainCategories).map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 🔥 Artikel-Liste nach Hauptkategorie */}
      <div className="article-items">
        {groupedArticles[activeTab] ? (
          groupedArticles[activeTab].map((item) => {
            // 🏷 Kategorie finden, um die richtige Farbe zuzuweisen
            const category = categories.find((cat) => cat.id === item.category_id);
            const colorClass = category ? categoryColors[category.name] || "btn-default" : "btn-default";

            return (
              <button
                key={item.id}
                className={`article-item ${colorClass}`}
                onClick={() => addToOrder(item)}
              >
                {item.name}
              </button>
            );
          })
        ) : (
          <p>Keine Artikel vorhanden</p>
        )}
      </div>
    </div>
  );
};

export default ArticleTabs;