import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Footer from './components/Footer'
import Register from './pages/Register'
import PersonalForm from "./pages/PersonalForm";
import OrganizationForm from "./pages/OrganizationForm";
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/firebase'


const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // null if logged out
    });

    return () => unsubscribe();
  }, []);
  return (
    <Routes>
      <Route path='/' element={<>
        <Navbar currentUser={currentUser} />
        <Home />
        <Footer />
      </>} />

        {/* Redirect to home if user is already logged in */}
      <Route
        path='/Register'
        element={currentUser ? <Navigate to="/" replace /> : <Register />}
      />
      <Route path="/register/personal" element={<PersonalForm />} />
      <Route path="/register/organization" element={<OrganizationForm />} />
    </Routes>
  )
}

export default App