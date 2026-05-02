// src/pages/SosDashboard.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

// --- NEW LEAFLET IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- FIX FOR LEAFLET DEFAULT ICONS IN REACT ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const SosDashboard = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [backendResponse, setBackendResponse] = useState(""); 
  
  // NEW STATE: Store coordinates and message
  const [currentLocation, setCurrentLocation] = useState(null);
  // ✅ Add state for the SOS message details
  const [details, setDetails] = useState(""); 

  const hasTriggeredBackend = useRef(false);

  // ✅ Accept 'message' as an argument
  const sendInitialSosToBackend = async (latitude, longitude, message) => {
    try {
      const token = localStorage.getItem("accessToken");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

      const response = await fetch(`${API_BASE_URL}/complains/trigger/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: latitude,
          longitude: longitude,
          message: message, // ✅ Include the message in the payload
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to broadcast to server.");
      }

      setBackendResponse(data.message);
      
    } catch (error) {
      console.error("Backend SOS error:", error);
      setErrorMsg(error.message);
    }
  };

  const startEmergency = () => {
    if (!("geolocation" in navigator)) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setIsTracking(true);
    setErrorMsg("");
    setBackendResponse("");
    hasTriggeredBackend.current = false; 

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        const formattedLat = parseFloat(latitude.toFixed(6));
        const formattedLng = parseFloat(longitude.toFixed(6));

        setCurrentLocation({ lat: formattedLat, lng: formattedLng });
        
        if (!hasTriggeredBackend.current) {
          hasTriggeredBackend.current = true;
          // ✅ Pass the current 'details' state to the backend call
          sendInitialSosToBackend(formattedLat, formattedLng, details);
        }
      },
      (error) => {
        console.error("Location error:", error);
        setErrorMsg("Please enable location permissions to broadcast SOS.");
        setIsTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    setWatchId(id);
  };

  const stopEmergency = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    hasTriggeredBackend.current = false;
    setBackendResponse("");
    setCurrentLocation(null); 
    setDetails(""); // ✅ Optionally clear the message when stopping the SOS
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen bg-dark-1 p-6">
      <div className="max-w-md w-full flex flex-col items-center text-center gap-8">
        
        <div>
          <h1 className="h2-bold text-red-500 mb-2">Emergency Dashboard</h1>
          <p className="body-medium text-light-2">
            Activating this will immediately share your live location with vetted volunteers nearby.
          </p>
        </div>

        {errorMsg && <p className="text-red-500 body-bold">{errorMsg}</p>}
        
        {backendResponse && (
          <div className="bg-green-500/10 border border-green-500 p-4 rounded-lg w-full">
            <p className="text-green-500 body-bold">{backendResponse}</p>
          </div>
        )}

        {/* MAP COMPONENT */}
        {currentLocation && isTracking && (
          <div className="w-full h-64 rounded-xl overflow-hidden border-2 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] z-0">
            <MapContainer 
              center={[currentLocation.lat, currentLocation.lng]} 
              zoom={16} 
              scrollWheelZoom={false} 
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[currentLocation.lat, currentLocation.lng]}>
                <Popup>
                  You are broadcasting from here.
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        {/* ✅ DETAILS TEXTAREA: Only show if not currently broadcasting */}
        {!isTracking && (
          <div className="w-full flex flex-col items-start gap-2">
            <label htmlFor="sos-details" className="text-light-2 small-medium ml-1">
              Optional Details (Nature of emergency, medical needs, etc.)
            </label>
            <textarea
              id="sos-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="E.g., Car accident, need medical help..."
              className="w-full h-24 p-3 rounded-lg bg-dark-2 text-light-1 border-none placeholder:text-light-4 focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>
        )}

        {!isTracking ? (
          <button
            onClick={startEmergency}
            className="w-64 h-64 rounded-full bg-red-600 border-8 border-red-900 shadow-[0_0_40px_rgba(220,38,38,0.5)] flex items-center justify-center transition-transform active:scale-95 z-10"
          >
            <span className="h1-bold text-white">TAP TO<br/>BROADCAST</span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-6 w-full z-10 mt-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
              <span className="body-bold text-red-500">LIVE BROADCASTING...</span>
            </div>
            
            <button
              onClick={stopEmergency}
              className="w-full py-4 bg-light-2 text-dark-1 h3-bold rounded-lg hover:bg-white transition-colors"
            >
              I am Safe (Stop SOS)
            </button>
          </div>
        )}

        <button 
          onClick={() => navigate(-1)}
          className="mt-4 text-light-3 hover:text-light-1 underline"
        >
          Return to App
        </button>

      </div>
    </div>
  );
};

export default SosDashboard;