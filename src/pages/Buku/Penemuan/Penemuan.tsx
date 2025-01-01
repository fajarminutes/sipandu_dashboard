import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";


const API_ITEM_DISCOVERY = "https://sipandu.sinarjernihsuksesindo.biz.id/api/item_discovery/";
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

const ItemPage = () => {
    const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTermItem") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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
    const fetchData = async () => {
      await fetchEmployees(); // Fetch employee data
      await fetchItemDiscovery(); // Fetch item discovery data
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("searchTermItem", searchTerm);
  }, [searchTerm]);

  const fetchItemDiscovery = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_ITEM_DISCOVERY);
      setTimeout(() => {
        const sortedItems = response.data.sort(
          (a, b) => b.id_item_discovery - a.id_item_discovery
        );
        setItems(sortedItems);
        setIsLoading(false); // Pindahkan ke dalam setTimeout
      }, 1000);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data item discovery.", "error");
      setIsLoading(false); // Tetap panggil jika ada error
    }
  };
  
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(API_EMPLOYEES);
      setTimeout(() => {
        setEmployees(response.data);
      }, 1000);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data karyawan.", "error");
    }
  };
  

  const filteredItems = items.filter((item) => {
    return (
      (item.inventors_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (employees.find((emp) => emp.id === item.id)?.employees_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.item_discovery_date?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleDelete = async (id_item_discovery) => {
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
          await axios.delete(`${API_ITEM_DISCOVERY}${id_item_discovery}`);
          setItems((prevItems) =>
            prevItems.filter((item) => item.id_item_discovery !== id_item_discovery)
          );
          Swal.fire("Terhapus!", "Data berhasil dihapus!", "success");
        } catch (error) {
          Swal.fire("Error!", "Gagal menghapus data.", "error");
        }
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Barang Ditemukan</h1>
        <button
          onClick={() => navigate("/buku/penemuan/create")}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Tambah Baru
        </button>
      </div>



      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan nama penemu, petugas, atau tanggal..."
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
        <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-8">
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">No</th>
                  <th className="border px-4 py-2">Tanggal</th>
                  <th className="border px-4 py-2">Nama Penemu Barang</th>
                  <th className="border px-4 py-2">Petugas</th>
                  <th className="border px-4 py-2">Jam</th>
                  <th className="border px-4 py-2">Foto</th>
                  <th className="border px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => {
                  const formattedDate = formatDate(item.item_discovery_date);
                  const employeeName =
                    employees.find((emp) => emp.id === item.id)?.employees_name || "Tidak ada data";
                    const formatTime = (timeString) => {
                      const [hour, minute] = timeString.split(":"); // Ambil jam dan menit
                      return `${hour}.${minute}`; // Format menjadi "jam.menit"
                    };

                  return (
                    <tr key={item.id_item_discovery}>
                      <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                      <td className="border px-4 py-2 text-center">{formattedDate}</td>
                      <td className="border px-4 py-2">{item.inventors_name}</td>
                      <td className="border px-4 py-2">{employeeName}</td>
                      <td className="border px-4 py-2 text-center">
  {item.o_clock_item_discovery ? formatTime(item.o_clock_item_discovery) : "-"}
</td>
                      <td className="border px-4 py-2">
  {item.item_discovery_photo ? (
    <img
      src={`https://sipandu.sinarjernihsuksesindo.biz.id/${item.item_discovery_photo}`}
      alt="Foto Penemuan Barang"
      className="w-16 h-16 object-cover cursor-pointer"
      onClick={() => openModal(`https://sipandu.sinarjernihsuksesindo.biz.id/${item.item_discovery_photo}`)}
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
        alt="Foto Penemuan Barang"
        className="w-full h-auto max-h-[80vh] object-contain"
      />
    </div>
  </div>
)}

                      <td className="border px-4 py-2 flex justify-center space-x-2">
                      <button
                          onClick={() => navigate(`/buku/penemuan/edit/${item.id_item_discovery}`)}
                          className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id_item_discovery)}
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
          <div className="flex justify-between items-center mt-4">
            <button
              disabled={currentPage === 1 || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-gray-600">
              Halaman {filteredItems.length > 0 ? currentPage : 0} dari {totalPages}
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

export default ItemPage;
