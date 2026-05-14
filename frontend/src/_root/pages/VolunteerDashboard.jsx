// src/components/dashboards/VolunteerDashboard.jsx
import React from 'react';
import { useGetSosData } from '@/lib/react-query/queriesAndMutations'; 
import SosView from './SosView';
import { useUserContext } from '@/context/AuthContext';
const VolunteerDashboard = () => {
  const { data, isLoading, isError, error } = useGetSosData();
    const { user } = useUserContext();

  return (
    <SosView 
      title="Volunteer Command Center"
      description="Respond to active SOS requests below. Always prioritize personal safety and contact local authorities if the situation is violent."
      emptyActiveText="No active emergencies right now."
      emptyHistoryText="You haven't responded to any emergencies yet."
      data={data} 
      user={user} 
      isLoading={isLoading}
      isError={isError}
      error={error}
    />
  );
};

export default VolunteerDashboard;