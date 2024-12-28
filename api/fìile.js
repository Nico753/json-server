// api/file.js

import fs from 'fs';
import path from 'path';

let data = {
  "nome": "John Doe",
  "email": "johndoe@example.com",
  "data_nascita": "1990-01-01"
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Gestisce la richiesta GET - Restituisce il contenuto del file JSON
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    // Gestisce la richiesta POST - Aggiunge dati al JSON (modifica del JSON)
    let body = '';
    
    // Raccoglie i dati inviati nel corpo della richiesta
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      // Parsea i dati ricevuti
      const newData = JSON.parse(body);

      // Aggiunge i nuovi dati al nostro oggetto
      data = { ...data, ...newData };

      // Risponde con il nuovo oggetto JSON
      res.status(200).json(data);
    });
  } else {
    // Se il metodo HTTP non è né GET né POST, restituisci un errore
    res.status(405).json({ error: 'Metodo non consentito' });
  }
}
