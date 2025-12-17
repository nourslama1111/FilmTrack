const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ===== MIDDLEWARE =====
app.use(cors()); // Permet la communication avec React
app.use(express.json()); // Parse les requêtes JSON

// ===== CONNEXION MONGODB LOCAL =====
const MONGODB_URI = 'mongodb://127.0.0.1:27017/filmtrack';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB Local'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// ===== MODÈLE MONGOOSE (SCHÉMA) =====
const filmSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  genre: { type: String, required: true },
  annee: { type: Number, required: true },
  vu: { type: Boolean, default: false },
  watchlist: { type: Boolean, default: false },
  dateAjout: { type: Date, default: Date.now }
});

const Film = mongoose.model('Film', filmSchema);

// ===== ROUTES API =====

// GET - Récupérer tous les films
app.get('/api/films', async (req, res) => {
  try {
    const films = await Film.find().sort({ dateAjout: -1 });
    res.json(films);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur récupération', 
      error: error.message 
    });
  }
});

// GET - Récupérer un film par ID
app.get('/api/films/:id', async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) {
      return res.status(404).json({ message: 'Film non trouvé' });
    }
    res.json(film);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur récupération', 
      error: error.message 
    });
  }
});

// POST - Créer un nouveau film
app.post('/api/films', async (req, res) => {
  try {
    const { titre, genre, annee, vu, watchlist } = req.body;
    
    // Validation
    if (!titre || !genre || !annee) {
      return res.status(400).json({ 
        message: 'Titre, genre et année requis' 
      });
    }

    const newFilm = new Film({
      titre,
      genre,
      annee,
      vu: vu || false,
      watchlist: watchlist || false
    });

    const savedFilm = await newFilm.save();
    res.status(201).json(savedFilm);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur création', 
      error: error.message 
    });
  }
});

// PUT - Mettre à jour un film
app.put('/api/films/:id', async (req, res) => {
  try {
    const { titre, genre, annee, vu, watchlist } = req.body;
    
    const updatedFilm = await Film.findByIdAndUpdate(
      req.params.id,
      { titre, genre, annee, vu, watchlist },
      { new: true, runValidators: true }
    );

    if (!updatedFilm) {
      return res.status(404).json({ message: 'Film non trouvé' });
    }

    res.json(updatedFilm);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur mise à jour', 
      error: error.message 
    });
  }
});

// DELETE - Supprimer un film
app.delete('/api/films/:id', async (req, res) => {
  try {
    const deletedFilm = await Film.findByIdAndDelete(req.params.id);
    
    if (!deletedFilm) {
      return res.status(404).json({ message: 'Film non trouvé' });
    }

    res.json({ 
      message: 'Film supprimé', 
      film: deletedFilm 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur suppression', 
      error: error.message 
    });
  }
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ API fonctionne!' });
});

// ===== GESTION DES ERREURS =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Erreur serveur', 
    error: err.message 
  });
});

// ===== DÉMARRAGE DU SERVEUR =====
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur sur http://localhost:${PORT}`);
});