import React from 'react';

const VolunteerDashboard = () => {
  return (
    <div className="p-6 bg-dark-2 rounded-xl border border-primary-500">
      <h2 className="h2-bold text-primary-500 mb-4">Volunteer Command Center</h2>
      <p className="body-medium text-light-2">
        View active SOS requests nearby and manage your intervention reports.
      </p>
      {/* Future: Add active map, emergency logs, and volunteer stats here */}
    </div>
  );
};

export default VolunteerDashboard;