import React, { useState, useEffect } from 'react';
import { Search, MapPin, SortAsc, SortDesc, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button, Input, Card, LoadingSpinner } from '../components/UI';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';

const StoresPage = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      console.log('Fetching stores...');
      const response = await api.get('/stores');
      console.log('Stores API response:', response.data);
      
      // Handle the correct API response structure
      const storesData = response.data.data?.stores || response.data.data || [];
      console.log('Processed stores data:', storesData);
      console.log('Store IDs:', storesData.map(store => ({ id: store.id, name: store.name })));
      setStores(storesData);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStoreClick = (storeId) => {
    navigate(`/store/${storeId}`);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedStores = stores
    .filter(store => 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'average_rating') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Stores</h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search stores by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('name')}
                className="flex items-center gap-2"
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('average_rating')}
                className="flex items-center gap-2"
              >
                Rating {sortBy === 'average_rating' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Store Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAndSortedStores.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedStores.map((store) => {
              const averageRating = parseFloat(store.average_rating) || 0;
              
              return (
                <Card 
                  key={store.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleStoreClick(store.id)}
                  noPadding
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {store.name}
                      </h3>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm line-clamp-2">{store.address}</span>
                    </div>

                    {/* Overall Rating */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700">Rating:</span>
                      <div className="flex items-center gap-2">
                        <StarRating 
                          value={averageRating} 
                          readonly 
                          size="sm"
                          showValue
                        />
                        <span className="text-xs text-gray-500">
                          ({store.total_reviews || 0} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Call to action */}
                    <div className="text-center">
                      <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
                        Click to view details & rate →
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoresPage;
