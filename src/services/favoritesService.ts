import { collection, addDoc, deleteDoc, getDocs, query, where, doc } from 'firebase/firestore';
import { db } from './firebase';
import type { Favorite } from '../models/favorite';

const DEMO_FAV_KEY = 'krishi_sathi_user_favorites';

export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  try {
    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const results: Favorite[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      results.push({
        id: docSnap.id,
        userId: data.userId,
        listingId: data.listingId,
        createdAt: data.createdAt
      });
    });

    const localFavs: Favorite[] = JSON.parse(localStorage.getItem(`${DEMO_FAV_KEY}_${userId}`) || '[]');
    // Merge remote and local without duplicates
    const combinedMap = new Map<string, Favorite>();
    [...results, ...localFavs].forEach((item) => combinedMap.set(item.listingId, item));
    return Array.from(combinedMap.values());
  } catch (error) {
    const localFavs: Favorite[] = JSON.parse(localStorage.getItem(`${DEMO_FAV_KEY}_${userId}`) || '[]');
    return localFavs;
  }
}

export async function toggleFavoriteItem(userId: string, listingId: string): Promise<boolean> {
  const currentFavs = await getUserFavorites(userId);
  const existing = currentFavs.find((f) => f.listingId === listingId);

  if (existing) {
    // Remove favorite
    try {
      if (existing.id && !existing.id.startsWith('fav-local-')) {
        await deleteDoc(doc(db, 'favorites', existing.id));
      }
    } catch (e) {
      console.warn('Firestore remove favorite warning:', e);
    }
    const updated = currentFavs.filter((f) => f.listingId !== listingId);
    localStorage.setItem(`${DEMO_FAV_KEY}_${userId}`, JSON.stringify(updated));
    return false; // Now unfavorited
  } else {
    // Add favorite
    const newFav: Favorite = {
      id: 'fav-local-' + Date.now(),
      userId,
      listingId,
      createdAt: new Date().toISOString()
    };
    try {
      const docRef = await addDoc(collection(db, 'favorites'), {
        userId: newFav.userId,
        listingId: newFav.listingId,
        createdAt: newFav.createdAt
      });
      newFav.id = docRef.id;
    } catch (e) {
      console.warn('Firestore add favorite warning:', e);
    }
    const updated = [...currentFavs, newFav];
    localStorage.setItem(`${DEMO_FAV_KEY}_${userId}`, JSON.stringify(updated));
    return true; // Now favorited
  }
}
