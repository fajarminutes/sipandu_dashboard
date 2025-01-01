import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Dialog, Transition } from "@headlessui/react";
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

const API_CHECKPOINTS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/checkpoints/";
const API_AREA_PATROLI = "https://sipandu.sinarjernihsuksesindo.biz.id/api/area-patroli/";
const API_CUSTOMERS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/customers/";
const API_SHIFTS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts/";

const CheckpointsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // Modal informasi
  const [checkpoints, setCheckpoints] = useState([]);
  const [areas, setAreas] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTermCheckpoints") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const openModal = (index: number) => {
    setCurrentImageIndex(index);
  };
  
  const closeModal = () => {
    setCurrentImageIndex(null);
  };
  const nextImage = () => {
    if (currentImageIndex !== null) {
      setCurrentImageIndex((prev) => (prev! + 1) % checkpoints.length);
    }
  };
  
  const prevImage = () => {
    if (currentImageIndex !== null) {
      setCurrentImageIndex((prev) => (prev! - 1 + checkpoints.length) % checkpoints.length);
    }
  };
    

  

  const accessToken = localStorage.getItem("access_token");

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
        fetchAreas();
        fetchCustomers();
        fetchShifts();
      }, []);


  useEffect(() => {
    localStorage.setItem("searchTermCheckpoints", searchTerm);
  }, [searchTerm]);

  const fetchData = async () => {
    setIsLoading(true); // Mulai loading
    try {
      const response = await axios.get(API_CHECKPOINTS, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
  
      setTimeout(() => {
        let fetchedCheckpoints = response.data;
  
        if (userData && userData.level) {
          const userLevel = parseInt(userData.level, 10);
  
          // Jika level bukan "2", filter berdasarkan customer_id
          if (userLevel !== 2) {
            fetchedCheckpoints = fetchedCheckpoints.filter(
              (checkpoint) => checkpoint.customer_id === userLevel
            );
          }
        }
  
        // Urutkan data berdasarkan ID secara descending
        const sortedCheckpoints = fetchedCheckpoints.sort((a, b) => b.id - a.id);
  
        // Set data ke state setelah diurutkan
        setCheckpoints(sortedCheckpoints);
  
        setIsLoading(false); // Akhiri loading setelah data di-set
      }, 1000); // Delay 1 detik untuk pengalaman pengguna
    } catch (error) {
      console.error("Error fetching checkpoints:", error);
      Swal.fire("Error!", "Gagal memuat data checkpoints.", "error");
      setIsLoading(false); // Akhiri loading meskipun terjadi error
    }
  };
  
  
  useEffect(() => {
    if (userData) {
      fetchData();
    }
  }, [userData]);
  

  const fetchAreas = async () => {
    try {
      const response = await axios.get(API_AREA_PATROLI, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAreas(response.data);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };
  
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(API_CUSTOMERS, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };
  
  const fetchShifts = async () => {
    try {
      const response = await axios.get(API_SHIFTS, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setShifts(response.data);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  


  const handleDelete = async (id) => {
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
          await axios.delete(`${API_CHECKPOINTS}${id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
          fetchData();
          Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
        } catch (error) {
          console.error("Error deleting checkpoint:", error);
          Swal.fire("Error!", "Gagal menghapus data.", "error");
        }
      }
    });
  };

  const getAreaDescription = (id) => {
    return areas.find((area) => area.id_area_patroli === id)?.desc_area_patroli || "Tidak ada data";
  };

  const getCustomerName = (id) => {
    return customers.find((customer) => customer.customer_id === id)?.name || "Tidak ada data";
  };

  const getShiftName = (id) => {
    return shifts.find((shift) => shift.shift_id === id)?.shift_name || "Tidak ada data";
  };

  const getQrCodeUrl = (code) => {
    if (!code) return null;
    return `https://sipandu.sinarjernihsuksesindo.biz.id/uploads/${code.toLowerCase().replace(/\//g, "-")}.png`;
  };

  const filteredCheckpoints = checkpoints.filter((checkpoint) => {
    const areaDescription = getAreaDescription(checkpoint.id_area_patroli);
    const customerName = getCustomerName(checkpoint.customer_id);
    const shiftName = getShiftName(checkpoint.shift_id);

    return (
      checkpoint.checkpoints_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkpoint.todo_list?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      areaDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shiftName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCheckpoints.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCheckpoints.length / itemsPerPage);

  const formatTodoList = (htmlString) => {
    const words = htmlString.split(" ");
    const formatted = words.reduce((acc, word, index) => {
      const isNewLine = (index + 1) % 4 === 0;
      return acc + word + (isNewLine ? "<br>" : " ");
    }, "");
    return formatted;
  };
  

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Checkpoints</h1>
        <div className="flex space-x-4">
    <button
      onClick={() => navigate("/patroli/checkpoints/create")}
      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
    >
      Tambah Baru
    </button>
    
  </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari checkpoint berdasarkan nama, todo list, area patroli, shift, atau lokasi..."
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

<button
    onClick={() => setIsInfoModalOpen(true)}
    className="text-gray-500 hover:text-gray-700"
    title="Informasi"
  >
    ?
  </button>

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
                  <th className="border px-4 py-2">Qr Code</th>
                  <th className="border px-4 py-2">Nama</th>
                  <th className="border px-4 py-2">Todo List</th>
                  <th className="border px-4 py-2">Area Patroli</th>
                  <th className="border px-4 py-2">Shift</th>
                  <th className="border px-4 py-2">Lokasi</th>
                  <th className="border px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((checkpoint, index) => (
                  <tr key={checkpoint.id}>
                    <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                    <td className="border px-4 py-2 text-center">
  {getQrCodeUrl(checkpoint.checkpoints_code) ? (
    <img
      src={getQrCodeUrl(checkpoint.checkpoints_code)}
      alt="QR Code"
      className="w-16 h-16 object-cover cursor-pointer"
      onClick={() => openModal(indexOfFirstItem + index)}
    />
  ) : (
    "Tidak ada foto"
  )}
</td>

{currentImageIndex !== null && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
    <div className="relative bg-white p-4 rounded-lg max-w-md md:max-w-lg w-full shadow-lg">
      {/* Tombol Close */}
      <div className="absolute top-2 right-2">
        <button
          onClick={closeModal}
          className="bg-red-600 text-white px-3 rounded-full py-2 hover:bg-red-700 shadow-md focus:outline-none"
        >
          X
        </button>
      </div>
      
      {/* Konten Modal */}
      <div className="flex flex-col items-center space-y-4">
        {/* Gambar */}
        <img
          src={`https://sipandu.sinarjernihsuksesindo.biz.id/uploads/${checkpoints[currentImageIndex].checkpoints_code?.toLowerCase().replace(/\//g, "-")}.png`}
          alt={`QR Code ${checkpoints[currentImageIndex].checkpoints_code}`}
          className="max-h-32 md:max-h-64 w-auto object-contain"
        />

        {/* Tombol Navigasi */}
        <div className="flex justify-between w-full mt-4 space-x-4">
          <button
            onClick={prevImage}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex-1 focus:outline-none"
          >
            Prev
          </button>
          <button
            onClick={nextImage}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex-1 focus:outline-none"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
)}


                    <td className="border px-4 py-2">{checkpoint.checkpoints_name || "Tidak ada data"}</td>
                    <td className="border px-4 py-2 todo-list-cell">
  <div
    dangerouslySetInnerHTML={{
      __html: formatTodoList(checkpoint.todo_list || "Tidak ada data"),
    }}
  />
</td>


                    <td className="border px-4 py-2">{getAreaDescription(checkpoint.id_area_patroli)}</td>
                    <td className="border px-4 py-2">{getShiftName(checkpoint.shift_id)}</td>
                    <td className="border px-4 py-2">{getCustomerName(checkpoint.customer_id)}</td>
                    <td className="border px-4 py-2 flex justify-center space-x-2">
                      <button
                        onClick={() => navigate(`/patroli/checkpoints/edit/${checkpoint.id}`)}
                        className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(checkpoint.id)}
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
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-gray-600 text-center sm:text-left">
              Halaman {filteredCheckpoints.length > 0 ? currentPage : 0} dari {totalPages}
            </p>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
      <Transition appear show={isInfoModalOpen} as={Fragment}>
        <Dialog onClose={() => setIsInfoModalOpen(false)} className="relative z-10">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
              <Dialog.Title className="text-lg font-bold mb-4">Informasi</Dialog.Title>
              <p className="mb-4">
                <strong>Cara Penggunaan:</strong> Gunakan kolom pencarian untuk mencari checkpoints berdasarkan nama, todo list, area patroli, shift, atau lokasi.
              </p>
              <p>
                <strong>Jumlah Data:</strong> Gunakan input angka untuk menentukan berapa banyak data yang ingin ditampilkan di setiap halaman.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsInfoModalOpen(false)}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Tutup
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
      
    </div>
  );
};

export default CheckpointsPage;
