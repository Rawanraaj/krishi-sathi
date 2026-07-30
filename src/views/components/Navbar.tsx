import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../viewmodels/useAuth';

export const Navbar: React.FC = () => {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-logo">
          <div className="logo-icon">🌾</div>
          <span>Krishi Sathi</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink to="/listings" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Marketplace
          </NavLink>

          {userProfile && (
            <>
              {userProfile.role === 'farmer' && (
                <NavLink to="/listings/new" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  + Post Crop
                </NavLink>
              )}
              <NavLink to="/favorites" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Favorites
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Dashboard
              </NavLink>
            </>
          )}

          {userProfile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="user-badge">
                <span>{userProfile.email.split('@')[0]}</span>
                <span className={`role-tag ${userProfile.role}`}>
                  {userProfile.role === 'farmer' ? '🌾 Farmer' : '🛒 Buyer'}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Join Marketplace
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
