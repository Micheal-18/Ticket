import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'


const App = () => {
  return (
    <Routes>
      <Route path='/' element={<>
      <Navbar />
      <Home />
      </>} />
    </Routes>
  )
}

export default App