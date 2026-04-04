import React from 'react';

const LawyerDashboard = () => {
  return (
    <div className="p-6 bg-dark-2 rounded-xl border border-secondary-500">
      <h2 className="h2-bold text-secondary-500 mb-4">Legal Counsel Dashboard</h2>
      <p className="body-medium text-light-2">
        Review pending pro-bono requests, client messages, and document verifications.
      </p>
      {/* Future: Add case tables, scheduling tools, and secure messaging here */}
    </div>
  );
};

export default LawyerDashboard;