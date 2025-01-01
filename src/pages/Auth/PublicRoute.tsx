import React from 'react';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
    children: React.ReactElement;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const token = localStorage.getItem('access_token'); // Periksa apakah token ada
    return token ? <Navigate to="/dashboard" replace /> : children; // Jika sudah login, redirect ke dashboard
};

export default PublicRoute;
