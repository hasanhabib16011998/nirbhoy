// src/components/dashboards/VolunteerDashboard.jsx
import React, { useState, useEffect } from 'react';
import Loader from '@/components/shared/Loader';
import { toast } from 'sonner'; // ✅ Using Sonner

const VolunteerDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch active alerts
  const fetchActiveAlerts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/complains/active/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch active alerts');
      
      const data = await response.json();
      setAlerts(data);
      console.log(data);
    } catch (err) {
      toast.error("Error fetching alerts", {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to notify system that volunteer is responding
  const handleRespondAlert = async (alertId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      // Ensure you create this endpoint in your Django backend!
      const response = await fetch(`${API_BASE_URL}/complains/${alertId}/respond/`, {
        method: 'PATCH', 
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to register your response status');

      // Optimistically update the UI to show they are responding
      setAlerts((prevAlerts) => 
        prevAlerts.map((alert) => 
          alert.id === alertId ? { ...alert, isResponding: true } : alert
        )
      );

      toast.success("Response Recorded", {
        description: "You are marked as responding to this alert. Please stay safe.",
      });

    } catch (err) {
      toast.error("Action Failed", {
        description: err.message,
      });
    }
  };

  // Function to resolve an alert
  const handleResolveAlert = async (alertId) => {
    if (!window.confirm("Are you sure this situation is resolved and the user is safe?")) return;

    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${API_BASE_URL}/complains/${alertId}/resolve/`, {
        method: 'PATCH', 
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to resolve the alert');

      // Remove the solved alert from the screen
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== alertId));

      toast.success("Emergency Resolved", {
        description: "The alert has been successfully closed. Thank you for your help.",
      });

    } catch (err) {
      toast.error("Failed to resolve", {
        description: err.message,
      });
    }
  };

  // Fetch alerts when the component loads
  useEffect(() => {
    fetchActiveAlerts();
    
    // Poll for new alerts every 10 seconds
    const intervalId = setInterval(fetchActiveAlerts, 10000);
    return () => clearInterval(intervalId);
  }, []);

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

      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-4">
          {alerts.length === 0 ? (
            <div className="bg-dark-3 p-6 rounded-lg text-center border border-dark-4">
              <p className="text-green-500 body-bold">No active emergencies right now.</p>
              <p className="text-light-3 small-regular mt-1">Thank you for keeping the community safe.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border ${
                  alert.isResponding ? "bg-orange-900/20 border-orange-500" : "bg-red-900/20 border-red-500"
                }`}
              >
                {/* Alert Details */}
                <div>
                  <h3 className={`h3-bold flex items-center gap-2 ${alert.isResponding ? 'text-orange-500' : 'text-red-500'}`}>
                    {alert.isResponding ? "🏃 EN ROUTE" : "🚨 SOS ALERT"}
                  </h3>
                  <p className="text-light-1 body-medium mt-1">
                    User ID: {alert.user} triggered an alarm.
                  </p>
                  <p className="text-light-3 small-regular mt-1">
                    Time: {new Date(alert.timestamp).toLocaleString()}
                  </p>
                  
                  {/* ✅ Google Maps URL Fixed */}
                  <a 
                    href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:text-primary-600 underline small-medium mt-2 inline-block"
                  >
                    Open in Google Maps
                  </a>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                  
                  {/* Hide Respond button if already responding */}
                  {!alert.isResponding && (
                    <button
                      onClick={() => handleRespondAlert(alert.id)}
                      className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white base-medium rounded-lg transition-colors w-full sm:w-auto"
                    >
                      I Can Respond
                    </button>
                  )}

                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className="px-6 py-3 bg-dark-4 border border-red-500 hover:bg-red-600 text-white base-medium rounded-lg transition-colors w-full sm:w-auto"
                  >
                    Mark as Resolved
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;