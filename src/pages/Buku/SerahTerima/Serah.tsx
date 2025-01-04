import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
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

const API_HANDOVER = "https://sipandu.sinarjernihsuksesindo.biz.id/api/handover/";
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

const HandoverPage = () => {
  const navigate = useNavigate();
  const [handovers, setHandovers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTermHandover") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [isModalOpenGambar, setIsModalOpenGambar] = useState(false);
const [selectedImage, setSelectedImage] = useState(null);
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


const openModal = (image) => {
  setSelectedImage(image);
  setIsModalOpenGambar(true);
};

const closeModal = () => {
  setIsModalOpenGambar(false);
  setSelectedImage(null);
};

  useEffect(() => {
    const fetchData = async () => {
      await fetchEmployees(); // Ambil data karyawan terlebih dahulu
    };
    fetchData();
  }, []);
  useEffect(() => {
      if (userData) {
        fetchHandoverData();
      }
    }, [userData]);


  useEffect(() => {
    localStorage.setItem("searchTermHandover", searchTerm);
  }, [searchTerm]);

  const fetchHandoverData = async () => {
    setIsLoading(true);
    try {
        // Tambahkan delay 1 detik
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const response = await axios.get(API_HANDOVER);
        let handoverData = response.data;

        // Pastikan userData tersedia
        if (userData && userData.level) {
            const userLevel = parseInt(userData.level, 10);
            // Jika level selain "2", filter berdasarkan customer_id
            if (userLevel !== 2) {
                handoverData = handoverData.filter(
                    (handover) => handover.customer_id === userLevel
                );
            }
        }

        // Urutkan data berdasarkan ID dari besar ke kecil
        const sortedHandoverData = handoverData.sort((a, b) => b.id_handover - a.id_handover);

        setHandovers(sortedHandoverData); // Set data setelah diurutkan
    } catch (error) {
        Swal.fire("Error!", "Gagal memuat data serah terima.", "error");
    } finally {
        setIsLoading(false); // Akhiri loading setelah data di-set
    }
};


  const fetchEmployees = async () => {
    try {
      const response = await axios.get(API_EMPLOYEES);
      setEmployees(response.data);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data karyawan.", "error");
    }
  };

  const filteredHandover = handovers.filter((handover) => {
    return (
      (handover.item_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (handover.givers_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (handover.recipientName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (handover.handover_date?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHandover.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHandover.length / itemsPerPage);

  const handleDelete = async (id_handover) => {
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
          await axios.delete(`${API_HANDOVER}${id_handover}`);
          setHandovers((prevHandovers) =>
            prevHandovers.filter((handover) => handover.id_handover !== id_handover)
          ); // Update state
          Swal.fire("Terhapus!", "Data serah terima berhasil dihapus!", "success");
        } catch (error) {
          console.error("Error deleting handover:", error);
          Swal.fire("Error!", "Gagal menghapus data serah terima.", "error");
        }
      }
    });
  };

  

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Serah Terima</h1>
        <button
          onClick={() => navigate("/buku/serahterima/create")}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Tambah Baru
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan nama barang, pemberi, penerima, atau tanggal..."
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
                  <th className="border px-4 py-2">Tanggal</th>
                  <th className="border px-4 py-2">Nama Barang</th>
                  <th className="border px-4 py-2">Pemberi</th>
                  <th className="border px-4 py-2">Penerima</th>
                  <th className="border px-4 py-2">Foto</th>
                  <th className="border px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((handover, index) => {
                  const formattedDate = formatDate(handover.handover_date); // Format tanggal
                  const recipientName =
                  employees.find((emp) => emp.id === handover.id)?.employees_name || "Tidak ada data";
                  return (
                    <tr key={handover.id_handover}>
                      <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                      <td className="border px-4 py-2 text-center">{formattedDate}</td>
                      <td className="border px-4 py-2">{handover.item_name}</td>
                      <td className="border px-4 py-2">{handover.givers_name}</td>
                      <td className="border px-4 py-2">{recipientName}</td>
                      <td className="border px-4 py-2">
  {handover.handover_photo ? (
    <img
      src={`https://sipandu.sinarjernihsuksesindo.biz.id/${handover.handover_photo}`}
      alt="Foto Handover"
      className="w-16 h-16 object-cover cursor-pointer"
      onClick={() => openModal(`https://sipandu.sinarjernihsuksesindo.biz.id/${handover.handover_photo}`)}
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
        alt="Foto Handover"
        className="w-full h-auto max-h-[80vh] object-contain"
      />
    </div>
  </div>
)}



                      <td className="border px-4 py-2 flex justify-center space-x-2">
                        <button
                          onClick={() => navigate(`/buku/serahterima/edit/${handover.id_handover}`)}
                          className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(handover.id_handover)}
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

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-center mt-4 space-y-2 sm:space-y-0">
            <button
              disabled={currentPage === 1 || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-gray-600 text-center sm:text-left">
              Halaman {filteredHandover.length > 0 ? currentPage : 0} dari {totalPages}
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

export default HandoverPage;
