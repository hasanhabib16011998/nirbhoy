// src/pages/SosDetails.jsx (adjust path as needed)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '@/components/shared/Loader';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";


// Optional: Bring in Leaflet to show the location visually!
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useUserContext } from '@/context/AuthContext';

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const SosDetails = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  console.log(user);
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlertDetails = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      // Assumes you have a detail endpoint like /complains/{id}/
      const response = await fetch(`${API_BASE_URL}/complains/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch alert details');
      
      const data = await response.json();
      setAlert(data);
      console.log(data)
    } catch (err) {
      toast.error("Error", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertDetails();
  }, [id]);

  const handleRespondAlert = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${API_BASE_URL}/complains/${id}/respond/`, {
        method: 'PATCH', 
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to register your response status');

      setAlert(prev => ({ 
        ...prev, 
        responders: [...(prev.responders || []), Number(user.id)] 
      }));
      toast.success("Response Recorded", { description: "You are marked as responding. Stay safe." });
    } catch (err) {
      toast.error("Action Failed", { description: err.message });
    }
  };

  const handleResolveAlert = async () => {
    if (!window.confirm("Are you sure this situation is resolved and the user is safe?")) return;

    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${API_BASE_URL}/complains/${id}/resolve/`, {
        method: 'PATCH', 
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to resolve the alert');

      toast.success("Emergency Resolved", { description: "The alert has been successfully closed." });
      navigate('/dashboard'); // Send them back to the dashboard

    } catch (err) {
      toast.error("Failed to resolve", { description: err.message });
    }
  };

  if (isLoading) return <div className="flex-center w-full min-h-screen"><Loader /></div>;
  if (!alert) return <div className="p-6 text-white text-center">Alert not found or already resolved.</div>;

  const hasResponded = alert.responders?.some(
    (responderId) => String(responderId) === String(user.id)
  );

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>

      <div className="bg-dark-2 border border-primary-500 rounded-xl p-6">
        <h2 className="h2-bold text-red-500 mb-4">SOS Details</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* INFO SECTION */}
          <div className="flex-1 flex flex-col gap-5">
            
            {/* Victim Profile Card */}
            <div className="flex items-center gap-4 bg-dark-3 p-4 rounded-lg border border-dark-4">
              <img
                src={alert.user?.profile_image || "/assets/icons/profile-placeholder.svg"}
                alt="victim profile"
                className="w-16 h-16 rounded-full object-cover border border-primary-500"
              />
              <div className="flex flex-col">
                <p className="body-bold text-light-1">
                  {alert.user?.first_name} {alert.user?.last_name} 
                  <span className="small-regular text-light-3 ml-2">(@{alert.user?.username})</span>
                </p>
                
                {/* Clickable Phone Number */}
                {alert.user?.phone_number && (
                  <a href={`tel:${alert.user.phone_number}`} className="small-medium text-primary-500 hover:underline mt-1">
                    📞 {alert.user.phone_number}
                  </a>
                )}
              </div>
            </div>

            {/* Additional Contact Info */}
            <div className="flex flex-col gap-2">
              {alert.user?.email && (
                <div>
                  <p className="text-light-3 small-medium">Email</p>
                  <p className="text-light-1 body-medium">{alert.user.email}</p>
                </div>
              )}
              
              {alert.user?.address && (
                <div>
                  <p className="text-light-3 small-medium">Registered Address</p>
                  <p className="text-light-1 body-medium">{alert.user.address}</p>
                </div>
              )}

              <div>
                <p className="text-light-3 small-medium">Alert Timestamp</p>
                <p className="text-light-1 body-medium">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
            </div>

            {/* Victim's Typed Message */}
            {alert.message && (
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/50 mt-2">
                <p className="text-red-500 small-medium mb-1">Message from Victim:</p>
                <p className="text-light-1 body-medium">{alert.message}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-2 flex flex-col gap-3">
              {!hasResponded ? (
                <button
                  onClick={handleRespondAlert}
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white base-medium rounded-lg transition-colors w-full"
                >
                  I Can Respond
                </button>
              ) : (
                <div className="p-3 bg-orange-900/40 border border-orange-500 text-orange-500 rounded-lg text-center base-medium">
                  🏃 You are marked as responding
                </div>
              )}
              
              <button
                onClick={handleResolveAlert}
                className="px-6 py-3 bg-dark-4 border border-red-500 hover:bg-red-600 text-white base-medium rounded-lg transition-colors w-full"
              >
                Mark as Resolved
              </button>
            </div>
          </div>

          {/* MAP SECTION */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="w-full h-64 rounded-xl overflow-hidden border-2 border-dark-4">
              <MapContainer 
                center={[alert.latitude, alert.longitude]} 
                zoom={16} 
                scrollWheelZoom={false} 
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[alert.latitude, alert.longitude]}>
                  <Popup>Victim Location</Popup>
                </Marker>
              </MapContainer>
            </div>
            
            {/* Fixed Google Maps URL */}
            <a 
              href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center p-3 bg-dark-3 hover:bg-dark-4 text-primary-500 rounded-lg base-medium transition-colors border border-dark-4"
            >
              Open External Navigation (Google Maps)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SosDetails;