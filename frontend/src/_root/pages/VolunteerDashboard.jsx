// src/components/dashboards/VolunteerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from '@/components/shared/Loader';
import { toast } from 'sonner';

const VolunteerDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [historyAlerts, setHistoryAlerts] = useState([]); // ✅ State for history
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // ✅ State for tabs

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch both active alerts and history simultaneously
      const [activeRes, historyRes] = await Promise.all([
        fetch(`${API_BASE_URL}/complains/active/`, { headers }),
        fetch(`${API_BASE_URL}/complains/history/`, { headers })
      ]);

      if (!activeRes.ok || !historyRes.ok) throw new Error('Failed to fetch dashboard data');
      
      const activeData = await activeRes.json();
      const historyData = await historyRes.json();

      setAlerts(activeData);
      setHistoryAlerts(historyData);
    } catch (err) {
      toast.error("Error fetching data", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll for new alerts every 10 seconds
    const intervalId = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // ✅ Helper to render the list of alerts (used for both tabs)
  const renderAlertList = (alertList, isHistoryView = false) => {
    if (alertList.length === 0) {
      return (
        <div className="bg-dark-3 p-6 rounded-lg text-center border border-dark-4">
          <p className="text-green-500 body-bold">
            {isHistoryView ? "You haven't responded to any emergencies yet." : "No active emergencies right now."}
          </p>
          <p className="text-light-3 small-regular mt-1">Thank you for keeping the community safe.</p>
        </div>
      );
    }

    return alertList.map((alert) => {
      // Logic for determining status styles
      let statusText = "🚨 SOS ALERT";
      let statusColor = "text-red-500";
      let borderColor = "bg-red-900/20 border-red-500";

      if (isHistoryView) {
        statusText = alert.is_active ? "🏃 IN PROGRESS" : "✅ RESOLVED";
        statusColor = alert.is_active ? "text-orange-500" : "text-green-500";
        borderColor = alert.is_active ? "bg-orange-900/20 border-orange-500" : "bg-green-900/20 border-green-500";
      } else if (alert.isResponding) {
        statusText = "🏃 EN ROUTE";
        statusColor = "text-orange-500";
        borderColor = "bg-orange-900/20 border-orange-500";
      }

      return (
        <div key={alert.id} className={`p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border ${borderColor}`}>
          <div>
            <h3 className={`h3-bold flex items-center gap-2 ${statusColor}`}>
              {statusText}
            </h3>
            <p className="text-light-1 body-medium mt-1">
              User ID: {alert.user?.id || alert.user} triggered an alarm.
            </p>
            <p className="text-light-3 small-regular mt-1">
              Time: {new Date(alert.timestamp).toLocaleString()}
            </p>
          </div>

          <div className="flex w-full md:w-auto mt-4 md:mt-0">
            <Link
              to={`/sos/${alert.id}`}
              className="px-6 py-3 bg-dark-4 hover:bg-dark-3 border border-dark-4 text-white base-medium rounded-lg transition-colors w-full text-center"
            >
              View Details
            </Link>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="p-6 bg-dark-2 rounded-xl border border-primary-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="h2-bold text-primary-500">Volunteer Command Center</h2>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <p className="small-medium text-light-2">Live Tracking Active</p>
        </div>
      </div>
      
      <p className="body-medium text-light-2 mb-6">
        Respond to active SOS requests below. Always prioritize personal safety and contact local authorities if the situation is violent.
      </p>

      {/* ✅ TABS */}
      <div className="flex gap-6 mb-6 border-b border-dark-4 pb-3">
        <button 
          onClick={() => setActiveTab('active')} 
          className={`base-medium transition-colors ${activeTab === 'active' ? 'text-primary-500 border-b-2 border-primary-500 pb-1' : 'text-light-3 hover:text-light-2'}`}
        >
          Active Emergencies
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`base-medium transition-colors ${activeTab === 'history' ? 'text-primary-500 border-b-2 border-primary-500 pb-1' : 'text-light-3 hover:text-light-2'}`}
        >
          My Response History
        </button>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-4">
          {activeTab === 'active' ? renderAlertList(alerts, false) : renderAlertList(historyAlerts, true)}
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;