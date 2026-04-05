import { Outlet, Navigate } from "react-router-dom";

const AuthLayout = () => {
  const isAuthenticated = false;
  return (
    <>
      {isAuthenticated? (
        <Navigate to='/'/>
      ):(
        <>
        <section className="flex flex-1 items-center flex-col py-10 overflow-y-auto custom-scrollbar">
          <Outlet/>
        </section>

        <img src='/assets/images/screen.jpg' alt='logo' className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"/>
        </>
      )}
    </>
  )
}

export default AuthLayout