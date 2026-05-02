import React from 'react';
import { useUserContext } from '@/context/AuthContext';
import Loader from '@/components/shared/Loader';

// Import the separated components
import VolunteerDashboard from './VolunteerDashboard';
import LawyerDashboard from './LawyerDashboard';
import UserDashboard from './UserDashboard';

export default function Dashboard() {
  const { user, isLoading } = useUserContext();

  // Show a loader while we fetch the user's role and data
  if (isLoading || !user.id) {
    return (
      <div className="flex w-full items-center justify-center h-full">
        <Loader />
      </div>
    );
  }

  // Function to determine which component to load
  const renderDashboardComponent = () => {
    switch (user.role) {
      case 'Volunteer':
        return <VolunteerDashboard />;
      case 'Lawyer':
        return <LawyerDashboard />;
      default:
        return <UserDashboard />; 
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-10 px-5 py-10 md:px-8 lg:p-14 custom-scrollbar">
      <div className="max-w-5xl w-full">
        
        {/* Universal Header for all roles */}
        <div className="flex items-center gap-4 mb-8">
          <img 
            src={user.imageUrl || '/assets/icons/profile-placeholder.svg'} 
            alt="profile" 
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h1 className="h2-bold md:h1-bold text-light-1">
              Welcome back, {user.name}
            </h1>
            <p className="small-medium text-light-3">
              Role: <span className="text-primary-500">{user.role}</span>
              {user.isVerified && <span className="ml-2 text-green-500">(Verified)</span>}
            </p>
          </div>
        </div>

        {/* Dynamically injected dashboard based on role */}
        {renderDashboardComponent()}
        
      </div>
    </div>
  );
}