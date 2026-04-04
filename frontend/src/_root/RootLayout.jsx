import { Navigate, Outlet } from "react-router-dom";

import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import SosButton from "@/components/shared/SOSButton";
import Loader from "@/components/shared/Loader";

import { useUserContext } from "@/context/AuthContext";

const RootLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();
  const token = localStorage.getItem("accessToken");

  // 1. Show a loader while the app is verifying the user's token with Django
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-dark-1">
        <Loader />
      </div>
    );
  }

  // 2. If there is no token, OR the user is definitely not authenticated, kick them to login
  if (!token || (!isLoading && !isAuthenticated)) {
    return <Navigate to="/sign-in" replace />;
  }

  // 3. If they ARE authenticated, render your exact layout as normal!
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