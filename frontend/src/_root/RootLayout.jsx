import { Navigate, Outlet, useLocation } from "react-router-dom"; // ✅ Import useLocation

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
    // ✅ If they are specifically visiting About Us, let them see it WITHOUT the sidebar
    if (location.pathname === "/about-us") {
      return (
        <section className="flex flex-1 h-full bg-dark-1">
          <Outlet />
        </section>
      );
    }
    // Otherwise, direct them to login
    return <Navigate to="/sign-in" replace />;
  }

  // 3. Handle Authenticated Users (Render the exact layout as normal)
  return (
    <div className="w-full md:flex">
      <Topbar />
      <LeftSidebar />

      <section className="flex flex-1 h-full">
        <Outlet />
      </section>
      
      <SosButton />
      <Bottombar />
    </div>
  );
};

export default RootLayout;