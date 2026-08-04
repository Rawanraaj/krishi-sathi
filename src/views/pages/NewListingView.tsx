import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../viewmodels/useAuth';
import { useListings } from '../../viewmodels/useListings';

export const NewListingView: React.FC = () => {
  const { userProfile } = useAuth();
  const { postListing } = useListings();
  const navigate = useNavigate();

  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unit, setUnit] = useState('kg');
  const [pricePerUnit, setPricePerUnit] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);

    if (!cropName || !quantity || !pricePerUnit || !location || !contactInfo) {
      setError('Please complete all required fields (Crop Name, Quantity, Price, Location, Contact Info).');
      return;
    }

    if (!userProfile) {
      setError('You must be logged in as a farmer to post a listing.');
      return;
    }

    setSubmitting(true);
    try {
      await postListing({
        farmerId: userProfile.uid,
        farmerName: userProfile.email.split('@')[0] || 'Farmer',
        cropName,
        quantity: Number(quantity),
        unit,
        pricePerUnit: Number(pricePerUnit),
        location,
        contactInfo,
        description,
        imageUrl: imageUrl || undefined
      });

      navigate('/listings');
    } catch (err: any) {
      console.error('Submit crop listing error:', err);
      setError(err?.message || 'Failed to publish listing. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <main className="page-wrapper">
      <div className="form-card" style={{ maxWidth: '650px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌾📦</div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Post a New Crop Listing
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Connect directly to wholesale buyers without middleman fees
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="new-crop-name" className="form-label">
              Crop Name *
            </label>
            <input
              id="new-crop-name"
              type="text"
              className="form-input"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="e.g. Organic Cauliflower (काउली), Mansuli Rice..."
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="new-crop-quantity" className="form-label">
                Quantity Available *
              </label>
              <input
                id="new-crop-quantity"
                type="number"
                min="1"
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 500"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-crop-unit" className="form-label">
                Unit *
              </label>
              <select
                id="new-crop-unit"
                className="form-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="kg">kg (किलोग्राम)</option>
                <option value="quintal">quintal (कुन्टल)</option>
                <option value="ton">ton (टन)</option>
                <option value="sack">sack / bora (बोरा)</option>
                <option value="crate">crate (क्रेट)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="new-crop-price" className="form-label">
                Price Per Unit (NPR रु) *
              </label>
              <input
                id="new-crop-price"
                type="number"
                min="1"
                className="form-input"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 65"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-crop-location" className="form-label">
                Location / District *
              </label>
              <input
                id="new-crop-location"
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Chitwan, Jhapa, Pokhara..."
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="new-crop-contact" className="form-label">
              Contact Phone / Mobile Number *
            </label>
            <input
              id="new-crop-contact"
              type="tel"
              className="form-input"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="+977 98XXXXXXXX"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-crop-description" className="form-label">
              Crop Description (Optional)
            </label>
            <textarea
              id="new-crop-description"
              className="form-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe crop quality, harvest date, organic certification, or transport options..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-crop-image" className="form-label">
              Image URL (Optional)
            </label>
            <input
              id="new-crop-image"
              type="url"
              className="form-input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/crop-photo.jpg"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={submitting}
          >
            {submitting ? 'Publishing Listing...' : 'Publish Crop Listing 🌾'}
          </button>
        </form>
      </div>
    </main>
  );
};
