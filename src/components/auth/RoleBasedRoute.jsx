import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role ? String(user.role).trim().toUpperCase() : null;
  const normalizedAllowed = allowedRoles.map(r => String(r).trim().toUpperCase());

  if (userRole && !normalizedAllowed.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RoleBasedRoute;
