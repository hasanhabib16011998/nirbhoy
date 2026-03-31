// src/components/shared/SosNavigateButton.jsx
import { useNavigate } from "react-router-dom";

const SOSButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/sos")}
      className="fixed bottom-30 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform hover:scale-105"
    >
      <span className="text-lg font-bold text-white">SOS</span>
    </button>
  );
};

export default SOSButton;