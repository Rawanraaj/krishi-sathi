import React, { useState } from 'react';
import type { CropListing } from '../../models/listing';
import type { Order } from '../../models/order';

interface ListingCardProps {
  listing: CropListing;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  canFavorite?: boolean;
  /** Pass to enable "Order Crop" for buyers. */
  onPlaceOrder?: (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<Order>;
  /** Current user's profile info — needed for order submissions. */
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: 'farmer' | 'buyer';
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorited = false,
  onToggleFavorite,
  canFavorite = true,
  onPlaceOrder,
  currentUserId,
  currentUserName,
  currentUserRole,
}) => {
  const [showContact, setShowContact] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderQty, setOrderQty] = useState<number | ''>(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80';

  const isBuyer = currentUserRole === 'buyer';
  const canOrder = isBuyer && onPlaceOrder && currentUserId;

  const calculatedTotal = typeof orderQty === 'number' && orderQty > 0
    ? orderQty * listing.pricePerUnit
    : 0;

  const handlePlaceOrder = async () => {
    if (!onPlaceOrder || !currentUserId) return;
    if (!orderQty || orderQty <= 0) {
      setOrderError('Please enter a valid quantity.');
      return;
    }
    if (orderQty > listing.quantity) {
      setOrderError(`Only ${listing.quantity} ${listing.unit} available.`);
      return;
    }

    setOrderSubmitting(true);
    setOrderError(null);
    try {
      await onPlaceOrder({
        listingId: listing.id,
        cropName: listing.cropName,
        buyerId: currentUserId,
        buyerName: currentUserName || 'Buyer',
        farmerId: listing.farmerId,
        farmerName: listing.farmerName || 'Farmer',
        quantity: orderQty,
        unit: listing.unit,
        pricePerUnit: listing.pricePerUnit,
        totalPrice: calculatedTotal,
        notes: orderNotes || undefined,
      });
      setOrderSuccess(true);
      setShowOrderForm(false);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to place order.';
      setOrderError(errMsg);
    } finally {
      setOrderSubmitting(false);
    }
  };

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
        <div className="crop-location">📍 {listing.location}</div>

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

        {/* ── Order success banner ── */}
        {orderSuccess && (
          <div className="alert alert-info" style={{ marginBottom: '0.75rem' }}>
            ✅ Order placed! The farmer will confirm soon.
          </div>
        )}

        {/* ── Inline order form ── */}
        {showOrderForm && canOrder && !orderSuccess && (
          <div style={{
            background: 'var(--primary-50)',
            border: '1px solid var(--primary-100)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            marginBottom: '0.75rem',
          }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-900)', marginBottom: '0.75rem' }}>
              Order — Cash on Delivery / Pay at Pickup
            </h4>

            {orderError && (
              <div className="alert alert-danger" style={{ marginBottom: '0.75rem', padding: '0.6rem 0.75rem', fontSize: '0.85rem' }}>
                ⚠️ {orderError}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label htmlFor={`order-qty-${listing.id}`} className="form-label" style={{ fontSize: '0.85rem' }}>
                Quantity ({listing.unit}) *
              </label>
              <input
                id={`order-qty-${listing.id}`}
                type="number"
                min={1}
                max={listing.quantity}
                className="form-input"
                style={{ padding: '0.5rem 0.75rem' }}
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label htmlFor={`order-notes-${listing.id}`} className="form-label" style={{ fontSize: '0.85rem' }}>
                Notes (optional)
              </label>
              <input
                id={`order-notes-${listing.id}`}
                type="text"
                className="form-input"
                style={{ padding: '0.5rem 0.75rem' }}
                placeholder="e.g. Need delivery to Kathmandu by Friday"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>

            {calculatedTotal > 0 && (
              <div style={{
                background: 'white',
                border: '1px solid var(--primary-100)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                marginBottom: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Cost</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                  NPR {calculatedTotal.toLocaleString()}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                disabled={orderSubmitting}
                onClick={handlePlaceOrder}
              >
                {orderSubmitting ? 'Placing Order...' : 'Confirm Order'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setShowOrderForm(false); setOrderError(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Card footer actions ── */}
        <div className="crop-card-footer" style={{ flexDirection: 'column' }}>
          {/* Order button for buyers who haven't ordered yet */}
          {canOrder && !orderSuccess && !showOrderForm && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => setShowOrderForm(true)}
            >
              🛒 Order Crop
            </button>
          )}

          {/* Contact farmer — consistent behavior: click to reveal phone */}
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
              fontSize: '0.9rem',
            }}>
              📞 {listing.contactInfo}
            </div>
          ) : (
            <button
              type="button"
              className={canOrder ? 'btn btn-outline btn-sm' : 'btn btn-primary'}
              style={{ width: '100%' }}
              onClick={() => setShowContact(true)}
            >
              📞 Contact Farmer Directly
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
