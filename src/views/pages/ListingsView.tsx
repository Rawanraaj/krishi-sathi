import React from 'react';
import { useListings } from '../../viewmodels/useListings';
import { useFavorites } from '../../viewmodels/useFavorites';
import { useOrders } from '../../viewmodels/useOrders';
import { useAuth } from '../../viewmodels/useAuth';
import { ListingCard } from '../components/ListingCard';

export const ListingsView: React.FC = () => {
  const {
    filteredListings,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedLocation,
    setSelectedLocation,
    locations
  } = useListings();

  const { userProfile } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { placeOrder } = useOrders();

  return (
    <main className="page-wrapper">
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Nepali Crop Marketplace</h1>
        <p className="page-subtitle">
          Discover fresh agricultural produce directly from verified farmers across Nepal
        </p>

        {/* Search & Location Filters */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-light)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          alignItems: 'end'
        }}>
          <div>
            <label htmlFor="search-crop-input" className="form-label">
              🔍 Search by Crop Name
            </label>
            <input
              id="search-crop-input"
              type="text"
              className="form-input"
              placeholder="e.g. Rice, Cauliflower, Apple, Cardamom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="select-location-input" className="form-label">
              📍 Filter by Location / District
            </label>
            <select
              id="select-location-input"
              className="form-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">All Districts in Nepal</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || selectedLocation) && (
            <div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLocation('');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="alert alert-danger" role="alert">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '1.1rem' }}>
            Loading available crops...
          </p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          background: 'white',
          borderRadius: 'var(--radius-md)',
          padding: '3rem 1.5rem',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌾🔍</div>
          <h3>No matching crops found</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
            Try clearing your search query or selecting a different location.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSearchQuery('');
              setSelectedLocation('');
            }}
          >
            Show All Crop Listings
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Showing {filteredListings.length} crop listing{filteredListings.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="listings-grid">
            {filteredListings.map((crop) => (
              <ListingCard
                key={crop.id}
                listing={crop}
                isFavorited={isFavorited(crop.id)}
                onToggleFavorite={userProfile ? toggleFavorite : undefined}
                canFavorite={!!userProfile}
                onPlaceOrder={userProfile?.role === 'buyer' ? placeOrder : undefined}
                currentUserId={userProfile?.uid}
                currentUserName={userProfile?.email.split('@')[0]}
                currentUserRole={userProfile?.role}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
};
