import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { CropListing } from '../models/listing';

const MOCK_NEPAL_LISTINGS: CropListing[] = [
  {
    id: 'crop-101',
    farmerId: 'farmer-ramesh',
    farmerName: 'Ramesh Adhikari',
    cropName: 'Chitwan Organic Cauliflower (काउली)',
    quantity: 500,
    unit: 'kg',
    pricePerUnit: 65,
    location: 'Chitwan (चितवन)',
    contactInfo: '+977 9845012345',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    description: 'Freshly harvested pesticide-free white cauliflowers from Bharatpur farms.',
    imageUrl: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'crop-102',
    farmerId: 'farmer-sita',
    farmerName: 'Sita Sharma',
    cropName: 'Jhapa Premium Mansuli Paddy / Rice (धान)',
    quantity: 25,
    unit: 'quintal',
    pricePerUnit: 3400,
    location: 'Jhapa (झापा)',
    contactInfo: '+977 9812345678',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    description: 'High-grade aromatic Mansuli rice, directly from Birtamode paddy fields.',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'crop-103',
    farmerId: 'farmer-pasang',
    farmerName: 'Pasang Sherpa',
    cropName: 'Mustang Sweet Organic Apples (स्याउ)',
    quantity: 120,
    unit: 'kg',
    pricePerUnit: 220,
    location: 'Mustang (मुस्ताङ)',
    contactInfo: '+977 9801122334',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    description: 'Crisp and natural Marpha orchard apples grown in high mountain climate.',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'crop-104',
    farmerId: 'farmer-hari',
    farmerName: 'Hari Bahadur Shrestha',
    cropName: 'Dhading Red Hybrid Tomatoes (गोलभेडा)',
    quantity: 800,
    unit: 'kg',
    pricePerUnit: 45,
    location: 'Dhading (धादिङ)',
    contactInfo: '+977 9851098765',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    description: 'Firm and juicy tomatoes ready for immediate wholesale delivery to Kathmandu valley.',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'crop-105',
    farmerId: 'farmer-gita',
    farmerName: 'Gita Thapa',
    cropName: 'Ilam Large Black Cardamom / Alaichi (अलैंची)',
    quantity: 40,
    unit: 'kg',
    pricePerUnit: 1250,
    location: 'Ilam (इलाम)',
    contactInfo: '+977 9842033445',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    description: 'Export quality sun-dried black cardamom harvested from Ilam hills.',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'crop-106',
    farmerId: 'farmer-ramesh',
    farmerName: 'Ramesh Adhikari',
    cropName: 'Kaski Fresh Potatoes (आलु)',
    quantity: 1500,
    unit: 'kg',
    pricePerUnit: 38,
    location: 'Kaski (कास्की)',
    contactInfo: '+977 9845012345',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    description: 'Clean red potatoes grown in Hemja fertile soil.',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'
  }
];

