import { Outlet, Navigate, Link } from "react-router-dom";

const AuthLayout = () => {
  const isAuthenticated = false;
  
  return (
    <>
      {isAuthenticated ? (
        <Navigate to='/'/>
      ) : (
        <>
          <section className="flex flex-1 items-center flex-col py-10 overflow-y-auto custom-scrollbar w-full">
            {/* Added w-full and px padding for mobile responsiveness */}
            <div className="sm:w-420 flex flex-col w-full px-6 sm:px-0">
              
              {/* Header Row: Logo & About Us Button */}
              <div className="flex justify-between items-center w-full mb-8 sm:mb-12">
                {/* It's best practice to wrap the logo in a link to home */}
                <Link to="/">
                  <img 
                    src="/assets/images/logo.png" 
                    alt="logo" 
                    className="h-12 sm:h-16 w-auto"
                  />
                </Link>

                {/* Stand-out About Us Link */}
                <Link
                  to="/about-us"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-primary-500/30 transition-all active:scale-95"
                >
                  About Us
                </Link>
              </div>

              {/* The Form renders here */}
              <Outlet/>
            </div>
          </section>

          <img 
            src='/assets/images/screen.jpg' 
            alt='logo' 
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
          />
        </>
      )}
    </>
  )
}

export default AuthLayout;