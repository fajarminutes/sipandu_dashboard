import React, { useEffect, useState } from "react";

interface UserData {
  user_id: string;
  unix_id: string;
  username: string;
  email: string;
  level: string;
}

const ContohPage: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user_data");
    if (user) {
      try {
        const parsedUser: UserData = JSON.parse(user);
        setUserData(parsedUser);
      } catch (error) {
        console.error("Gagal mem-parsing user_data:", error);
        localStorage.removeItem("user_data"); // Bersihkan jika data tidak valid
      }
    }
  }, []);

  if (!userData) {
    return <p>Memuat data pengguna...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profil Pengguna</h1>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <p>
          <strong>ID:</strong> {userData.user_id}
        </p>
        <p>
          <strong>Unix ID:</strong> {userData.unix_id}
        </p>
        <p>
          <strong>Username:</strong> {userData.username}
        </p>
        <p>
          <strong>Email:</strong> {userData.email}
        </p>
        <p>
          <strong>Level:</strong> {userData.level}
        </p>
      </div>
    </div>
  );
};

export default ContohPage;