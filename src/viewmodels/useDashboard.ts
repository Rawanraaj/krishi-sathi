import { useState, useEffect, useCallback } from 'react';
import type { CropListing } from '../models/listing';
import { getListingsByFarmer } from '../services/listingsService';
import { useAuth } from './useAuth';
import { useFavorites } from './useFavorites';

export function useDashboard() {
  const { userProfile, loading: authLoading } = useAuth();
  const { favoritedListings, loading: favLoading, refresh: refreshFavs } = useFavorites();
  
  const [myFarmerListings, setMyFarmerListings] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDashboardData = useCallback(async () => {
    if (!userProfile) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (userProfile.role === 'farmer') {
        const crops = await getListingsByFarmer(userProfile.uid);
        setMyFarmerListings(crops);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (!authLoading) {
      loadDashboardData();
    }
  }, [authLoading, loadDashboardData]);

  const totalQuantityProduced = myFarmerListings.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);

  return {
    userRole: userProfile?.role || 'buyer',
    userEmail: userProfile?.email || '',
    myFarmerListings,
    favoritedListings,
    totalQuantityProduced,
    loading: loading || authLoading || favLoading,
    refresh: () => {
      loadDashboardData();
      refreshFavs();
    }
  };
}
