// src/components/Layout.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Layout = ({ children, currentUser }) => {
  return (
    <>
      <Navbar currentUser={currentUser} />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
