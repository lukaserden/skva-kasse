import React, { useEffect, useState } from "react";
import api from "../api";
import DataTable, { TableColumn } from "react-data-table-component";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import { TbEdit as EditIcon } from "react-icons/tb";
import DeleteIcon from "@mui/icons-material/Delete";
import "../styles/Mitglieder.css";

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  email?: string;
  phone?: string;
  membership_number: string;
  member_state_id: number;
  discount: number;
  is_active: number;
  is_service_required: number;
  created_at: string;
}

interface MemberState {
  id: number;
  name: string;
}

const Mitglieder: React.FC = () => {
  const [records, setRecords] = useState<Member[]>([]);
  const [allRecords, setAllRecords] = useState<Member[]>([]);
  const [memberStates, setMemberStates] = useState<MemberState[]>([]);
  const [newMember, setNewMember] = useState<Partial<Member>>({
    first_name: "",
    last_name: "",
    birthdate: "",
    membership_number: "",
    member_state_id: 1,
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get("/members");
        setRecords(response.data);
        setAllRecords(response.data);
      } catch (error) {
        console.error("Fehler beim Laden der Mitglieder:", error);
      }
    };

    const fetchStates = async () => {
      try {
        const response = await api.get("/member-states");
        setMemberStates(response.data);
      } catch (error) {
        console.error("Fehler beim Laden der Mitgliedsstatus:", error);
      }
    };

    fetchMembers();
    fetchStates();
  }, []);

  const handleNewMemberChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setNewMember((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await api.post("/members", newMember);
      const createdId = response.data.member_id;
      setRecords((prev) => [...prev, { ...newMember, id: createdId } as Member]);
      setAllRecords((prev) => [...prev, { ...newMember, id: createdId } as Member]);
      setNewMember({
        first_name: "",
        last_name: "",
        birthdate: "",
        membership_number: "",
        member_state_id: 1,
      });
      setShowModal(false);
    } catch (error) {
      console.error("Fehler beim Erstellen des Mitglieds:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/members/${id}`);
      setRecords((prev) => prev.filter((m) => m.id !== id));
      setAllRecords((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Fehler beim Löschen des Mitglieds:", error);
    }
  };

  const handleEdit = (id: number) => {
    console.log("Edit action for row with id:", id);
  };

  const columns: TableColumn<Member>[] = [
    {
      name: "Aktionen",
      cell: (row) => (
        <div className="action-buttons">
          <button onClick={() => handleEdit(row.id)} title="Bearbeiten">
            <EditIcon fontSize="small" className="edit-icon" />
          </button>
          <button onClick={() => handleDelete(row.id)} title="Löschen">
            <DeleteIcon fontSize="small" className="delete-icon" />
          </button>
        </div>
      ),
    },
    {
      name: "Mitgliedsnummer",
      selector: (row) => row.membership_number,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => `${row.first_name} ${row.last_name}`,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => {
        const state = memberStates.find((s) => s.id === row.member_state_id);
        const label = state?.name ?? "unbekannt";
        const statusColors: Record<string, string> = {
          aktiv: "green",
          passiv: "gray",
          ehrenmitglied: "purple",
          gesperrt: "red",
          inaktiv: "orange",
        };
        const color = statusColors[label.toLowerCase()] || "black";

        return (
          <span
            style={{
              backgroundColor: color,
              color: "white",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {label}
          </span>
        );
      },
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

      <div className="search">
        <p>Mitglieder durchsuchen</p>
        <input
          type="text"
          placeholder="Suche Mitglied"
          onChange={(e) => {
            const search = e.target.value.toLowerCase();
            const filtered = allRecords.filter((m) =>
              `${m.first_name} ${m.last_name}`.toLowerCase().includes(search)
            );
            setRecords(filtered);
          }}
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
        selectableRowsHighlight
        onSelectedRowsChange={(selected) => {
          console.log("Ausgewählte Zeilen:", selected.selectedRows);
        }}
      />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Neues Mitglied hinzufügen</h2>
            <form onSubmit={handleAddMember}>
              <input
                title="Vorname"
                type="text"
                placeholder="Vorname"
                name="first_name"
                value={newMember.first_name || ""}
                onChange={handleNewMemberChange}
                required
              />
              <input
                title="Nachname"
                type="text"
                placeholder="Nachname"
                name="last_name"
                value={newMember.last_name || ""}
                onChange={handleNewMemberChange}
                required
              />
              <input
                title="Geburtsdatum"
                type="date"
                name="birthdate"
                value={newMember.birthdate || ""}
                onChange={handleNewMemberChange}
                required
              />
              <input
                title="Mitglieder Nummer"
                type="text"
                placeholder="Mitgliedsnummer"
                name="membership_number"
                value={newMember.membership_number || ""}
                onChange={handleNewMemberChange}
                required
              />
              <select
                title="Mitgliedsstatus"
                name="member_state_id"
                value={newMember.member_state_id}
                onChange={handleNewMemberChange}
                required
              >
                {memberStates.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
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