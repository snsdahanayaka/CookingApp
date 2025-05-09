import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    // User is not authenticated, redirect to login
    return <Navigate to="/login" />;
  }

  // User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
