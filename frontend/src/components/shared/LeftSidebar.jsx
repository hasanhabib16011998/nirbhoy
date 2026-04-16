import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { sidebarLinks } from "@/constants";
import Loader from "./Loader";
import { Button } from "@/components/ui/button";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext"; // Removed INITIAL_USER

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  
  // Destructure ONLY what the new context actually provides
  const { user, isLoading, logout } = useUserContext();

  const { mutate: signOut } = useSignOutAccount();

  const handleSignOut = async (e) => {
    e.preventDefault();
    signOut(); // Clears the server-side session (React Query)
    logout();  // Clears the client-side state and localStorage (AuthContext)
    navigate("/sign-in");
  };

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11 overflow-y-auto custom-scrollbar">
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.png"
            alt="logo"
            width={170}
            height={36}
          />
        </Link>

        {/* Added optional chaining (user?.email) because user is initialized as null in the new context */}
        {isLoading || !user?.email ? (
          <div className="h-14">
            <Loader />
          </div>
        ) : (
          <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-14 w-14 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <p className="body-bold">{user.name}</p>
              <p className="small-regular text-light-3">@{user.username}</p>
            </div>
          </Link>
        )}

        <ul className="flex flex-col gap-6">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.route;

            return (
              <li
                key={link.label}
                className={`leftsidebar-link group ${
                  isActive && "bg-primary-500"
                }`}>
                <NavLink
                  to={link.route}
                  className="flex gap-4 items-center p-4">
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`group-hover:invert-white ${
                      isActive && "invert-white"
                    }`}
                  />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
        <Button
        variant="ghost"
        className="shad-button_ghost flex items-center p-4"
        onClick={(e) => handleSignOut(e)}>
        <img src="/assets/icons/logout.svg" alt="logout" />
        <p className="small-medium lg:base-medium">Logout</p>
      </Button>
      </div>

      
    </nav>
  );
};

export default LeftSidebar;