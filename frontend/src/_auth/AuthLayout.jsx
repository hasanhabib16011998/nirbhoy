import { Outlet, Navigate, Link } from "react-router-dom";

const AuthLayout = () => {
  const isAuthenticated = false;
  
  return (
    <>
      {isAuthenticated ? (
        <Navigate to='/'/>
      ) : (
        // 1. Replaced the empty fragment <> with a strict full-screen flex wrapper
        <main className="flex h-screen w-full overflow-hidden">
          
          {/* 2. Added h-full to ensure this section respects the 100vh limit, forcing overflow-y-auto to kick in */}
          <section className="flex flex-1 items-center flex-col py-10 overflow-y-auto custom-scrollbar w-full h-full">
            <div className="sm:w-420 flex flex-col w-full px-6 sm:px-0">
              
              {/* Header Row: Logo & About Us Button */}
              <div className="flex justify-between items-center w-full mb-8 sm:mb-12">
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

          {/* 3. Changed h-screen to h-full so it perfectly matches the parent wrapper */}
          <img 
            src='/assets/images/screen2.jpeg' 
            alt='logo' 
            className="hidden xl:block h-full w-1/2 object-cover bg-no-repeat"
          />
        </main>
      )}
    </>
  )
}

export default AuthLayout;