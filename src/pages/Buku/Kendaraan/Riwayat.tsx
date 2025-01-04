import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
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

const API_ADD_VEHICLE = 'https://sipandu.sinarjernihsuksesindo.biz.id/api/add_vehicle/';
const AREA_API_URL = 'https://sipandu.sinarjernihsuksesindo.biz.id/api/areas/';
const VEHICLE_BOOK_API_URL = 'https://sipandu.sinarjernihsuksesindo.biz.id/api/vehicle_book/';

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

const AddVehiclePage = () => {
    const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [areas, setAreas] = useState({});
  const [vehicleBooks, setVehicleBooks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTermVehicles") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
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
  useEffect(() => {
    localStorage.setItem("searchTermVehicles", searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if(userData) {
    fetchVehicles();
    fetchAreas();
    fetchVehicleBooks();
    }
  }, [userData]);

  const fetchVehicles = async () => {
    setIsLoading(true); // Mulai loading
    try {
        const response = await axios.get(API_ADD_VEHICLE);
        let vehicles = response.data;

        // Pastikan userData tersedia
        if (userData && userData.level) {
            const userLevel = parseInt(userData.level, 10);
            // Jika level selain "2", filter berdasarkan customer_id
            if (userLevel !== 2) {
                vehicles = vehicles.filter(
                    (vehicle) => vehicle.customer_id === userLevel
                );
            }
        }

        // Tambahkan delay 1 detik sebelum mengatur state
        setTimeout(() => {
            setVehicles(vehicles); // Set data setelah di-filter
            setIsLoading(false); // Akhiri loading
        }, 1000); // Delay 1 detik
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        setIsLoading(false); // Akhiri loading jika ada error
    }
};


  const fetchAreas = async () => {
    try {
      const response = await axios.get(AREA_API_URL);
      const areaMap = response.data.reduce((acc, area) => {
        acc[area.id_area] = area.area_name;
        return acc;
      }, {});
      setAreas(areaMap);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchVehicleBooks = async () => {
    try {
      const response = await axios.get(VEHICLE_BOOK_API_URL);
      const vehicleBookMap = response.data.reduce((acc, book) => {
        acc[book.id_vehicle_book] = book;
        return acc;
      }, {});
      setVehicleBooks(vehicleBookMap);
    } catch (error) {
      console.error('Error fetching vehicle books:', error);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Hapus kendaraan?',
      text: 'Data ini tidak dapat dikembalikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_ADD_VEHICLE}${id}`);
          fetchVehicles();
          Swal.fire('Deleted!', 'Data kendaraan berhasil dihapus.', 'success');
        } catch (error) {
          console.error('Error deleting vehicle:', error);
          Swal.fire('Error!', 'Gagal menghapus data kendaraan.', 'error');
        }
      }
    });
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const areaName = areas[vehicle.id_area] || "";
    const bookDate = vehicleBooks[vehicle.id_vehicle_book]?.vehicle_book_date || "";
    return (
      areaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.nopol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Riwayat Kendaraan</h1>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari data kendaraan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border px-4 py-2"
        />
        <input
          type="number"
          min="1"
          max="50"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="border px-2 py-1 w-20 ml-2"
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
                <th className="border px-4 py-2">Nama Area</th>
                <th className="border px-4 py-2">Tanggal</th>
                <th className="border px-4 py-2">Type Model</th>
                <th className="border px-4 py-2">No. Polisi</th>
                <th className="border px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((vehicle, index) => {
                const formattedDate = formatDate(vehicleBooks[vehicle.id_vehicle_book]?.vehicle_book_date || '-');
                return (
                    <>       
                <tr key={vehicle.id_add_vehicle}>
                  <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                  <td className="border px-4 py-2">{areas[vehicle.id_area] || '-'}</td>
                  <td className="border px-4 py-2">{formattedDate}</td>
                  <td className="border px-4 py-2">{vehicle.model_type}</td>
                  <td className="border px-4 py-2">{vehicle.nopol}</td>
                  <td className="border px-4 py-2 flex justify-center space-x-2">
                    <button
                    onClick={() => navigate(`/buku/kendaraan/riyawat/view/${vehicle.id_add_vehicle}`)}
                      className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700 mr-2"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id_add_vehicle)}
                      className="bg-red-600 text-white py-1 px-4 rounded-lg hover:bg-red-700"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
                </>
                )
             })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center mt-4 space-y-2 sm:space-y-0">
          <button
            disabled={currentPage === 1 || totalPages === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-gray-600 text-center sm:text-left">
            Halaman {filteredVehicles.length > 0 ? currentPage : 0} dari {totalPages}
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

export default AddVehiclePage;
