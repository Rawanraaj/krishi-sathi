import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../viewmodels/useFavorites';
import { ListingCard } from '../components/ListingCard';

export const FavoritesView: React.FC = () => {
  const { favoritedListings, loading, toggleFavorite } = useFavorites();

  return (
    <main className="page-wrapper">
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Saved Crop Favorites ❤️</h1>
        <p className="page-subtitle">
          Your bookmarked crop listings for quick contact and price comparison
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '1.1rem' }}>
            Loading your favorited crops...
          </p>
        </div>
      ) : favoritedListings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          background: 'white',
          borderRadius: 'var(--radius-md)',
          padding: '3.5rem 1.5rem',
          border: '1px solid var(--border-light)',
          maxWidth: '560px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🤍🌾</div>
          <h2 style={{ color: 'var(--primary-900)', marginBottom: '0.5rem' }}>No saved crops yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            When browsing the marketplace, click the heart icon on any crop listing to save it here for fast access.
          </p>
          <Link to="/listings" className="btn btn-primary">
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Saved {favoritedListings.length} crop listing{favoritedListings.length !== 1 ? 's' : ''}
          </div>

          <div className="listings-grid">
            {favoritedListings.map((crop) => (
              <ListingCard
                key={crop.id}
                listing={crop}
                isFavorited={true}
                onToggleFavorite={toggleFavorite}
                canFavorite={true}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
};
