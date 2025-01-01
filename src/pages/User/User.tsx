import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const API_USERS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/users/";
const API_CUSTOMERS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/customers/";

const UserPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTermUsers") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      await fetchCustomers();
      await fetchUsers();
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("searchTermUsers", searchTerm);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_USERS);
      setTimeout(() => {
        const sortedUsers = response.data.sort((a, b) => b.user_id - a.user_id);
        setUsers(sortedUsers);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data pengguna.", "error");
      setIsLoading(false);
    }
  };


const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_CUSTOMERS);
      setTimeout(() => {
        const customersMap = response.data.reduce((acc, customer) => {
          acc[customer.customer_id] = customer.name;
          return acc;
        }, {});
        setCustomers(customersMap);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data pelanggan.", "error");
      setIsLoading(false);
    }
  };


  const handleDelete = async (userId) => {
    try {
      const confirm = await Swal.fire({
        title: "Apakah Anda yakin?",
        text: "Data ini akan dihapus secara permanen!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!",
      });

      if (!confirm.isConfirmed) return;

      await axios.delete(`${API_USERS}${userId}`);

      setUsers(users.filter((user) => user.user_id !== userId));
      Swal.fire("Terhapus!", "Data pengguna berhasil dihapus.", "success");
    } catch (error) {
      Swal.fire("Error!", "Gagal menghapus data pengguna.", "error");
    }
  };

  const filteredUsers = users.filter((user) => {
    return (
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Pengguna</h1>
        <button
          onClick={() => navigate("/users/create")}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Tambah Baru
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan nama, username, atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border px-4 py-2"
        />
        <input
          type="number"
          min="1"
          max="50"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Math.max(1, Number(e.target.value)))}
          className="border px-2 py-1 w-20"
          title="Jumlah data per halaman"
        />
      </div>

      {isLoading ? (
        <div className="text-center">
          <div className="loader border-t-4 border-blue-600 border-solid rounded-full w-16 h-16 mx-auto animate-spin"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">No</th>
                  <th className="border px-4 py-2">Nama</th>
                  <th className="border px-4 py-2">Username</th>
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">Registrasi</th>
                  <th className="border px-4 py-2">Level</th>
                  <th className="border px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((user, index) => (
                  <tr key={user.user_id}>
                    <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                    <td className="border px-4 py-2">{user.fullname}</td>
                    <td className="border px-4 py-2">{user.username}</td>
                    <td className="border px-4 py-2">{user.email}</td>
                    <td className="border px-4 py-2 text-center">{new Date(user.registered).toLocaleDateString()}</td>
                    <td className="border px-4 py-2">{customers[user.level] || "Tidak ada data"}</td>
                    <td className="border px-4 py-2 flex justify-center space-x-2">
                      <button
                        onClick={() => navigate(`/users/edit/${user.user_id}`)}
                        className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id)}
                        className="bg-red-600 text-white py-1 px-4 rounded-lg hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between items-center mt-4 space-y-2 sm:space-y-0">
            <button
              disabled={currentPage === 1 || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-gray-600 text-center sm:text-left">
              Halaman {filteredUsers.length > 0 ? currentPage : 0} dari {totalPages}
            </p>
            <button
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
