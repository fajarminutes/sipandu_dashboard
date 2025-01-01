import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Dialog, Transition } from "@headlessui/react";

interface Location {
  customer_id: number;
  name: string;
  address: string;
  radius: number;
  latitude_longtitude: string;
}

const API_BASE_URL = "https://sipandu.sinarjernihsuksesindo.biz.id/api/customers/";

const LokasiPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTermLokasi, setSearchTermLokasi] = useState(localStorage.getItem("searchTermLokasi") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    localStorage.setItem("searchTermLokasi", searchTermLokasi);
  }, [searchTermLokasi]);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Location[]>(API_BASE_URL);
      setTimeout(() => {
      setLocations(response.data.sort((a, b) => b.customer_id - a.customer_id));
      setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setIsLoading(false);
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
          await axios.delete(`${API_BASE_URL}${id}`);
          fetchLocations();
          Swal.fire({
            title: "Terhapus!",
            text: "Data lokasi berhasil dihapus!",
            icon: "success",
            confirmButtonText: "OK",
          });
        } catch (error) {
          console.error("Error deleting location:", error);
          Swal.fire({
            title: "Error!",
            text: "Gagal menghapus data lokasi.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  const filteredLocations = locations.filter((location) =>
    `${location.name} ${location.address} ${location.radius}`
      .toLowerCase()
      .includes(searchTermLokasi.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLocations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = filteredLocations.length === 1 ? 0 : Math.ceil(filteredLocations.length / itemsPerPage);



  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Lokasi</h1>
        <button
          onClick={() => navigate("/master-data/lokasi/create")}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Tambah Baru
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari lokasi..."
          value={searchTermLokasi}
          onChange={(e) => setSearchTermLokasi(e.target.value)}
          className="w-full border px-4 py-2"
        />
        <input
          type="number"
          min="1"
          max="50"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
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
                  <th className="border px-4 py-2">Nama Lokasi</th>
                  <th className="border px-4 py-2">Alamat</th>
                  <th className="border px-4 py-2">Radius</th>
                  <th className="border px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((location, index) => (
                  <tr key={location.customer_id}>
                    <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                    <td className="border px-4 py-2">{location.name}</td>
                    <td className="border px-4 py-2">{location.address}</td>
                    <td className="border px-4 py-2 text-center">{location.radius}</td>
                    <td className="border px-4 py-2 flex justify-center space-x-2">
                      <button
                        onClick={() => navigate(`/master-data/lokasi/edit/${location.customer_id}`)}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(location.customer_id)}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
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
            Halaman {filteredLocations.length > 0 ? currentPage : 0} dari {totalPages}
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

      {/* Modal Informasi */}
      <Transition appear show={isInfoModalOpen} as={Fragment}>
        <Dialog onClose={() => setIsInfoModalOpen(false)} className="relative z-10">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
              <Dialog.Title className="text-lg font-bold mb-4">Informasi</Dialog.Title>
              <p className="mb-4">
                <strong>Cara Penggunaan:</strong> Gunakan kolom pencarian untuk mencari lokasi berdasarkan nama, alamat, atau radius.
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

export default LokasiPage;