/**
 * Timeout helper function to prevent Firestore network operations from hanging indefinitely.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Firestore operation timed out after ${timeoutMs / 1000}s.`));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function getAllListings(): Promise<CropListing[]> {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const isFirebaseConfigured = Boolean(apiKey && apiKey !== 'demo-api-key' && apiKey.trim() !== '');

  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
      const snapshot = await withTimeout(getDocs(q), 5000);
      const results: CropListing[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        results.push({
          id: docSnap.id,
          farmerId: data.farmerId,
          farmerName: data.farmerName || 'Farmer',
          cropName: data.cropName,
          quantity: data.quantity,
          unit: data.unit,
          pricePerUnit: data.pricePerUnit,
          location: data.location,
          contactInfo: data.contactInfo,
          createdAt: data.createdAt,
          description: data.description,
          imageUrl: data.imageUrl
        });
      });
      
      const localSaved = localStorage.getItem('krishi_sathi_local_listings');
      const customListings: CropListing[] = localSaved ? JSON.parse(localSaved) : [];
      
      const combined = [...customListings, ...results];
      if (combined.length === 0) {
        return MOCK_NEPAL_LISTINGS;
      }
      return combined;
    } catch (error) {
      console.error('Firestore getAllListings failed or timed out:', error);
      const localSaved = localStorage.getItem('krishi_sathi_local_listings');
      const customListings: CropListing[] = localSaved ? JSON.parse(localSaved) : [];
      return [...customListings, ...MOCK_NEPAL_LISTINGS];
    }
  }

  // Demo fallback
  const localSaved = localStorage.getItem('krishi_sathi_local_listings');
  const customListings: CropListing[] = localSaved ? JSON.parse(localSaved) : [];
  return [...customListings, ...MOCK_NEPAL_LISTINGS];
}

export async function addListing(listingData: Omit<CropListing, 'id' | 'createdAt'>): Promise<CropListing> {
  const newListing: CropListing = {
    ...listingData,
    id: 'listing-' + Date.now(),
    createdAt: new Date().toISOString()
  };

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const isFirebaseConfigured = Boolean(apiKey && apiKey !== 'demo-api-key' && apiKey.trim() !== '');

  if (isFirebaseConfigured) {
    try {
      const docRef = await withTimeout(
        addDoc(collection(db, 'listings'), {
          farmerId: newListing.farmerId,
          farmerName: newListing.farmerName || 'Farmer',
          cropName: newListing.cropName,
          quantity: newListing.quantity,
          unit: newListing.unit,
          pricePerUnit: newListing.pricePerUnit,
          location: newListing.location,
          contactInfo: newListing.contactInfo,
          createdAt: newListing.createdAt,
          description: newListing.description || '',
          imageUrl: newListing.imageUrl || ''
        }),
        5000
      );
      newListing.id = docRef.id;
      return newListing;
    } catch (error: any) {
      console.error('Firestore addListing failed:', error);
      if (error?.code === 'permission-denied') {
        throw new Error('Firestore security rules blocked publishing this listing (permission-denied).');
      }
      console.warn('Falling back to local listing storage due to Firestore write error.');
    }
  } else {
    console.info('Firebase API key not set in .env. Saving crop listing locally for demo.');
  }

  // Save to local storage only when Firebase is unconfigured or failed
  const existing = localStorage.getItem('krishi_sathi_local_listings');
  const customListings: CropListing[] = existing ? JSON.parse(existing) : [];
  customListings.unshift(newListing);
  localStorage.setItem('krishi_sathi_local_listings', JSON.stringify(customListings));

  return newListing;
}

export async function updateListing(
  listingId: string,
  updatedFields: Partial<Omit<CropListing, 'id' | 'farmerId' | 'createdAt'>>
): Promise<CropListing> {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const isFirebaseConfigured = Boolean(apiKey && apiKey !== 'demo-api-key' && apiKey.trim() !== '');

  if (isFirebaseConfigured && !listingId.startsWith('crop-') && !listingId.startsWith('listing-')) {
    try {
      await withTimeout(
        updateDoc(doc(db, 'listings', listingId), updatedFields),
        5000
      );
    } catch (error: any) {
      console.error('Firestore updateListing failed:', error);
      if (error?.code === 'permission-denied') {
        throw new Error('Firestore security rules blocked updating this listing (permission-denied).');
      }
      console.warn('Falling back to local listing storage due to Firestore update error.');
    }
  }

  // Update local storage representation if stored locally or as local override
  const existing = localStorage.getItem('krishi_sathi_local_listings');
  const customListings: CropListing[] = existing ? JSON.parse(existing) : [];
  const idx = customListings.findIndex((l) => l.id === listingId);

  if (idx >= 0) {
    customListings[idx] = { ...customListings[idx], ...updatedFields };
    localStorage.setItem('krishi_sathi_local_listings', JSON.stringify(customListings));
    return customListings[idx];
  } else {
    // If it's a mock item or remote item not in local storage yet, create/update local override copy
    const all = await getAllListings();
    const current = all.find((l) => l.id === listingId);
    if (!current) {
      throw new Error('Listing not found');
    }
    const updated: CropListing = { ...current, ...updatedFields };
    customListings.unshift(updated);
    localStorage.setItem('krishi_sathi_local_listings', JSON.stringify(customListings));
    return updated;
  }
}

export async function deleteListing(listingId: string): Promise<void> {
  console.log(`[deleteListing] Deleting listing document with ID: "${listingId}"`);

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const isFirebaseConfigured = Boolean(apiKey && apiKey !== 'demo-api-key' && apiKey.trim() !== '');

  if (isFirebaseConfigured && !listingId.startsWith('crop-') && !listingId.startsWith('listing-')) {
    try {
      await withTimeout(
        deleteDoc(doc(db, 'listings', listingId)),
        5000
      );
      console.log(`[deleteListing] Firestore deleteDoc successfully executed for ID: "${listingId}"`);
    } catch (error: any) {
      console.error('Firestore deleteListing failed:', error);
      if (error?.code === 'permission-denied') {
        throw new Error('Firestore security rules blocked deleting this listing (permission-denied).');
      }
      console.warn('Falling back to local listing deletion due to Firestore delete error.');
    }
  }

  // Remove from local storage
  const existing = localStorage.getItem('krishi_sathi_local_listings');
  if (existing) {
    const customListings: CropListing[] = JSON.parse(existing);
    const filtered = customListings.filter((l) => l.id !== listingId);
    localStorage.setItem('krishi_sathi_local_listings', JSON.stringify(filtered));
  }
}

export async function getListingsByFarmer(farmerId: string): Promise<CropListing[]> {
  const all = await getAllListings();
  return all.filter((l) => l.farmerId === farmerId);
}

export async function getListingById(id: string): Promise<CropListing | null> {
  const all = await getAllListings();
  return all.find((l) => l.id === id) || null;
}
