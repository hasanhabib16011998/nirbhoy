import AuthLayout from './_auth/AuthLayout';
import SignInForm from './_auth/forms/SignInForm';
import SignUpForm from './_auth/forms/SignUpForm';
import {
  Home,
  Explore,
  Saved,
  CreatePost,
  Profile,
  EditPost,
  PostDetails,
  UpdateProfile,
  AllUsers,
  SosDashboard
} from "@/_root/pages";
import RootLayout from './_root/RootLayout';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner"


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
            <Route index element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/all-users" element={<AllUsers />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/update-post/:id" element={<EditPost />} />
            <Route path="/posts/:id" element={<PostDetails />} />
            <Route path="/profile/:id/*" element={<Profile />} />
            <Route path="/update-profile/:id" element={<UpdateProfile />} />
            <Route path="/sos" element={<SosDashboard />} />
            </Route>
        </Routes>
        <Toaster position="top-center"/>
    </main>
  )
}

export default App;