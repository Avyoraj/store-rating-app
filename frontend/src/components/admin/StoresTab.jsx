import React from 'react';
import { Card } from '../UI';
import StarRating from '../StarRating';

const StoresTab = ({ stores }) => {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stores.map((store) => (
              <tr key={store.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{store.name}</p>
                    <p className="text-sm text-gray-500">{store.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm">{store.owner_username || store.owner_email}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm">{store.address}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <StarRating value={parseFloat(store.average_rating) || 0} readonly size="sm" />
                    <span className="ml-2 text-sm text-gray-600">
                      ({parseFloat(store.average_rating || 0).toFixed(1)})
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default StoresTab;
