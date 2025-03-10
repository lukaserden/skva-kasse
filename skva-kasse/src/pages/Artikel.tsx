import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


// Interface für Artikel-Daten aus der API
interface Artikel {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock?: number | null;
  unit: string;
  category_id: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

const ArtikelListe: React.FC = () => {
  const [artikel, setArtikel] = useState<Artikel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  // Daten von der API abrufen
  useEffect(() => {
    axios
      .get("http://localhost:5001/products")
      .then((response) => {
        setArtikel(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // 🔍 Suchfunktion
  const filteredArtikel = artikel.filter((art) =>
    art.name.toLowerCase().includes(search.toLowerCase())
  );

  // 🔄 Edit-Funktion
  const handleEdit = (id: number) => {
    console.log("Edit action for row with id:", id);
    // Hier könnte ein Modal für die Bearbeitung geöffnet werden
  };

  // 🗑️ Delete-Funktion
  const handleDelete = (id: number) => {
    console.log("Delete action for row with id:", id);
    // Hier könnte eine API-Anfrage für das Löschen erfolgen
  };

  // Spalten-Definition für die DataTable
  const columns: TableColumn<Artikel>[] = [
    {
      name: "Aktionen",
      cell: (row) => (
        <div className="action-buttons">
          <button onClick={() => handleEdit(row.id)} title="Eintrag bearbeiten">
            <EditIcon fontSize="small" className="edit-icon" />
          </button>
          <button onClick={() => handleDelete(row.id)} title="Eintrag löschen">
            <DeleteIcon fontSize="small" className="delete-icon" />
          </button>
        </div>
      ),
    },
    {
      name: "ID",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Beschreibung",
      selector: (row) => row.description || "Keine Beschreibung",
      sortable: false,
    },
    {
      name: "Preis (CHF)",
      selector: (row) => (row.price / 100).toFixed(2),
      sortable: true,
    },
    {
      name: "Bestand",
      selector: (row) => (row.stock !== null ? row.stock : "Nicht verfügbar"),
      sortable: true,
    },
    {
      name: "Einheit",
      selector: (row) => row.unit,
      sortable: true,
    },
    {
      name: "Kategorie ID",
      selector: (row) => row.category_id,
      sortable: true,
    },
    {
      name: "Erstellt am",
      selector: (row) => new Date(row.created_at).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Aktiv",
      selector: (row) => (row.is_active ? "Ja" : "Nein"),
      sortable: true,
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontSize: "16px",
        fontWeight: "bold",
        color: "white",
        backgroundColor: "black",
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        color: "black",
        backgroundColor: "lightgrey",
      },
    },
  };

  if (loading) return <p>Lade Artikel...</p>;
  if (error) return <p>Fehler: {error}</p>;

  return (
    <div className="artikel-container">
      <h1>Artikel</h1>
      <p>Verwaltung der Artikel und Produkte.</p>

      {/* 🔍 Suchfeld */}
      <div className="search">
        <p>Artikel durchsuchen</p>
        <input
          type="text"
          placeholder="Suche nach Artikelname"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 📊 DataTable */}
      <DataTable
        columns={columns}
        data={filteredArtikel}
        customStyles={customStyles}
        pagination
        noDataComponent="Keine Daten gefunden"
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        paginationComponentOptions={{
          rowsPerPageText: "Zeilen pro Seite",
          rangeSeparatorText: "von",
          selectAllRowsItem: true,
          selectAllRowsItemText: "Alle",
        }}
        selectableRows
        selectableRowsHighlight
        onSelectedRowsChange={(selected) => {
          console.log("Ausgewählte Zeilen:", selected.selectedRows);
        }}
      />
    </div>
  );
};

export default ArtikelListe;