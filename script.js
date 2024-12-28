const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  // Importa il pacchetto cors
const app = express();
const PORT = 3000;

// Middleware per il parsing del corpo delle richieste POST
app.use(express.json());

// Abilita CORS per tutte le richieste
app.use(cors());

// Percorso del file JSON
const jsonFilePath = path.join(__dirname, 'data.json');

// Endpoint GET per la home page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Benvenuto</title>
      </head>
      <body>
        <h1>Benvenuto nel nostro server!</h1>
        <p>Accedi a /data per vedere i dati o a /add-to-cart/:userId per aggiungere un prodotto al carrello.</p>
        <p>Accedi a /add-user per aggiungere un nuovo utente al sistema.</p>
      </body>
    </html>
  `);
});

// Endpoint GET per leggere il file JSON
app.get('/data', (req, res) => {
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Errore nella lettura del file' });
    }
    res.json(JSON.parse(data)); // Invia i dati come risposta
  });
});

// Endpoint POST per aggiungere un prodotto al carrello di un utente
app.post('/add-to-cart/:userId', (req, res) => {
  const userId = req.params.userId; // ID dell'utente a cui aggiungere il prodotto
  const product = req.body; // Dettagli del prodotto da aggiungere

  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Errore nella lettura del file' });
    }

    const currentData = JSON.parse(data); // Converte il contenuto del file in oggetto JSON

    // Trova l'utente con l'ID specificato
    const user = currentData.Users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    // Aggiungi il prodotto al carrello dell'utente
    user.shoppingCart.push(product);

    // Scrivi i dati aggiornati nel file JSON
    fs.writeFile(jsonFilePath, JSON.stringify(currentData, null, 2), 'utf8', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Errore nella scrittura del file' });
      }
      res.status(200).json({ message: 'Prodotto aggiunto al carrello', shoppingCart: user.shoppingCart });
    });
  });
});

// Endpoint POST per aggiungere un nuovo utente
app.post('/add-user', (req, res) => {
  const newUser = req.body; // Ottieni i dati del nuovo utente dalla richiesta

  // Verifica che i dati dell'utente siano completi
  if (!newUser || !newUser.username || !newUser.email || !newUser.password || !newUser.country || !newUser.city || !newUser.address) {
    return res.status(400).json({ error: 'I dati dell\'utente sono incompleti' });
  }

  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Errore nella lettura del file' });
    }

    const currentData = JSON.parse(data); // Converte il contenuto del file in oggetto JSON

    // Verifica che l'utente non esista già
    const existingUser = currentData.Users.find(u => u.username === newUser.username || u.email === newUser.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Utente già esistente' });
    }

    // Aggiungi il nuovo utente all'array Users
    currentData.Users.push(newUser);

    // Scrivi i dati aggiornati nel file JSON
    fs.writeFile(jsonFilePath, JSON.stringify(currentData, null, 2), 'utf8', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Errore nella scrittura del file' });
      }
      res.status(200).json({ message: 'Nuovo utente aggiunto', newUser });
    });
  });
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
