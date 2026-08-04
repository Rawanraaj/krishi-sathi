import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../viewmodels/useDashboard';
import { useOrders } from '../../viewmodels/useOrders';
import { useAuth } from '../../viewmodels/useAuth';
import { useListings } from '../../viewmodels/useListings';
import { ListingCard } from '../components/ListingCard';
import type { CropListing } from '../../models/listing';
import type { OrderStatus } from '../../models/order';

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: '⏳ Pending',   color: '#8c6b00', bg: '#fffbe6' },
  confirmed: { label: '✅ Confirmed', color: '#0050b3', bg: '#e6f7ff' },
  delivered: { label: '📦 Delivered', color: '#065f46', bg: '#ecfdf5' },
  cancelled: { label: '❌ Cancelled', color: '#cf1322', bg: '#fff2f0' },
};

export const DashboardView: React.FC = () => {
  const { userProfile } = useAuth();
  const { editListing, removeListing } = useListings();
  const {
    userRole,
    userEmail,
    myFarmerListings,
    favoritedListings,
    totalQuantityProduced,
    loading: dashLoading,
    refresh: refreshDashboard,
  } = useDashboard();

  const {
    buyerOrders,
    farmerOrders,
    loading: ordersLoading,
    error: ordersError,
    updateStatus,
  } = useOrders();

  const loading = dashLoading || ordersLoading;

  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Edit / Delete state
  const [editingListing, setEditingListing] = useState<CropListing | null>(null);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);

  // Edit form field state
  const [editCropName, setEditCropName] = useState('');
  const [editQuantity, setEditQuantity] = useState<number | ''>('');
  const [editUnit, setEditUnit] = useState('kg');
  const [editPricePerUnit, setEditPricePerUnit] = useState<number | ''>('');
  const [editLocation, setEditLocation] = useState('');
  const [editContactInfo, setEditContactInfo] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const startEditListing = (listing: CropListing) => {
    // Security check: only allow farmer to edit their own listing
    if (!userProfile || listing.farmerId !== userProfile.uid) {
      setActionError('Security error: You can only edit your own listings.');
      return;
    }
    setEditingListing(listing);
    setEditCropName(listing.cropName);
    setEditQuantity(listing.quantity);
    setEditUnit(listing.unit);
    setEditPricePerUnit(listing.pricePerUnit);
    setEditLocation(listing.location);
    setEditContactInfo(listing.contactInfo);
    setEditDescription(listing.description || '');
    setEditImageUrl(listing.imageUrl || '');
    setActionError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing || !userProfile) return;

    if (editingListing.farmerId !== userProfile.uid) {
      setActionError('Security check failed: You are not authorized to edit this listing.');
      return;
    }

    if (!editCropName || !editQuantity || !editPricePerUnit || !editLocation || !editContactInfo) {
      setActionError('Please complete all required fields.');
      return;
    }

    setActionSubmitting(true);
    setActionError(null);
    try {
      await editListing(editingListing.id, {
        cropName: editCropName,
        quantity: Number(editQuantity),
        unit: editUnit,
        pricePerUnit: Number(editPricePerUnit),
        location: editLocation,
        contactInfo: editContactInfo,
        description: editDescription,
        imageUrl: editImageUrl || undefined,
      });
      setEditingListing(null);
      refreshDashboard();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update listing.';
      setActionError(msg);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    const target = myFarmerListings.find((l) => l.id === listingId);
    if (!target || !userProfile || target.farmerId !== userProfile.uid) {
      setActionError('Security check failed: You are not authorized to delete this listing.');
      return;
    }

    setActionSubmitting(true);
    setActionError(null);
    try {
      await removeListing(listingId);
      setDeletingListingId(null);
      refreshDashboard();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete listing.';
      setActionError(msg);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setStatusUpdating(orderId);
    setStatusError(null);
    try {
      await updateStatus(orderId, newStatus);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Status update failed.';
      setStatusError(errMsg);
    } finally {
      setStatusUpdating(null);
    }
  };

  const pendingFarmerOrders = farmerOrders.filter((o) => o.status === 'pending');
  const activeFarmerOrders = farmerOrders.filter((o) => o.status === 'confirmed');
  const completedFarmerOrders = farmerOrders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');

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
            Loading dashboard...
          </p>
        </div>
      ) : userRole === 'farmer' ? (
        /* ═══════════════════════════════════════════
           FARMER DASHBOARD
           ═══════════════════════════════════════════ */
        <div>
          {/* Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}>
            <StatCard title="ACTIVE LISTINGS" value={String(myFarmerListings.length)} color="var(--primary-900)" />
            <StatCard title="CROP QUANTITY LISTED" value={`${totalQuantityProduced.toLocaleString()} units`} color="var(--primary-700)" />
            <StatCard title="PENDING ORDERS" value={String(pendingFarmerOrders.length)} color="var(--secondary-600)" />
            <StatCard title="MIDDLEMAN FEES SAVED" value="100%" color="var(--primary-600)" />
          </div>

          {/* ── Incoming Orders ── */}
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-900)' }}>
            Incoming Orders ({farmerOrders.length})
          </h2>

          {ordersError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>⚠️ {ordersError}</div>
          )}
          {statusError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>⚠️ {statusError}</div>
          )}

          {farmerOrders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '3rem 1.5rem',
              border: '1px solid var(--border-light)',
              marginBottom: '2.5rem',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</div>
              <h3>No incoming orders yet</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0' }}>
                When buyers order your crops, their requests will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              {/* Pending first, then confirmed, then completed */}
              {[...pendingFarmerOrders, ...activeFarmerOrders, ...completedFarmerOrders].map((order) => {
                const statusMeta = STATUS_LABELS[order.status];
                const isUpdating = statusUpdating === order.id;
                return (
                  <div
                    key={order.id}
                    style={{
                      background: 'white',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ flex: '1 1 280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--primary-900)' }}>{order.cropName}</strong>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.6rem',
                          borderRadius: '12px',
                          color: statusMeta.color,
                          background: statusMeta.bg,
                        }}>
                          {statusMeta.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                        <span>🛒 Buyer: <strong>{order.buyerName}</strong></span>
                        <span style={{ margin: '0 0.75rem' }}>•</span>
                        <span>📦 {order.quantity} {order.unit}</span>
                        <span style={{ margin: '0 0.75rem' }}>•</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>NPR {order.totalPrice.toLocaleString()}</span>
                      </div>
                      {order.notes && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                          📝 {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      {order.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={isUpdating}
                            onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                          >
                            {isUpdating ? '...' : '✅ Confirm'}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={isUpdating}
                            style={{ color: '#cf1322' }}
                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          >
                            {isUpdating ? '...' : '❌ Decline'}
                          </button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={isUpdating}
                            onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          >
                            {isUpdating ? '...' : '📦 Mark Delivered'}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={isUpdating}
                            style={{ color: '#cf1322' }}
                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          >
                            {isUpdating ? '...' : '❌ Cancel'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Farmer Listings ── */}
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-900)' }}>Your Published Crop Listings</h2>

          {actionError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>⚠️ {actionError}</div>
          )}

          {myFarmerListings.length === 0 ? (
            <div style={{
              textAlign: 'center',
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '3rem 1.5rem',
              border: '1px solid var(--border-light)',
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
                  currentUserId={userProfile?.uid}
                  onEdit={startEditListing}
                  onDelete={(id) => setDeletingListingId(id)}
                />
              ))}
            </div>
          )}

          {/* ── Delete Confirmation Modal / Banner ── */}
          {deletingListingId && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}>
              <div style={{
                background: 'white',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                maxWidth: '450px',
                width: '100%',
                boxShadow: 'var(--shadow-md)',
              }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#cf1322' }}>
                  ⚠️ Delete Listing Confirmation
                </h3>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  Are you sure you want to delete this listing?
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setDeletingListingId(null)}
                    disabled={actionSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ backgroundColor: '#cf1322', borderColor: '#cf1322' }}
                    onClick={() => handleDeleteListing(deletingListingId)}
                    disabled={actionSubmitting}
                  >
                    {actionSubmitting ? 'Deleting...' : 'Delete Listing'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Edit Listing Form Modal ── */}
          {editingListing && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
              overflowY: 'auto',
            }}>
              <div style={{
                background: 'white',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-md)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--primary-900)', margin: 0 }}>
                    ✏️ Edit Crop Listing
                  </h3>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                    onClick={() => setEditingListing(null)}
                  >
                    ✕
                  </button>
                </div>

                {actionError && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    ⚠️ {actionError}
                  </div>
                )}

                <form onSubmit={handleSaveEdit} noValidate>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="edit-crop-name" className="form-label">Crop Name *</label>
                    <input
                      id="edit-crop-name"
                      type="text"
                      className="form-input"
                      value={editCropName}
                      onChange={(e) => setEditCropName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="edit-crop-quantity" className="form-label">Quantity Available *</label>
                      <input
                        id="edit-crop-quantity"
                        type="number"
                        min="1"
                        className="form-input"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-crop-unit" className="form-label">Unit *</label>
                      <select
                        id="edit-crop-unit"
                        className="form-select"
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                      >
                        <option value="kg">kg (किलोग्राम)</option>
                        <option value="quintal">quintal (कुन्टल)</option>
                        <option value="ton">ton (टन)</option>
                        <option value="sack">sack / bora (बोरा)</option>
                        <option value="crate">crate (क्रेट)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="edit-crop-price" className="form-label">Price Per Unit (NPR रु) *</label>
                      <input
                        id="edit-crop-price"
                        type="number"
                        min="1"
                        className="form-input"
                        value={editPricePerUnit}
                        onChange={(e) => setEditPricePerUnit(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-crop-location" className="form-label">Location / District *</label>
                      <input
                        id="edit-crop-location"
                        type="text"
                        className="form-input"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="edit-crop-contact" className="form-label">Contact Phone / Mobile Number *</label>
                    <input
                      id="edit-crop-contact"
                      type="tel"
                      className="form-input"
                      value={editContactInfo}
                      onChange={(e) => setEditContactInfo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="edit-crop-description" className="form-label">Crop Description (Optional)</label>
                    <textarea
                      id="edit-crop-description"
                      className="form-textarea"
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="edit-crop-image" className="form-label">Image URL (Optional)</label>
                    <input
                      id="edit-crop-image"
                      type="url"
                      className="form-input"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingListing(null)}
                      disabled={actionSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={actionSubmitting}
                    >
                      {actionSubmitting ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ═══════════════════════════════════════════
           BUYER DASHBOARD
           ═══════════════════════════════════════════ */
        <div>
          {/* Buyer summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}>
            <StatCard title="ORDERS PLACED" value={String(buyerOrders.length)} color="var(--primary-900)" />
            <StatCard title="PENDING" value={String(buyerOrders.filter((o) => o.status === 'pending').length)} color="var(--secondary-600)" />
            <StatCard title="DELIVERED" value={String(buyerOrders.filter((o) => o.status === 'delivered').length)} color="var(--primary-600)" />
            <StatCard title="SAVED FAVORITES" value={String(favoritedListings.length)} color="var(--primary-700)" />
          </div>

          {/* ── Buyer Orders ── */}
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-900)' }}>
            My Orders ({buyerOrders.length})
          </h2>

          {ordersError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>⚠️ {ordersError}</div>
          )}
          {statusError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>⚠️ {statusError}</div>
          )}

          {buyerOrders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '3rem 1.5rem',
              border: '1px solid var(--border-light)',
              marginBottom: '2.5rem',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛒</div>
              <h3>No orders yet</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
                Browse the marketplace and order crops directly from farmers.
              </p>
              <Link to="/listings" className="btn btn-primary">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              {buyerOrders.map((order) => {
                const statusMeta = STATUS_LABELS[order.status];
                const isUpdating = statusUpdating === order.id;
                return (
                  <div
                    key={order.id}
                    style={{
                      background: 'white',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ flex: '1 1 280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--primary-900)' }}>{order.cropName}</strong>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.6rem',
                          borderRadius: '12px',
                          color: statusMeta.color,
                          background: statusMeta.bg,
                        }}>
                          {statusMeta.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                        <span>👨‍🌾 Farmer: <strong>{order.farmerName}</strong></span>
                        <span style={{ margin: '0 0.75rem' }}>•</span>
                        <span>📦 {order.quantity} {order.unit}</span>
                        <span style={{ margin: '0 0.75rem' }}>•</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>NPR {order.totalPrice.toLocaleString()}</span>
                      </div>
                      {order.notes && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                          📝 {order.notes}
                        </div>
                      )}
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Ordered: {new Date(order.createdAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    {/* Buyers can cancel their own pending orders */}
                    {order.status === 'pending' && (
                      <div>
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={isUpdating}
                          style={{ color: '#cf1322' }}
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        >
                          {isUpdating ? '...' : '❌ Cancel Order'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Saved Favorites ── */}
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-900)' }}>
            Saved Favorites ({favoritedListings.length})
          </h2>

          {favoritedListings.length === 0 ? (
            <div style={{
              textAlign: 'center',
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '3rem 1.5rem',
              border: '1px solid var(--border-light)',
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
                <ListingCard key={crop.id} listing={crop} isFavorited={true} canFavorite={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
};

/* ── Reusable stat card ── */
const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div style={{
    background: 'white',
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border-light)',
  }}>
    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{title}</div>
    <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
  </div>
);
