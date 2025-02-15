import React, { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { userData } from "../assets/userData";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import "../styles/Mitglieder.css";

// Interface für ein Mitglied
interface Member {
  id: number;
  name: string;
  role: string;
}

const Mitglieder: React.FC = () => {
  const [records, setRecords] = useState<Member[]>(userData);
  const [newMember, setNewMember] = useState({ name: "", role: "" });
  const [showModal, setShowModal] = useState(false);

  // Suchfunktion für Mitglieder
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const search = event.target.value;
    const filteredData = userData.filter((item: Member) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    setRecords(filteredData);
  };

  // Aktionen für einzelne Zeilen
  const handleEdit = (id: number) => {
    console.log("View action for row with id:", id);
    // Weitere Logik zum Anzeigen der Details...
  };

  const handleDelete = (id: number) => {
    console.log("Delete action for row with id:", id);
    // Weitere Logik zum Löschen...
  };

  // Update der Eingabefelder im Modal
  const handleNewMemberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewMember((prev) => ({ ...prev, [name]: value }));
  };

  // Hinzufügen eines neuen Mitglieds
  const handleAddMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newId = records.length > 0 ? records[records.length - 1].id + 1 : 1;
    const memberToAdd: Member = { id: newId, ...newMember };
    setRecords((prevRecords) => [...prevRecords, memberToAdd]);
    setNewMember({ name: "", role: "" });
    setShowModal(false);
  };

  // Spalten-Definition inklusive einer Actions-Spalte
  const columns: TableColumn<Member>[] = [
    {
      name: "Actions",
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
      name: "Role",
      selector: (row) => row.role,
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

  return (
    <div className="mitglieder-container">
      <h1>Mitglieder</h1>
      <p>Verwaltung der Mitglieder.</p>

      <div className="add"></div>

      <div className="search">
        <p>Mitglieder durchsuchen</p>
        <input
          type="text"
          placeholder="Suche Mitglied"
          onChange={handleChange}
        />

        <button type="button" onClick={() => setShowModal(true)}>
          <div className="btn">
            <PersonAddOutlinedIcon fontSize="large" className="user-add-icon" />
            <span>Mitglied hinzufügen</span>
          </div>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={records}
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

      {/* Modal für das Hinzufügen eines neuen Mitglieds */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Neues Mitglied hinzufügen</h2>
            <form onSubmit={handleAddMember}>
              <input
                type="text"
                placeholder="Name"
                name="name"
                value={newMember.name}
                onChange={handleNewMemberChange}
                required
              />
              <input
                type="text"
                placeholder="Rolle"
                name="role"
                value={newMember.role}
                onChange={handleNewMemberChange}
                required
              />
              <div className="modal-buttons">
                <button className="submit" type="submit">
                  Hinzufügen
                </button>
                <button
                  className="cancel"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mitglieder;