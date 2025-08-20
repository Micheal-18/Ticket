import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Footer from './components/Footer'


const App = () => {
  return (
    <Routes>
      <Route path='/' element={<>
      <Navbar />
      <Home />
      <Footer />
      </>} />
    </Routes>
  )
}

export default App