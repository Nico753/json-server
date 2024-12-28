// api/file.js

import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data.json');  // Percorso del file data.json

// Funzione per leggere i dati da data.json
const readData = () => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');  // Legge il file JSON
    return JSON.parse(data);  // Converte il contenuto in un oggetto JavaScript
  } catch (error) {
    console.error('Errore durante la lettura del file:', error);
    return {};  // Ritorna un oggetto vuoto in caso di errore
  }
};

// Funzione per scrivere i dati su data.json
const writeData = (data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));  // Scrive nel file in formato JSON
  } catch (error) {
    console.error('Errore durante la scrittura del file:', error);
  }
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Legge i dati da data.json e restituisce come risposta
    const data = readData();
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    // Gestisce la richiesta POST - Aggiunge i dati al file JSON
    let body = '';
    
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const newData = JSON.parse(body);  // Parsea i dati inviati

        // Legge i dati correnti da data.json
        let data = readData();

        // Unisce i nuovi dati con quelli esistenti
        data = { ...data, ...newData };

        // Scrive i dati aggiornati nel file data.json
        writeData(data);

        // Risponde con il nuovo oggetto JSON
        res.status(200).json(data);
      } catch (error) {
        res.status(400).json({ error: 'Dati non validi o errore nel parsing' });
      }
    });
  } else {
    // Se il metodo HTTP non è né GET né POST, restituisci un errore
    res.status(405).json({ error: 'Metodo non consentito' });
  }
}
