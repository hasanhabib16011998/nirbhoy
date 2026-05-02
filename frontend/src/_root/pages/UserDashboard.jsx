import React from 'react';

const UserDashboard = () => {
  return (
    <div className="p-6 bg-dark-2 rounded-xl border border-light-4">
      <h2 className="h2-bold text-light-1 mb-4">My Dashboard</h2>
      <p className="body-medium text-light-2">
        Manage your shared stories, view saved safety resources, and update emergency contacts.
      </p>
      {/* Future: Add personal post history, trusted contacts, and resource bookmarks here */}
    </div>
  );
};

export default UserDashboard;