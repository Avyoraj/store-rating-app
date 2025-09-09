import React, { useState } from 'react';
import { X, Edit2, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';

const UserDetailsModal = ({ 
  isOpen, 
  onClose, 
  user
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    role: user?.role || 'user'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      // Note: The backend doesn't support general user updates
      // Only status updates are supported via the status endpoint
      toast({ 
        title: "Info", 
        description: "User updates are currently not supported. Only status changes are available.",
        variant: "destructive" 
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({ 
        title: "Error", 
        description: "Failed to update user",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">User Details</h3>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={true}
                title="Editing is currently not supported"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user.address || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <span className={`px-2 py-1 text-xs rounded-full ${
              user.role === 'admin' ? 'bg-red-100 text-red-800' :
              user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user.role}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`px-2 py-1 text-xs rounded-full ${
              user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>

          {user.role === 'owner' && user.owned_stores && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owned Stores</label>
              <div className="space-y-2">
                {user.owned_stores.map((store, index) => (
                  <div key={index} className="bg-gray-50 px-3 py-2 rounded-lg">
                    <p className="font-medium">{store.name}</p>
                    <p className="text-sm text-gray-600">Rating: {store.average_rating}/5</p>
                    <p className="text-sm text-gray-600">Reviews: {store.total_reviews}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.reviews_given && user.reviews_given > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reviews Written</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {user.reviews_given} reviews
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
