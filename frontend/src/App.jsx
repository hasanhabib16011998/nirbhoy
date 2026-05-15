import AuthLayout from './_auth/AuthLayout';
import SignInForm from './_auth/forms/SignInForm';
import SignUpForm from './_auth/forms/SignUpForm';
import ProSignUpForm from './_auth/forms/ProSignUpForm';
import {
  Home,
  Dashboard,
  Saved,
  CreatePost,
  Profile,
  EditPost,
  PostDetails,
  UpdateProfile,
  AllUsers,
  SosDashboard,
  SosDetails,
  AboutUs,
  LegalAid,
  LegalAidDetails,
  ContactUs
} from "@/_root/pages";
import RootLayout from './_root/RootLayout';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner"


const App = () => {
  return (
    <main className='flex h-screen w-full'>
        <Routes>
          <Route element={<AuthLayout/>}>
            {/* public routes */}
            <Route path='/sign-in' element={<SignInForm/>}/>
            <Route path='/sign-up' element={<SignUpForm/>}/>
            <Route path='/pro-sign-up' element={<ProSignUpForm/>}/>
          </Route>

            {/* private routes */}
            <Route element={<RootLayout/>}>
            <Route index element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/lawyers" element={<AllUsers />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/update-post/:id" element={<EditPost />} />
            <Route path="/posts/:id" element={<PostDetails />} />
            <Route path="/profile/:id/*" element={<Profile />} />
            <Route path="/update-profile/:id" element={<UpdateProfile />} />
            <Route path="/sos" element={<SosDashboard />} />
            <Route path="/sos/:id" element={<SosDetails />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/legal-aid" element={<LegalAid />} />
            <Route path="/legal-aid/:id" element={<LegalAidDetails />} />
            </Route>
        </Routes>
        <Toaster position="top-center"/>
    </main>
  )
}

export default App;