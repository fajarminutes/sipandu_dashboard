import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number; // Expiry time (in seconds since Unix Epoch)
  sub: {
    user_id: string;
    unix_id: string;
    username: string;
    email: string;
    level: string;
  };
}

const Coba: React.FC = () => {
  const [userData, setUserData] = useState<DecodedToken['sub'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      setUserData(decoded.sub);
    } catch (err) {
      console.error("Token tidak valid:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>Data pengguna tidak tersedia.</div>;
  }

  // Logika untuk menentukan sapaan
  let greeting = 'Halo Admin'; // Default greeting

  if (userData.username.includes('customer_')) {
    greeting = userData.level === '2' ? 'Halo Superadmin' : 'Halo Admin dan Customer';
  } else {
    greeting = userData.level === '2' ? 'Halo Superadmin' : 'Halo Admin';
  }

  return (
    <div>
      <h1>{greeting}</h1>
      <h2>Profil Pengguna</h2>
      <p>User ID: {userData.user_id}</p>
      <p>Unix ID: {userData.unix_id}</p>
      <p>Username: {userData.username}</p>
      <p>Email: {userData.email}</p>
      <p>Level: {userData.level}</p>
    </div>
  );
};

export default Coba;
