import React from 'react';
import DataTable from 'react-data-table-component';
import { userData } from '../assets/userData';
import '../styles/Mitglieder.css';


const columns = [
  { 
    name: "ID",
    selector: (row: { id: number; }) => row.id,
    sortable: true
  },
  { 
    name: "Name",
    selector: (row: { name: string; }) => row.name,
    sortable: true
  },
  { 
    name: "Role",
    selector: (row: { role: string; }) => row.role,
    sortable: true
  },
]

const customStyles = {
  headCells: {
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: 'white',
      backgroundColor: 'black',
    },
  },
  rows: {
    style: {
      fontSize: '14px',
      color: 'black',
      backgroundColor: 'lightgrey',
    },
  },
};


const Mitglieder: React.FC = () => {
  const [records, setRecords] = React.useState(userData);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let search = event.target.value;
    const filteredData = userData.filter(item =>
      item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );
    setRecords(filteredData);

    console.log(filteredData);
  }
    return (
    <div>
      <h1>Mitglieder</h1>
      <p>Verwaltung der Mitglieder.</p>
      <div className = "add">
        <button type="button">Mitglied hinzufügen</button>
      </div>

      <div className = "search">
        <p>Mitglieder durchsuchen</p>
        <input type="text" placeholder="Suche Mitglied" onChange={handleChange}/>
      </div>
      <DataTable
        // title="Mitglieder"
        columns={columns}
        data={records}
        // data={userData}
        customStyles={customStyles}
        pagination
        paginationPerPage={10}  // Standardmässig 10 Zeilen pro Seite
        paginationRowsPerPageOptions={[10, 20, 30, 50]}  // Auswahlmöglichkeiten
        noDataComponent="Keine Daten gefunden"
        paginationComponentOptions={{
          rowsPerPageText: 'Zeilen pro Seite',
          rangeSeparatorText: 'von',
          noRowsPerPage: false, // Falls du eine Option zur Auswahl von Zeilen pro Seite anzeigen möchtest
          selectAllRowsItem: true, // oder true, falls du diese Option haben möchtest
          selectAllRowsItemText: 'Alle'

        }}
      />
    </div> 
  );
};

export default Mitglieder;