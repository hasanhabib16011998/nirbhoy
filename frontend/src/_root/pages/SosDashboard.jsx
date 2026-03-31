// src/pages/SosDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

const SosDashboard = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const startEmergency = () => {
    if (!("geolocation" in navigator)) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setIsTracking(true);
    setErrorMsg("");

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`EMERGENCY LIVE: Lat ${latitude}, Lng ${longitude}`);
        // TODO: Mutate/Send this data to your backend immediately
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
    // TODO: Send a "Safe" signal to your backend
  };

  // Cleanup on unmount
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

        {!isTracking ? (
          <button
            onClick={startEmergency}
            className="w-64 h-64 rounded-full bg-red-600 border-8 border-red-900 shadow-[0_0_40px_rgba(220,38,38,0.5)] flex items-center justify-center transition-transform active:scale-95"
          >
            <span className="h1-bold text-white">TAP TO<br/>BROADCAST</span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-64 h-64 rounded-full bg-dark-4 border-8 border-red-500 shadow-[0_0_60px_rgba(220,38,38,0.8)] flex flex-col items-center justify-center animate-pulse">
              <span className="h2-bold text-red-500">LIVE</span>
              <span className="body-medium text-light-1 mt-2">Broadcasting...</span>
            </div>
            
            <button
              onClick={stopEmergency}
              className="px-8 py-4 bg-light-2 text-dark-1 h3-bold rounded-lg hover:bg-white transition-colors"
            >
              I am Safe (Stop SOS)
            </button>
          </div>
        )}

        <button 
          onClick={() => navigate(-1)}
          className="mt-8 text-light-3 hover:text-light-1 underline"
        >
          Return to App
        </button>

      </div>
    </div>
  );
};

export default SosDashboard;