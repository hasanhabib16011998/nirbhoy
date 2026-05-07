import { Navigate, Outlet, useLocation } from "react-router-dom"; 

import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import SosButton from "@/components/shared/SOSButton";
import Loader from "@/components/shared/Loader";

import { useUserContext } from "@/context/AuthContext";

const RootLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  // 1. Show a loader while verifying the token
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-dark-1">
        <Loader />
      </div>
    );
  }

  // 2. Handle Unauthenticated Users
  if (!token || (!isLoading && !isAuthenticated)) {
    if (location.pathname === "/about-us") {
      return (
        <section className="flex flex-1 h-full bg-dark-1 overflow-y-auto">
          <Outlet />
        </section>
      );
    }
    return <Navigate to="/sign-in" replace />;
  }

  // 3. Handle Authenticated Users
  return (
    // ✅ 1. Added `md:h-screen` and `overflow-hidden` so the main window stops scrolling
    <div className="w-full md:flex md:h-screen overflow-hidden">
      
      <Topbar />
      <LeftSidebar />

      {/* ✅ 2. Added `overflow-y-auto` and `custom-scrollbar` so ONLY this section scrolls */}
      <section className="flex flex-1 h-full overflow-y-auto custom-scrollbar">
        <Outlet />
      </section>
      
      <SosButton />
      <Bottombar />
    </div>
  );
};

export default RootLayout;