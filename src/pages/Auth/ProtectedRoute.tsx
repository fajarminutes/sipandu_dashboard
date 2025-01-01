import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";


interface ProtectedRouteProps {
  children: React.ReactElement;
}

interface DecodedToken {
  exp: number; // Expiry time (in seconds since Unix Epoch)
}

interface DecodedToken {
  exp: number; // Expiry time
  sub: {
    user_id: string;
    unix_id: string;
    username: string;
    email: string;
    level: string;
  };
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("access_token");
  const location = useLocation();

  if (token) {
    try {
      const decoded = jwtDecode<DecodedToken>(token);

      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        localStorage.removeItem("access_token");
        return (
          <Navigate
            to="/auth/login"
            state={{
              from: location.pathname,
              alert: "Sesi Anda telah berakhir. Silakan login kembali.",
            }}
            replace
          />
        );
      }

      const userData = decoded.sub; // Sesuaikan dengan token backend
      if (userData) {
        localStorage.setItem("user_data", JSON.stringify(userData));
      } else {
        throw new Error("Decoded token missing sub (user data)");
      }

      return children;
    } catch (error) {
      console.error("Token tidak valid:", error);
      localStorage.removeItem("access_token");
      return (
        <Navigate
          to="/auth/login"
          state={{
            from: location.pathname,
            alert: "Token tidak valid. Silakan login kembali.",
          }}
          replace
        />
      );
    }
  }

  return (
    <Navigate
      to="/auth/login"
      state={{
        from: location.pathname,
        alert: "Anda harus login terlebih dahulu untuk mengakses halaman ini.",
      }}
      replace
    />
  );
};


export default ProtectedRoute;
