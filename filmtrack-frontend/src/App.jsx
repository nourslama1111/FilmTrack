// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '@fontsource/inter';  
import './App.css';



const API_URL = 'http://localhost:5000/api/films';

export default function FilmTrack() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    genre: '',
    annee: new Date().getFullYear()
  });

  useEffect(() => {
    fetchFilms();
  }, []);

  const fetchFilms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setFilms(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erreur fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFilm = async () => {
    if (!formData.titre || !formData.genre || !formData.annee) {
      alert('Tous les champs sont requis');
      return;
    }

    try {
      const response = await axios.post(API_URL, formData);
      setFilms([response.data, ...films]);
      setFormData({ titre: '', genre: '', annee: new Date().getFullYear() });
      setShowForm(false);
    } catch (err) {
      alert('Erreur ajout: ' + err.message);
    }
  };

  const updateFilm = async (id, updates) => {
    try {
      const filmToUpdate = films.find(f => f._id === id);
      const response = await axios.put(`${API_URL}/${id}`, {
        ...filmToUpdate,
        ...updates
      });
      setFilms(films.map(f => f._id === id ? response.data : f));
    } catch (err) {
      alert('Erreur mise à jour: ' + err.message);
    }
  };

  const deleteFilm = async (id) => {
    if (!window.confirm('Supprimer ce film ?')) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      setFilms(films.filter(f => f._id !== id));
    } catch (err) {
      alert('Erreur suppression: ' + err.message);
    }
  };

  const getFilteredFilms = () => {
    let filtered = films;

    if (filterType === 'watchlist') {
      filtered = filtered.filter(f => f.watchlist);
    } else if (filterType === 'seen') {
      filtered = filtered.filter(f => f.vu);
    } else if (filterType === 'unseen') {
      filtered = filtered.filter(f => !f.vu);
    }

    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.genre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredFilms = getFilteredFilms();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="radial-glow"></div>
      
      <div className="container">
        <header className="header">
          <div className="header-content">
            <h1 className="title">📽️ FilmTrack</h1>
            <p className="subtitle">Gérez votre collection de films</p>
          </div>
          <button 
            className="btn-add"
            onClick={() => setShowForm(!showForm)}
          >
            + Ajouter un film
          </button>
        </header>

        {showForm && (
          <div className="form-card">
            <h2 className="form-title">Nouveau film</h2>
            <div className="form-group">
              <label>Titre</label>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) => setFormData({...formData, titre: e.target.value})}
                placeholder="Ex: Inception"
                className="input"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Genre</label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => setFormData({...formData, genre: e.target.value})}
                  placeholder="Ex: Science-fiction"
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>Année</label>
                <input
                  type="number"
                  value={formData.annee}
                  onChange={(e) => setFormData({...formData, annee: parseInt(e.target.value)})}
                  className="input"
                />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={handleAddFilm}>
                Ajouter
              </button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="filters-card">
          <div className="search-box">
            <input
              type="text"
              placeholder=" Rechercher un film..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Tous ({films.length})
            </button>
            <button
              className={`filter-btn ${filterType === 'watchlist' ? 'active' : ''}`}
              onClick={() => setFilterType('watchlist')}
            >
              🔖 Watchlist ({films.filter(f => f.watchlist).length})
            </button>
            <button
              className={`filter-btn ${filterType === 'seen' ? 'active' : ''}`}
              onClick={() => setFilterType('seen')}
            >
              ✔️ Vus ({films.filter(f => f.vu).length})
            </button>
            <button
              className={`filter-btn ${filterType === 'unseen' ? 'active' : ''}`}
              onClick={() => setFilterType('unseen')}
            >
              👁 À voir ({films.filter(f => !f.vu).length})
            </button>
          </div>
        </div>

        {/* ERREUR */}
        {error && (
          <div className="error-card">
            ⚠️ Erreur: {error}
          </div>
        )}

        {/* LISTE DES FILMS */}
        {filteredFilms.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">🎬</div>
            <p>
              {searchQuery || filterType !== 'all' 
                ? 'Aucun film trouvé' 
                : 'Aucun film. Ajoutez-en un pour commencer!'}
            </p>
          </div>
        ) : (
          <div className="films-grid">
            {filteredFilms.map(film => (
              <div key={film._id} className="film-card">
                <div className="film-header">
                  <div className="film-info">
                    <h3 className="film-title">{film.titre}</h3>
                    <p className="film-genre">{film.genre}</p>
                    <p className="film-year">{film.annee}</p>
                  </div>
                  <div className="film-badges">
                    {film.vu && <span className="badge badge-seen">✔️</span>}
                    {film.watchlist && <span className="badge badge-watchlist">🔖</span>}
                  </div>
                </div>
                <div className="film-actions">
                  <button
                    className={`btn-action ${film.vu ? 'btn-seen' : ''}`}
                    onClick={() => updateFilm(film._id, { vu: !film.vu })}
                  >
                    {film.vu ? 'Vu' : 'Marquer vu'}
                  </button>
                  <button
                    className={`btn-action ${film.watchlist ? 'btn-watchlist' : ''}`}
                    onClick={() => updateFilm(film._id, { watchlist: !film.watchlist })}
                  >
                    {film.watchlist ? 'Liste' : 'Watchlist'}
                  </button>
                  <button
                    className="btn-action btn-delete"
                    onClick={() => deleteFilm(film._id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}