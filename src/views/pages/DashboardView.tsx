import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../viewmodels/useDashboard';
import { ListingCard } from '../components/ListingCard';

export const DashboardView: React.FC = () => {
  const {
    userRole,
    userEmail,
    myFarmerListings,
    favoritedListings,
    totalQuantityProduced,
    loading
  } = useDashboard();

  return (
    <main className="page-wrapper">
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">
              {userRole === 'farmer' ? 'Farmer Control Dashboard 👨‍🌾' : 'Buyer Produce Dashboard 🛒'}
            </h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              Account: <strong>{userEmail}</strong> • Role:{' '}
              <span className={`role-tag ${userRole}`}>
                {userRole === 'farmer' ? 'Farmer' : 'Buyer'}
              </span>
            </p>
          </div>

          {userRole === 'farmer' && (
            <Link to="/listings/new" className="btn btn-primary">
              + Post New Crop Listing
            </Link>
          )}
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '1.1rem' }}>
            Loading dashboard analytics...
          </p>
        </div>
      ) : userRole === 'farmer' ? (
        /* Farmer Dashboard View */
        <div>
          {/* Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem'
          }}>
            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE LISTINGS</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                {myFarmerListings.length}
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>CROP QUANTITY LISTED</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                {totalQuantityProduced.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 500 }}>units</span>
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>MIDDLEMAN FEES SAVED</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary-600)' }}>
                100%
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-900)' }}>Your Published Crop Listings</h2>

          {myFarmerListings.length === 0 ? (
            <div style={{
              textAlign: 'center',
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '3rem 1.5rem',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌱</div>
              <h3>You haven't posted any crops yet</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
                Start listing your harvest so buyers from across Nepal can reach out directly.
              </p>
              <Link to="/listings/new" className="btn btn-primary">
                Create First Crop Listing
              </Link>
            </div>
          ) : (
            <div className="listings-grid">
              {myFarmerListings.map((crop) => (
                <ListingCard
                  key={crop.id}
                  listing={crop}
                  canFavorite={false}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Buyer Dashboard View */
        <div>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-light)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <div style={{ fontSize: '2.5rem' }}>🛒</div>
            <div>
              <h3 style={{ color: 'var(--primary-900)', marginBottom: '0.2rem' }}>Buyer Market Hub</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Save listings to quickly call farmers, arrange direct pickup, or negotiate bulk orders.
              </p>
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-900)' }}>Your Saved Favorites ({favoritedListings.length})</h2>

          {favoritedListings.length === 0 ? (
            <div style={{
              textAlign: 'center',
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '3rem 1.5rem',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🤍</div>
              <h3>No saved favorites</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
                Browse the marketplace and save crops to track farmer contacts.
              </p>
              <Link to="/listings" className="btn btn-primary">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="listings-grid">
              {favoritedListings.map((crop) => (
                <ListingCard
                  key={crop.id}
                  listing={crop}
                  isFavorited={true}
                  canFavorite={false}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
};
