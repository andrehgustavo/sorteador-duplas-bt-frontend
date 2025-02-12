import React, { useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';

const RequireAuth = ({ children }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default RequireAuth;
