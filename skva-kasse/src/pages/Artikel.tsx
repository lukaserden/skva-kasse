import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import api from "@/api";
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
    api
      .get("/products")
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

  // Funktion zur Formatierung von Datum und Uhrzeit
  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat("de-CH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
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
      width: "80px",
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
      selector: (row) =>
        new Intl.NumberFormat("de-CH", {
          style: "currency",
          currency: "CHF",
        }).format(row.price / 100),
      sortable: true,
      width: "100px",
    },
    {
      name: "Einheit",
      selector: (row) => row.unit,
      sortable: true,
      width: "80px",
    },
    {
      name: "Kategorie ID",
      selector: (row) => row.category_id,
      sortable: true,
      width: "90px",
    },
    {
      name: "Erstellt am",
      selector: (row) => formatDateTime(row.created_at),
      sortable: true,
      width: "180px",
    },
    {
      name: "Aktiv",
      selector: (row) => (row.is_active ? "Ja" : "Nein"),
      sortable: true,
      width: "80px",
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        overflow: "hidden",
        whiteSpace: "nowrap",
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

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredArtikel}
        customStyles={customStyles}
        pagination
        responsive
        noDataComponent="Keine Daten gefunden"
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        paginationComponentOptions={{
          rowsPerPageText: "Zeilen pro Seite",
          rangeSeparatorText: "von",
          selectAllRowsItem: true,
          selectAllRowsItemText: "Alle",
        }}
        selectableRowsHighlight
        onSelectedRowsChange={(selected) => {
          console.log("Ausgewählte Zeilen:", selected.selectedRows);
        }}
      />
    </div>
  );
};

export default ArtikelListe;
