import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import api from "@/api";
import { Artikel } from "@/types";
import { CupSoda, Shuffle, Utensils } from "lucide-react";

interface ArticleTabsProps {
  addToOrder: (item: Artikel) => void;
}

interface Kategorie {
  id: number;
  name: string;
  parent_id: number | null;
}

const mainCategories: Record<number, string> = {
  1: "Essen",
  2: "Getränke",
  3: "Diverses",
};

const categoryIcons: Record<string, React.ElementType> = {
  Essen: Utensils, // FastFood-Icon für "Essen"
  Getränke: CupSoda, // Beer-Icon für "Getränke"
  Diverses: Shuffle, // Coffee-Icon für "Diverses"
};

const categoryColors: Record<string, string> = {
  "Snacks": "bg-teal-400",
  "Warme Speisen": "bg-lime-400",
  "Kalte Speisen": "bg-indigo-400",
  "Süsswaren & Desserts": "bg-pink-400",
  "Alkoholfreie Getränke": "bg-blue-400",
  "Heissgetränke": "bg-red-400",
  "Bier & Cider": "bg-yellow-400",
  "Wein & Sekt": "bg-rose-800",
  "Spirituosen & Cocktails": "bg-teal-500",
};

const ArticleTabs: React.FC<ArticleTabsProps> = ({ addToOrder }) => {
  const [categories, setCategories] = useState<Kategorie[]>([]);
  const [groupedArticles, setGroupedArticles] = useState<
    Record<string, Artikel[]>
  >({});
  const [activeTab, setActiveTab] = useState("Getränke");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          api.get("/categories"),
          api.get("/products?is_active=1"),
        ]);

        const categoryData = categoryResponse.data;
        const productData = productResponse.data.data;

        setCategories(categoryData);
        // Removed setArticles as articles state is no longer used

        const grouped: { [key: string]: Artikel[] } = {};

        productData.forEach((product: Artikel) => {
          const category = categoryData.find(
            (cat: { id: number }) => cat.id === product.category_id
          );
          if (!category || category.parent_id === null) return;

          const parentName = mainCategories[category.parent_id] || "Sonstiges";

          if (!grouped[parentName]) {
            grouped[parentName] = [];
          }
          grouped[parentName].push(product);
        });

        setGroupedArticles(grouped);
      } catch (error) {
        console.error("Fehler beim Laden der Artikel und Kategorien:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full h-full flex flex-col"
    >
      {/* Tabs List */}
      <TabsList className="grid grid-cols-3 w-full h-12">
        {Object.values(mainCategories).map((tab) => {
          const Icon = categoryIcons[tab]; // Hole das passende Icon

          return (
            <TabsTrigger
              key={tab}
              value={tab}
              className="flex items-center justify-center "
            >
              {/* Vergrößertes Icon */}
              <Icon className="mr-2 w-6 h-6" />{" "}
              {/* Füge das Icon links neben dem Text hinzu */}
              {tab}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Tabs Content */}
      {Object.values(mainCategories).map((tab) => (
        <TabsContent key={tab} value={tab} className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-4 gap-4 p-2">
              {groupedArticles[tab]?.length ? (
                groupedArticles[tab].map((item) => {
                  const category = categories.find(
                    (cat) => cat.id === item.category_id
                  );
                  const colorClass = category
                    ? categoryColors[category.name] || "bg-gray-300"
                    : "bg-gray-300";

                  return (
                    <Button
                      key={item.id}
                      variant="secondary"
                      className="flex flex-col items-center p-1 rounded-xl relative h-22 transform transition-all duration-100 active:scale-95 active:bg-opacity-90"
                      onClick={() => addToOrder(item)}
                    >
                      {/* Farbbalken oben */}
                      <div
                        className={`absolute top-0 left-0 w-full h-3 rounded-t-xl ${colorClass}`}
                      />
                      <span className="text-lg font-semibold">{item.name}</span>
                      <div className="flex justify-between w-full px-2 mt-1">
                        <span className="text-md opacity-70">
                          CHF {(item.price / 100).toFixed(2)}
                        </span>
                        <span className="text-md opacity-70">
                          {item.unit !== null ? `${item.unit}` : ""}
                        </span>
                      </div>
                    </Button>
                  );
                })
              ) : (
                <p className="text-lg opacity-70">Keine Artikel vorhanden</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ArticleTabs;
