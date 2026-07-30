import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
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

export async function getAllListings(): Promise<CropListing[]> {
  try {
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
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
    
    // Combine with custom locally stored listings if any, or seed default items
    const localSaved = localStorage.getItem('krishi_sathi_local_listings');
    const customListings: CropListing[] = localSaved ? JSON.parse(localSaved) : [];
    
    const combined = [...customListings, ...results];
    if (combined.length === 0) {
      return MOCK_NEPAL_LISTINGS;
    }
    return combined;
  } catch (error) {
    console.warn('Firestore listing fetch fallback to mock datasets:', error);
    const localSaved = localStorage.getItem('krishi_sathi_local_listings');
    const customListings: CropListing[] = localSaved ? JSON.parse(localSaved) : [];
    return [...customListings, ...MOCK_NEPAL_LISTINGS];
  }
}

export async function addListing(listingData: Omit<CropListing, 'id' | 'createdAt'>): Promise<CropListing> {
  const newListing: CropListing = {
    ...listingData,
    id: 'listing-' + Date.now(),
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, 'listings'), {
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
    });
    newListing.id = docRef.id;
  } catch (error) {
    console.warn('Firestore add listing fallback to local state:', error);
  }

  // Always save locally so offline / demo mode retains new farmer posts
  const existing = localStorage.getItem('krishi_sathi_local_listings');
  const customListings: CropListing[] = existing ? JSON.parse(existing) : [];
  customListings.unshift(newListing);
  localStorage.setItem('krishi_sathi_local_listings', JSON.stringify(customListings));

  return newListing;
}

export async function getListingsByFarmer(farmerId: string): Promise<CropListing[]> {
  const all = await getAllListings();
  return all.filter((l) => l.farmerId === farmerId);
}

export async function getListingById(id: string): Promise<CropListing | null> {
  const all = await getAllListings();
  return all.find((l) => l.id === id) || null;
}
