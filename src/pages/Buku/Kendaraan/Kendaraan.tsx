import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
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
const API_VEHICLE_BOOK = "https://sipandu.sinarjernihsuksesindo.biz.id/api/vehicle_book/";
const API_SHIFTS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts/";
const API_EMPLOYEES = "https://sipandu.sinarjernihsuksesindo.biz.id/api/employees/";
const formatDate = (dateString) => {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

interface VehicleBook {
  id_vehicle_book: number;
  vehicle_book_date: string;
  shift_id: number;
  id: number;
  foto: string;
}

interface Shift {
  shift_id: number;
  shift_name: string;
}

interface Employee {
  id: number;
  employees_name: string;
}

const KendaraanPage: React.FC = () => {
  const navigate = useNavigate();
  const [vehicleBooks, setVehicleBooks] = useState<VehicleBook[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTermKendaraan") || "");
 const [userData, setUserData] = useState<DecodedToken['sub'] | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      setUserData(decoded.sub);
    } catch (err) {
      console.error("Token tidak valid:", err);
    }
  }, []);
  
   const [isModalOpenGambar, setIsModalOpenGambar] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    
    const openModal = (image) => {
      setSelectedImage(image);
      setIsModalOpenGambar(true);
    };
    
    const closeModal = () => {
      setIsModalOpenGambar(false);
      setSelectedImage(null);
    };
  
     useEffect(() => {
        localStorage.setItem("searchTermKendaraan", searchTerm);
      }, [searchTerm]);

  useEffect(() => {
    if (userData) {
    fetchVehicleBooks();
    fetchShifts();
    fetchEmployees();
    }
  }, [userData]);

  const fetchVehicleBooks = async () => {
    setIsLoading(true); // Mulai loading
    try {
        // Tambahkan jeda 1 detik sebelum melakukan fetch
        await new Promise(resolve => setTimeout(resolve, 1000)); // Jeda 1 detik

        const response = await axios.get(API_VEHICLE_BOOK);
        
        // Ambil data kendaraan
        let vehicleBooks = response.data;

        // Pastikan userData tersedia
        if (userData && userData.level) {
            const userLevel = parseInt(userData.level, 10);
            // Jika level selain "2", filter berdasarkan customer_id
            if (userLevel !== 2) {
                vehicleBooks = vehicleBooks.filter(
                    (vehicleBook) => vehicleBook.customer_id === userLevel
                );
            }
        }

        // Urutkan data berdasarkan ID dari besar ke kecil
        const sortedVehicleBooks = vehicleBooks.sort((a, b) => b.id_vehicle_book - a.id_vehicle_book);
        setVehicleBooks(sortedVehicleBooks); // Set data setelah diurutkan
    } catch (error) {
        console.error("Error fetching vehicle books:", error.response?.data || error.message); // Debug error
        Swal.fire("Error!", error.response?.data?.message || "Gagal memuat data kendaraan.", "error");
    } finally {
        setIsLoading(false); // Akhiri loading meskipun terjadi error
    }
};

  

  const fetchShifts = async () => {
    try {
      const response = await axios.get<Shift[]>(API_SHIFTS);
      setShifts(response.data);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      Swal.fire("Error!", "Gagal memuat data shift.", "error");
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get<Employee[]>(API_EMPLOYEES);
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      Swal.fire("Error!", "Gagal memuat data karyawan.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data ini tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_VEHICLE_BOOK}${id}`);
          fetchVehicleBooks();
          Swal.fire("Terhapus!", "Data kendaraan berhasil dihapus!", "success");
        } catch (error) {
          console.error("Error deleting vehicle book:", error);
          Swal.fire("Error!", "Gagal menghapus data kendaraan.", "error");
        }
      }
    });
  };

  const filteredVehicleBooks = vehicleBooks.filter((vehicleBook) => {
    const shiftName = shifts.find((s) => s.shift_id === vehicleBook.shift_id)?.shift_name || "";
    const employeeName = employees.find((e) => e.id === vehicleBook.id)?.employees_name || "";
    return (
      vehicleBook.vehicle_book_date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shiftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVehicleBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVehicleBooks.length / itemsPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Kendaraan</h1>
        <div className="flex space-x-4">
    <button
      onClick={() => navigate("/buku/kendaraan/kendaraan/create")}
      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
    >
      Tambah Baru
    </button>
   
  </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari kendaraan berdasarkan tanggal, shift regu, atau nama petugas..."
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
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-4">
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">No</th>
                  <th className="border px-4 py-2">Tanggal</th>
                  <th className="border px-4 py-2">Shift Regu</th>
                  <th className="border px-4 py-2">Nama Petugas</th>
                  <th className="border px-4 py-2">Foto</th>
                  <th className="border px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((vehicleBook, index) => {
                  const shiftName = shifts.find((s) => s.shift_id === vehicleBook.shift_id)?.shift_name || "Tidak ada data";
                  const employeeName = employees.find((e) => e.id === vehicleBook.id)?.employees_name || "Tidak ada data";
                  const formattedDate = formatDate(vehicleBook.vehicle_book_date || "Tidak ada data");

                  return (
                    <tr key={vehicleBook.id_vehicle_book}>
                      <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                      <td className="border px-4 py-2">{formattedDate}</td>
                      <td className="border px-4 py-2">{shiftName}</td>
                      <td className="border px-4 py-2">{employeeName}</td>
                      <td className="border px-4 py-2">
  {vehicleBook.foto ? (
    <img
      src={`https://sipandu.sinarjernihsuksesindo.biz.id/uploads/${vehicleBook.foto}`}
      alt="Foto kendaraan"
      className="w-16 h-16 object-cover cursor-pointer"
      onClick={() => openModal(`https://sipandu.sinarjernihsuksesindo.biz.id/uploads/${vehicleBook.foto}`)}
    />
  ) : (
    "Tidak ada foto"
  )}
</td>
{isModalOpenGambar && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
    <div className="relative bg-white p-4 rounded-lg max-w-3xl w-full">
      <button
        onClick={closeModal}
        className="absolute top-2 right-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        X
      </button>
      <img
        src={selectedImage}
        alt="Foto kendaraan"
        className="w-full h-auto max-h-[80vh] object-contain"
      />
    </div>
  </div>
)}
                      <td className="border px-4 py-2 flex justify-center space-x-2">
            <button
              onClick={() => navigate(`/buku/kendaraan/kendaraan/edit/${vehicleBook.id_vehicle_book}`)}
              className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700"
            >
              Edit
            </button>
                        <button
                          onClick={() => handleDelete(vehicleBook.id_vehicle_book)}
                          className="bg-red-600 text-white py-1 px-4 rounded-lg hover:bg-red-700"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between items-center mt-4 space-y-2 sm:space-y-0">
            <button
              disabled={currentPage === 1 || totalPages === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-gray-600 text-center sm:text-left">
              Halaman {filteredVehicleBooks.length > 0 ? currentPage : 0} dari {totalPages}
            </p>
            <button
              disabled={currentPage >= totalPages || totalPages === 1}
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

export default KendaraanPage;
