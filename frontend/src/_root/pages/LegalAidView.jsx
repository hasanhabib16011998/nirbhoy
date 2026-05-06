import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from '@/components/shared/Loader';
import { toast } from 'sonner';

const LegalAidView = ({ 
  title, 
  description, 
  emptyActiveText, 
  emptyHistoryText,
  data, 
  isLoading, 
  isError, 
  error 
}) => {
  const [activeTab, setActiveTab] = useState('active');

  // Safely extract the arrays from the Django API response
  const activeApplications = data?.active || [];
  const historyApplications = data?.history || [];

  // Handle errors
  useEffect(() => {
    if (isError && error) {
      toast.error("Error fetching data", { description: error.message });
    }
  }, [isError, error]);

  const renderApplicationList = (applicationList, isHistoryView = false) => {
    if (applicationList.length === 0) {
      return (
        <div className="bg-dark-3 p-6 rounded-lg text-center border border-dark-4">
          <p className="text-primary-500 body-bold">
            {isHistoryView ? emptyHistoryText : emptyActiveText}
          </p>
        </div>
      );
    }

    return applicationList.map((application) => {
      // Default styles for 'Pending'
      let statusColor = "text-blue-500";
      let borderColor = "bg-blue-900/20 border-blue-500";
      let statusIcon = "⚖️";

      // Dynamically change colors based on Django's status_choices
      if (application.status === 'Accepted') {
        statusColor = "text-green-500";
        borderColor = "bg-green-900/20 border-green-500";
        statusIcon = "✅";
      } else if (application.status === 'Reviewed') {
        statusColor = "text-purple-500";
        borderColor = "bg-purple-900/20 border-purple-500";
        statusIcon = "👀";
      } else if (application.status === 'Closed') {
        statusColor = "text-light-4";
        borderColor = "bg-dark-4 border-dark-4";
        statusIcon = "📁";
      }

      return (
        <div key={application.id} className={`p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border ${borderColor}`}>
          <div className="flex-1">
            <h3 className={`h3-bold flex items-center gap-2 ${statusColor}`}>
              {statusIcon} {application.status.toUpperCase()}
            </h3>
            <p className="text-light-1 body-bold mt-2 line-clamp-1">
              {application.caption}
            </p>
            <p className="text-light-3 small-regular mt-1">
              Applicant ID: {application.applicant?.id || application.applicant}
            </p>
            <p className="text-light-3 small-regular mt-1">
              Submitted: {new Date(application.created_at).toLocaleDateString()} at {new Date(application.created_at).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex w-full md:w-auto mt-4 md:mt-0">
            <Link
              to={`/legal-aid/${application.id}`}
              className="px-6 py-3 bg-dark-4 hover:bg-dark-3 border border-dark-4 text-white base-medium rounded-lg transition-colors w-full text-center whitespace-nowrap"
            >
              Review Case
            </Link>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="p-6 bg-dark-2 rounded-xl border border-dark-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="h2-bold text-white">{title}</h2>
        <div className="flex items-center gap-2 bg-dark-4 px-3 py-1 rounded-full border border-dark-3">
           <span className="text-primary-500 text-sm">🔒</span>
           <p className="small-medium text-light-2">Secure Portal</p>
        </div>
      </div>
      
      <p className="body-medium text-light-2 mb-6">
        {description}
      </p>

      {/* TABS */}
      <div className="flex gap-6 mb-6 border-b border-dark-4 pb-3">
        <button 
          onClick={() => setActiveTab('active')} 
          className={`base-medium transition-colors ${activeTab === 'active' ? 'text-primary-500 border-b-2 border-primary-500 pb-1' : 'text-light-3 hover:text-light-2'}`}
        >
          Active Applications
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`base-medium transition-colors ${activeTab === 'history' ? 'text-primary-500 border-b-2 border-primary-500 pb-1' : 'text-light-3 hover:text-light-2'}`}
        >
          My Case History
        </button>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-4">
          {activeTab === 'active' 
            ? renderApplicationList(activeApplications, false) 
            : renderApplicationList(historyApplications, true)}
        </div>
      )}
    </div>
  );
};

export default LegalAidView;