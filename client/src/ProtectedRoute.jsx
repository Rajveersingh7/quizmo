// ProtectedRoute.jsx - Restricts access to authenticated users only
import React from "react";
import {useAuth} from "./contexts/AuthContext";
import {Navigate, useLocation} from "react-router-dom";

const ProtectedRoute = ({children}) => {
  const {isAuthenticated, loading} = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{from: location, showHistoryError: true}}
        replace
      />
    );
  }
  return children;
};

export default ProtectedRoute;
