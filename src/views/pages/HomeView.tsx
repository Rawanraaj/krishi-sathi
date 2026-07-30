import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../viewmodels/useAuth';

export const HomeView: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <div>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)',
        color: 'white',
        padding: '5rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            padding: '0.4rem 1.2rem',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            color: '#a7f3d0',
            border: '1px solid rgba(167, 243, 208, 0.3)'
          }}>
            🌾 Empowering Nepal's Agricultural Economy
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem', lineHeight: 1.2 }}>
            Direct Farmer-to-Buyer Crop Marketplace for Nepal
          </h1>

          <p style={{ fontSize: '1.25rem', color: '#d1fae5', maxWidth: '750px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Eliminating middlemen so Nepalese farmers earn fair market prices and buyers get fresh crops straight from local farms across Nepal.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/listings" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.1rem' }}>
              Explore Crop Marketplace 🛒
            </Link>
            {!userProfile && (
              <Link to="/signup" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1.1rem' }}>
                Join as Farmer or Buyer 🌾
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Value Proposition Cards */}
      <section className="page-wrapper" style={{ marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-light)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚜</div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-900)' }}>Direct Farmer Pricing</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Farmers set their own prices for rice, apples, cardamoms, vegetables, and spices without middleman cuts.
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-light)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📍</div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-900)' }}>District-Wise Location</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Filter crops from Chitwan, Jhapa, Mustang, Kaski, Dhading, Ilam, and all 77 districts of Nepal easily.
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-light)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📞</div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-900)' }}>Instant Phone Connection</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Buyers can contact farmers directly via phone to negotiate bulk transport or arrange farm pickup.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="page-wrapper" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary-900)', marginBottom: '0.5rem' }}>How Krishi Sathi Works</h2>
          <p style={{ color: 'var(--text-muted)' }}>Simple, transparent, and built for local communities in Nepal</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{
            background: 'var(--primary-50)',
            border: '1px solid var(--primary-100)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem'
          }}>
            <h3 style={{ color: 'var(--primary-800)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🌾</span> For Farmers (किसानहरूका लागि)
            </h3>
            <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', lineHeight: 1.8 }}>
              <li>Create a free Farmer Account.</li>
              <li>Post crop details (Crop name, Quantity, Price/unit, District, Contact phone).</li>
              <li>Receive direct phone calls from wholesale buyers or retailers.</li>
              <li>Earn 100% of your crop's real market value!</li>
            </ol>
          </div>

          <div style={{
            background: 'var(--secondary-50)',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '2rem'
          }}>
            <h3 style={{ color: 'var(--secondary-600)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🛒</span> For Buyers (खरिदकर्ताहरूका लागि)
            </h3>
            <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', lineHeight: 1.8 }}>
              <li>Browse live crop listings across districts of Nepal.</li>
              <li>Filter by crop name or location (e.g., Chitwan, Mustang).</li>
              <li>Save favorite crop listings to your personal dashboard.</li>
              <li>Call farmers directly to order fresh produce at fair rates.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
};
