import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../viewmodels/useAuth';
import type { UserRole } from '../../models/user';

interface RoleGuardProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ requiredRole, children }) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--primary-700)', fontWeight: 600 }}>Checking permissions...</p>
      </div>
    );
  }

  if (userProfile && userProfile.role !== requiredRole) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-md)',
          padding: '3rem 2rem',
          maxWidth: '560px',
          margin: '0 auto',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🌾⛔</div>
          <h2 style={{ color: 'var(--primary-900)', marginBottom: '0.75rem' }}>Farmer Account Required</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
            Only verified <strong>Farmer</strong> accounts are permitted to post crop listings on Krishi Sathi. Your account is registered as a <strong>Buyer</strong>.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/listings" className="btn btn-primary">
              Browse Crop Marketplace
            </Link>
            <Link to="/dashboard" className="btn btn-secondary">
              Go to Buyer Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
