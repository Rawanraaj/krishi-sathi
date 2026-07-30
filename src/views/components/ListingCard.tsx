import React, { useState } from 'react';
import type { CropListing } from '../../models/listing';

interface ListingCardProps {
  listing: CropListing;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  canFavorite?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorited = false,
  onToggleFavorite,
  canFavorite = true
}) => {
  const [showContact, setShowContact] = useState(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80';

  return (
    <article className="crop-card">
      <div className="crop-card-img-wrapper">
        <img
          src={listing.imageUrl || fallbackImage}
          alt={listing.cropName}
          className="crop-card-img"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        {canFavorite && onToggleFavorite && (
          <button
            type="button"
            className="fav-btn"
            onClick={() => onToggleFavorite(listing.id)}
            title={isFavorited ? 'Remove from saved crops' : 'Save crop to favorites'}
            aria-label={isFavorited ? 'Remove from saved crops' : 'Save crop to favorites'}
          >
            {isFavorited ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      <div className="crop-card-body">
        <div className="crop-location">
          📍 {listing.location}
        </div>

        <h3 className="crop-title">{listing.cropName}</h3>

        <div className="crop-price-tag">
          NPR {listing.pricePerUnit.toLocaleString()}
          <span> / {listing.unit}</span>
        </div>

        {listing.description && (
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {listing.description}
          </p>
        )}

        <div className="crop-meta">
          <span>📦 Available: <strong>{listing.quantity} {listing.unit}</strong></span>
          {listing.farmerName && <span>👨‍🌾 {listing.farmerName}</span>}
        </div>

        <div className="crop-card-footer">
          {showContact ? (
            <div style={{
              width: '100%',
              background: 'var(--primary-50)',
              border: '1px solid var(--primary-100)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem',
              textAlign: 'center',
              fontWeight: 600,
              color: 'var(--primary-800)',
              fontSize: '0.9rem'
            }}>
              📞 {listing.contactInfo}
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => setShowContact(true)}
            >
              Contact Farmer Directly
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
