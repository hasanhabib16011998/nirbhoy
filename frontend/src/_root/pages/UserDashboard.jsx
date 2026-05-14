// src/components/dashboards/UserDashboard.jsx
import React from 'react';
import SosView from './SosView';
import { useGetSosData, useGetLegalAidData } from '@/lib/react-query/queriesAndMutations';
import LegalAidView from './LegalAidView';
import { useUserContext } from '@/context/AuthContext';

const UserDashboard = () => {
  const { data, isLoading, isError, error } = useGetSosData();
  const { user } = useUserContext()
  console.log(user);
  console.log(data);
  const { 
    data: aidData, 
    isLoading: aidIsLoading, 
    isError: aidIsError, 
    error: aidError 
  } = useGetLegalAidData();

  return (
    <div className="flex flex-col gap-8">
      {/* Optional: You can keep your original welcome text at the top if you like! */}
      <div className="p-6 bg-dark-2 rounded-xl border border-light-4">
        <h2 className="h2-bold text-light-1 mb-2">My Dashboard</h2>
        <p className="body-medium text-light-2">
          Manage your shared stories, view saved safety resources, and update emergency contacts.
        </p>
      </div>

      <SosView 
        title="My SOS Tracker"
        description="Track the status of your active SOS broadcasts and review your past emergency alerts."
        emptyActiveText="You currently have no active SOS alerts."
        emptyHistoryText="You have no past SOS history."
        data={data}
        user={user}
        isLoading={isLoading}
        isError={isError}
        error={error}
      />

      <LegalAidView 
          title="Pro Bono Case Requests"
          description="Submit legal aid applications."
          emptyActiveText="There are no pending legal aid applications at the moment."
          emptyHistoryText="You haven't submitted any cases yet."
          data={aidData}
          isLoading={aidIsLoading}
          isError={aidIsError}
          error={aidError}
      />
    </div>
  );
};

export default UserDashboard;