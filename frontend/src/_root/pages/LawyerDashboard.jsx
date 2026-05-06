import React from 'react';
import { useGetLegalAidData } from '@/lib/react-query/queriesAndMutations';
import LegalAidView from './LegalAidView';

const LawyerDashboard = () => {
  const { data, isLoading, isError, error } = useGetLegalAidData();
  return (
    <div className="p-6 bg-dark-2 rounded-xl border border-secondary-500">
      <h2 className="h2-bold text-secondary-500 mb-4">Legal Counsel Dashboard</h2>
      <p className="body-medium text-light-2">
        Review pending pro-bono requests, client messages, and document verifications.
      </p>
      {/* Future: Add case tables, scheduling tools, and secure messaging here */}
      <LegalAidView 
          title="Pro Bono Case Requests"
          description="Review incoming legal aid applications from survivors. Your expertise provides crucial guidance for those navigating the justice system."
          emptyActiveText="There are no pending legal aid applications at the moment."
          emptyHistoryText="You haven't reviewed any cases yet."
          data={data}
          isLoading={isLoading}
          isError={isError}
          error={error}
      />
    
    </div>
  );
};

export default LawyerDashboard;