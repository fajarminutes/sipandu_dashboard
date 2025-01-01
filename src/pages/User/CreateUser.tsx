import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API_USERS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/users/";
const API_CUSTOMERS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/customers/";

const CreateUser = () => {
  const navigate = useNavigate();
  const [formFields, setFormFields] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    level: "",
  });
  const [role, setRole] = useState("");
  const [customers, setCustomers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(API_CUSTOMERS);
      setCustomers(response.data);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data pelanggan.", "error");
    }
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setFormFields((prev) => ({
      ...prev,
      username: selectedRole === "Admin" ? "admin_" : selectedRole === "Customer" ? "customer_" : "",
    }));
  };

  const validateForm = () => {
    const { fullname, username, email, password, level } = formFields;
    if (!fullname || !username || !email || !password || !level) {
      Swal.fire("Error!", "Semua kolom wajib diisi!", "error");
      return false;
    }
    return true;
  };

  const getPublicIP = async () => {
    try {
        const response = await axios.get("https://api.ipify.org?format=json");
        return response.data.ip;
    } catch (error) {
        console.error("Gagal mendapatkan IP publik:", error);
        return "127.0.0.1"; // Default fallback IP
    }
};

const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
        const ipAddress = await getPublicIP(); // Mendapatkan IP publik

        const additionalData = {
            registered: new Date().toISOString(),
            created_login: new Date().toISOString(),
            last_login: new Date().toISOString(),
            ip: ipAddress, // Gunakan IP dari API
            browser: navigator.userAgent,
            session: "-",
            unix_id: Math.random().toString(36).substring(2, 7).toUpperCase(),
        };

        const payload = {
            ...formFields,
            ...additionalData,
        };

        await axios.post(API_USERS, payload);
        Swal.fire("Berhasil!", "Data pengguna berhasil disimpan!", "success");
        navigate("/users");
    } catch (error) {
        const errorMessage = error.response?.data?.error || "Gagal menyimpan data pengguna.";
        Swal.fire("Error!", errorMessage, "error");
    } finally {
        setIsSaving(false);
    }
};


  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Form Tambah Pengguna</h1>
      <form className="space-y-6">
        {/* Nama */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Nama</label>
          <input
            type="text"
            value={formFields.fullname}
            onChange={(e) => setFormFields({ ...formFields, fullname: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Role</label>
          <select
            value={role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">- Pilih -</option>
            <option value="Admin">Admin</option>
            <option value="Customer">Customer</option>
          </select>
        </div>

        {/* Level */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Level</label>
          <select
            value={formFields.level}
            onChange={(e) => setFormFields({ ...formFields, level: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">- Pilih -</option>
            {customers.map((customer) => (
              <option key={customer.customer_id} value={customer.customer_id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Username */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Username</label>
          <input
            type="text"
            value={formFields.username}
            onChange={(e) => setFormFields({ ...formFields, username: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formFields.email}
            onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={formFields.password}
            onChange={(e) => setFormFields({ ...formFields, password: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleSave}
            className={`bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isSaving}
          >
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;
