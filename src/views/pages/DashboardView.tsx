import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../viewmodels/useDashboard';
import { useOrders } from '../../viewmodels/useOrders';
import { ListingCard } from '../components/ListingCard';
import type { OrderStatus } from '../../models/order';

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: '⏳ Pending',   color: '#8c6b00', bg: '#fffbe6' },
  confirmed: { label: '✅ Confirmed', color: '#0050b3', bg: '#e6f7ff' },
  delivered: { label: '📦 Delivered', color: '#065f46', bg: '#ecfdf5' },
  cancelled: { label: '❌ Cancelled', color: '#cf1322', bg: '#fff2f0' },
};

export const DashboardView: React.FC = () => {
  const {
    userRole,
    userEmail,
    myFarmerListings,
    favoritedListings,
    totalQuantityProduced,
    loading: dashLoading,
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
                <ListingCard key={crop.id} listing={crop} canFavorite={false} />
              ))}
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
