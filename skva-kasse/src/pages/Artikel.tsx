import React, { useState, useEffect } from 'react';

interface Artikel {
  id: number;
  name: string;
  kategorie: string;
  sub_kategorie: string;
  preis: number;
  einheit: number;
  bestand: number;
}

const Artikel: React.FC = () => {
  const [artikel, setArtikel] = useState<Artikel[]>([]);

  useEffect(() => {
    // Simulierte API-Antwort mit Mock-Daten
    const mockArtikel: Artikel[] = [
      {
        id: 1,
        name: 'Cola',
        kategorie: 'Getränke',
        sub_kategorie: 'Non-Alk.',
        preis: 1.50,
        einheit: 0.33, // z. B. Liter oder Flascheninhalt
        bestand: 100
      },
      {
        id: 2,
        name: 'Bier',
        kategorie: 'Getränke',
        sub_kategorie: 'Alk.',
        preis: 2.50,
        einheit: 0.5,
        bestand: 50
      },
      {
        id: 3,
        name: 'Chips',
        kategorie: 'Essen',
        sub_kategorie: 'Snacks',
        preis: 1.00,
        einheit: 1,
        bestand: 200
      }
    ];
    setArtikel(mockArtikel);
  }, []);

  return (
    <div>
      <h1>Artikel</h1>
      <p>Verwaltung der Artikel und Produkte.</p>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Kategorie</th>
            <th>Sub-Kategorie</th>
            <th>Preis</th>
            <th>Einheit</th>
            <th>Bestand</th>
          </tr>
        </thead>
        <tbody>
          {artikel.map(art => (
            <tr key={art.id}>
              <td>{art.id}</td>
              <td>{art.name}</td>
              <td>{art.kategorie}</td>
              <td>{art.sub_kategorie}</td>
              <td>{art.preis.toFixed(2)}</td>
              <td>{art.einheit}</td>
              <td>{art.bestand}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Artikel;