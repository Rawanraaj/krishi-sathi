import { useState, useEffect, useMemo, useCallback } from 'react';
import type { CropListing } from '../models/listing';
import { getAllListings, addListing } from '../services/listingsService';

export function useListings() {
  const [listings, setListings] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllListings();
      setListings(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load crop listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const uniqueLocations = useMemo(() => {
    const locSet = new Set<string>();
    listings.forEach((item) => {
      locSet.add(item.location);
    });
    return Array.from(locSet);
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesName = item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLoc = !selectedLocation || item.location.toLowerCase().includes(selectedLocation.toLowerCase());
      return matchesName && matchesLoc;
    });
  }, [listings, searchQuery, selectedLocation]);

  const postListing = async (newCrop: Omit<CropListing, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const created = await addListing(newCrop);
      setListings((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      setError(err?.message || 'Failed to post new crop listing');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    listings,
    filteredListings,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedLocation,
    setSelectedLocation,
    locations: uniqueLocations,
    postListing,
    refresh: loadListings
  };
}
