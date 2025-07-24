import React from 'react';
import { mockDashboard } from '../lib/mock-data';
import DashboardStats from '../components/Dashboard/DashboardStats';
import RecentActivities from '../components/Dashboard/RecentActivities';
import ProcessChart from '../components/Dashboard/ProcessChart';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu escritório jurídico</p>
      </div>

      <DashboardStats data={mockDashboard} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProcessChart data={mockDashboard} />
        </div>
        <div>
          <RecentActivities />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;