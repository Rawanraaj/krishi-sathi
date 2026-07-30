import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>🌾 Krishi Sathi (कृषि साथी)</h3>
          <p>Connecting Nepali Farmers Directly to Buyers & Wholesale Traders</p>
        </div>
        <div style={{ color: '#a7f3d0', fontSize: '0.9rem' }}>
          <span>Empowering Nepal's Agriculture • Zero Middleman Fees</span>
        </div>
      </div>
      <div className="footer-copyright">
        &copy; {new Date().getFullYear()} Krishi Sathi Nepal. Built for Nepalese farmers and buyers.
      </div>
    </footer>
  );
};
