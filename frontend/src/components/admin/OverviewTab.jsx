import React from 'react';
import { Users, Store, MessageSquare, TrendingUp } from 'lucide-react';
import { Card } from '../UI';

const OverviewTab = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">{stats?.users || 0}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center">
          <Store className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm text-gray-600">Total Stores</p>
            <p className="text-2xl font-bold">{stats?.stores || 0}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center">
          <MessageSquare className="h-8 w-8 text-yellow-600" />
          <div className="ml-4">
            <p className="text-sm text-gray-600">Reviews</p>
            <p className="text-2xl font-bold">{stats?.ratings || 0}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm text-gray-600">Avg Rating</p>
            <p className="text-2xl font-bold">{(stats?.averageRating || 0).toFixed(1)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OverviewTab;
