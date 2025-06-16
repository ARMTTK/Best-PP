import React, { useState, useEffect } from 'react';
import { ParkingSpotCard } from '../components/ParkingSpotCard';
import { SearchFilters } from '../components/SearchFilters';
import { database } from '../data/database';
import { ParkingSpot } from '../types';
import { Map, Grid } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<ParkingSpot[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadParkingSpots();
  }, []);

  const loadParkingSpots = async () => {
    try {
      const allSpots = await database.getAllParkingSpots();
      setSpots(allSpots);
      setFilteredSpots(allSpots);
    } catch (error) {
      console.error('Error loading parking spots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredSpots(spots);
      return;
    }

    const filtered = spots.filter(spot =>
      spot.name.toLowerCase().includes(query.toLowerCase()) ||
      spot.address.toLowerCase().includes(query.toLowerCase()) ||
      spot.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSpots(filtered);
  };

  const handleFilter = (filters: any) => {
    console.log('Applying filters:', filters);
    // In a real app, this would apply filters
    // For now, we'll just keep the current spots
    setFilteredSpots(spots);
  };

  const handleFindNearMe = () => {
    console.log('Finding spots near user location');
    // In a real app, this would use GPS to find nearby spots
    alert('Location-based search would be implemented here using GPS and mapping services.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading parking spots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Perfect Parking Spots
          </h1>
          <p className="text-gray-600">
            Discover and book parking spaces near you with ease
          </p>
        </div>

        <SearchFilters
          onSearch={handleSearch}
          onFilter={handleFilter}
          onFindNearMe={handleFindNearMe}
        />

        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-gray-600">
              Found {filteredSpots.length} parking spot{filteredSpots.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Map className="h-4 w-4" />
              <span>Map</span>
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          filteredSpots.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpots.map((spot) => (
                <ParkingSpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Grid className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No parking spots found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or check back later for new listings.
              </p>
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Interactive Map View
            </h3>
            <p className="text-gray-600 mb-4">
              Map integration would be implemented here using Google Maps API
            </p>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <span className="text-gray-500">Google Maps Integration</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};