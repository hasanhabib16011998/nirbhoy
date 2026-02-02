import AuthLayout from './_auth/AuthLayout';
import SignInForm from './_auth/forms/SignInForm';
import SignUpForm from './_auth/forms/SignUpForm';
import { Home } from './_root/pages';
import RootLayout from './_root/RootLayout';
import './globals.css';
import { Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <main className='flex h-screen'>
        <Routes>
          <Route element={<AuthLayout/>}>
            {/* public routes */}
            <Route path='/sign-in' element={<SignInForm/>}/>
            <Route path='/sign-up' element={<SignUpForm/>}/>
          </Route>

            {/* private routes */}
            <Route element={<RootLayout/>}>
              <Route index element={<Home/>}/>
            </Route>
        </Routes>
    </main>
  )
}

export default App;