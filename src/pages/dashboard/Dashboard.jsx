import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import CollectorDashboard from './CollectorDashboard';
import RecyclingCenterDashboard from './RecyclingCenterDashboard';
import PublicDashboard from './PublicDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'COLLECTOR':
        return <CollectorDashboard />;
      case 'RECYCLING_CENTER':
        return <RecyclingCenterDashboard />;
      case 'PUBLIC':
      default:
        return <PublicDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
