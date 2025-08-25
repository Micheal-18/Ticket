// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAccountType } from "../hooks/useAccountType";

const ProtectedRoute = ({ user, allowedType, children }) => {
  const accountType = useAccountType(user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

   if (!user.emailVerified) {
    return <Navigate to="/verify" replace />;
  } 

  if (allowedType && accountType !== allowedType) {
    return <Navigate to="/" replace />; // block access if wrong type
  }

  return children;
};

export default ProtectedRoute;
