import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../viewmodels/useAuth';
import type { UserRole } from '../../models/user';

export const SignupView: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password, role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Sign up failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-wrapper">
      <div className="form-card" style={{ maxWidth: '560px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌱</div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Join Krishi Sathi
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Create an account as a Farmer or Crop Buyer
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" id="role-select-label">
              Select Your Role
            </label>
            <div className="role-selector" aria-labelledby="role-select-label">
              <div
                className={`role-option ${role === 'farmer' ? 'selected' : ''}`}
                onClick={() => setRole('farmer')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setRole('farmer')}
              >
                <div style={{ fontSize: '1.8rem' }}>🌾</div>
                <h4>Farmer</h4>
                <p>I want to sell my crops directly</p>
              </div>

              <div
                className={`role-option ${role === 'buyer' ? 'selected' : ''}`}
                onClick={() => setRole('buyer')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setRole('buyer')}
              >
                <div style={{ fontSize: '1.8rem' }}>🛒</div>
                <h4>Buyer</h4>
                <p>I want to buy fresh crops</p>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-email" className="form-label">
              Email Address
            </label>
            <input
              id="signup-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password" className="form-label">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm-password" className="form-label">
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : `Register as ${role === 'farmer' ? 'Farmer 🌾' : 'Buyer 🛒'}`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-700)', fontWeight: 600 }}>
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
};
