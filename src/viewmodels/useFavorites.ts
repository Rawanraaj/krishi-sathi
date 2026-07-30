import { useState, useEffect, useCallback } from 'react';
import type { Favorite } from '../models/favorite';
import type { CropListing } from '../models/listing';
import { getUserFavorites, toggleFavoriteItem } from '../services/favoritesService';
import { getAllListings } from '../services/listingsService';
import { useAuth } from './useAuth';

export function useFavorites() {
  const { userProfile } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoritedListings, setFavoritedListings] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadFavorites = useCallback(async () => {
    if (!userProfile?.uid) {
      setFavorites([]);
      setFavoritedListings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const favs = await getUserFavorites(userProfile.uid);
      setFavorites(favs);

      const allCrops = await getAllListings();
      const favSet = new Set(favs.map((f) => f.listingId));
      const matched = allCrops.filter((crop) => favSet.has(crop.id));
      setFavoritedListings(matched);
    } catch (e) {
      console.error('Failed loading favorites:', e);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.uid]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = async (listingId: string) => {
    if (!userProfile?.uid) return false;
    
    // Optimistic toggle
    const isCurrentlyFav = favorites.some((f) => f.listingId === listingId);
    
    try {
      const isNowFav = await toggleFavoriteItem(userProfile.uid, listingId);
      await loadFavorites();
      return isNowFav;
    } catch (e) {
      console.error('Toggle favorite failed:', e);
      return isCurrentlyFav;
    }
  };

  const isFavorited = (listingId: string): boolean => {
    return favorites.some((f) => f.listingId === listingId);
  };

  return {
    favorites,
    favoritedListings,
    loading,
    toggleFavorite,
    isFavorited,
    refresh: loadFavorites
  };
}
