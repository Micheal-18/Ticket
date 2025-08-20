import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Footer from './components/Footer'
import Register from './pages/Register'
import PersonalForm from "./pages/PersonalForm";
import OrganizationForm from "./pages/OrganizationForm";


const App = () => {
  return (
    <Routes>
      <Route path='/' element={<>
        <Navbar />
        <Home />
        <Footer />
      </>} />
      <Route path='/Register' element={<>
        <Register />
      </>} />
      <Route path="/register/personal" element={<PersonalForm />} />
      <Route path="/register/organization" element={<OrganizationForm />} />
    </Routes>
  )
}

export default App