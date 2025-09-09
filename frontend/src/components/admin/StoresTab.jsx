import React from 'react';
import { Search, Eye, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const StoresTab = ({ 
  stores, 
  searchTerm, 
  setSearchTerm, 
  onViewStore,
  onDeleteStore 
}) => {
  return (
    <div className="space-y-6">
      <Card className="p-4 bg-card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
        </div>
      </Card>

      <Card className="bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Store</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">{store.name}</p>
                      <p className="text-sm text-muted-foreground">{store.email || 'No email'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{store.owner_username || store.owner_email || 'No owner'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{store.address || 'No address'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-sm text-foreground">
                        {parseFloat(store.average_rating || 0).toFixed(1)} ⭐
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewStore(store)}
                        className="text-blue-600 hover:text-blue-700 border-blue-200"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteStore(store.id)}
                        className="text-red-600 hover:text-red-700 border-red-200"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StoresTab;
