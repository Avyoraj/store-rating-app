import React, { useState } from 'react';
import { X, Edit2, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { adminAPI } from '../../services/api';
import { toast } from '../ui/use-toast';

const StoreDetailsModal = ({ 
  isOpen, 
  onClose, 
  store, 
  onStoreUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: store?.name || '',
    description: store?.description || '',
    address: store?.address || '',
    phone: store?.phone || '',
    email: store?.email || '',
    category_id: store?.category_id || 1
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !store) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.updateStore(store.id, editForm);
      if (response.success) {
        onStoreUpdate(response.data);
        setIsEditing(false);
        toast({ 
          title: "Success", 
          description: "Store updated successfully" 
        });
      }
    } catch (error) {
      console.error("Error updating store:", error);
      toast({ 
        title: "Error", 
        description: error.response?.data?.error?.message || "Failed to update store",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: store.name,
      description: store.description,
      address: store.address,
      phone: store.phone,
      email: store.email,
      category_id: store.category_id
    });
    setIsEditing(false);
  };

  const getCategoryName = (categoryId) => {
    const categories = {
      1: 'Restaurant',
      2: 'Retail',
      3: 'Grocery',
      4: 'Health & Beauty',
      5: 'Automotive',
      6: 'Home & Garden',
      7: 'Entertainment',
      8: 'Services',
      9: 'Sports & Recreation',
      10: 'Education'
    };
    return categories[categoryId] || 'Unknown';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Store Details</h3>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{store.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            {isEditing ? (
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{store.description || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            {isEditing ? (
              <textarea
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{store.address || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{store.phone || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{store.email || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            {isEditing ? (
              <select
                value={editForm.category_id}
                onChange={(e) => setEditForm({ ...editForm, category_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>Restaurant</option>
                <option value={2}>Retail</option>
                <option value={3}>Grocery</option>
                <option value={4}>Health & Beauty</option>
                <option value={5}>Automotive</option>
                <option value={6}>Home & Garden</option>
                <option value={7}>Entertainment</option>
                <option value={8}>Services</option>
                <option value={9}>Sports & Recreation</option>
                <option value={10}>Education</option>
              </select>
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{getCategoryName(store.category_id)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {parseFloat(store.average_rating || 0).toFixed(1)} ⭐ ({store.total_reviews || 0} reviews)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {store.owner_username || store.owner_email || 'No owner assigned'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {store.created_at ? new Date(store.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailsModal;
