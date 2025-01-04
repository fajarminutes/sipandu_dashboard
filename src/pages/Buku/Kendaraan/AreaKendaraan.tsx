import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import Swal from "sweetalert2";
import Select from 'react-select'; // Import Select dari react-select
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

interface Area {
  id_area: number;
  area_name: string;
  building_id: number;
}

interface Customer {
  customer_id: number;
  name: string;
}

const API_AREAS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/areas/";
const API_CUSTOMERS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/customers/";

const AreaPage: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({ area_name: "", building_id: "" });
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAreas(), fetchCustomers()]);
      setTimeout(() => setIsLoading(false), 1000); // Menambahkan jeda waktu 1 detik
    };

    fetchData();
  }, [userData]); // Tambahkan userData sebagai dependensi

  const fetchAreas = async () => {
    try {
      if (!userData || !userData.level) {
        console.error("User data or level is undefined");
        return; // Keluar dari fungsi jika userData atau level tidak ada
      }

      const url = userData.level === 2 ? API_AREAS : `${API_AREAS}building/${userData.level}`;
      const response = await axios.get<Area[]>(url);
      const sortedAreas = response.data.sort((a, b) => b.id_area - a.id_area);
      setAreas(sortedAreas);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      if (!userData || !userData.level) {
        console.error("User data or level is undefined");
        return; // Keluar dari fungsi jika userData atau level tidak ada
      }

      const url = userData.level === 2 ? API_CUSTOMERS : `${API_CUSTOMERS}${userData.level}`;
      const response = await axios.get<Customer[]>(url);

      // Pastikan response.data adalah array
      if (Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        console.error("Data customers tidak dalam format array:", response.data);
        // Jika response.data adalah objek tunggal, Anda bisa mengubahnya menjadi array
        if (response.data.customer_id) {
          setCustomers([response.data]); // Mengubah objek tunggal menjadi array
        } else {
          setCustomers([]); // Atur ke array kosong jika tidak sesuai
        }
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]); // Atur ke array kosong jika terjadi error
    }
  };

  const openModal = (area: Area | null = null) => {
    setEditingArea(area);
    setFormFields({
      area_name: area ? area.area_name : "",
      building_id: area ? area.building_id.toString() : "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingArea(null);
    setFormFields({ area_name: "", building_id: "" });
  };

  const validateForm = () => {
    if (!formFields.area_name.trim() || !formFields.building_id.trim()) {
      Swal.fire("Error!", "Nama area dan lokasi penempatan harus diisi.", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const areaData = { area_name: formFields.area_name, building_id: Number(formFields.building_id) };

      if (editingArea) {
        await axios.put(`${API_AREAS}${editingArea.id_area}`, areaData);
      } else {
        await axios.post(API_AREAS, areaData);
      }

      fetchAreas();
      closeModal();
      Swal.fire("Success!", "Data area berhasil disimpan.", "success");
    } catch (error) {
      console.error("Error saving area:", error);
      Swal.fire("Error!", "Gagal menyimpan data area.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Hapus area?",
      text: "Data ini tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Hapus area melalui API
          await axios.delete(`${API_AREAS}${id}`);

          // Perbarui state areas secara lokal tanpa memuat ulang data dari server
          setAreas((prevAreas) => prevAreas.filter((area) => area.id_area !== id));

          Swal.fire("Deleted!", "Area berhasil dihapus.", "success");
        } catch (error) {
          console.error("Error deleting area:", error);
          Swal.fire("Error!", "Gagal menghapus area.", "error");
        }
      }
    });
  };

  const filteredAreas = areas.filter((area) =>
    area.area_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAreas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);

  const getCustomerName = (building_id: number) => {
    const customer = customers.find((c) => c.customer_id === building_id);
    return customer ? customer.name : "Tidak diketahui";
  };

  // Konversi data customers untuk digunakan dalam Select
  const customerOptions = customers.map((customer) => ({
    value: customer.customer_id,
    label: customer.name,
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Area</h1>
        <button
          onClick={() => openModal()}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Tambah Area
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari area..."
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
                  <th className="border px-4 py-2">Nama Area</th>
                  <th className="border px-4 py-2">Lokasi Penempatan</th>
                  <th className="border px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((area, index) => (
                  <tr key={area.id_area}>
                    <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                    <td className="border px-4 py-2">{area.area_name}</td>
                    <td className="border px-4 py-2">{getCustomerName(area.building_id)}</td>
                    <td className="border px-4 py-2 flex justify-center space-x-2">
                      <button
                        onClick={() => openModal(area)}
                        className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(area.id_area)}
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
            <p className="text-gray-600">
              Halaman {currentPage} dari {totalPages}
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

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog onClose={closeModal} className="relative z-10">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
              <Dialog.Title className="text-lg font-bold mb-4">
                {editingArea ? "Edit Area" : "Tambah Area"}
              </Dialog.Title>
              <input
                type="text"
                value={formFields.area_name}
                onChange={(e) => setFormFields({ ...formFields, area_name: e.target.value })}
                className="w-full border px-4 py-2 mb-4"
                placeholder="Nama Area"
              />
              <Select
                options={customerOptions}
                value={customerOptions.find(option => option.value === Number(formFields.building_id))}
                onChange={(selectedOption) => {
                  setFormFields({ ...formFields, building_id: selectedOption ? selectedOption.value.toString() : "" });
                }}
                placeholder="Pilih Lokasi Penempatan"
                isClearable
              />
             <div className="mt-6 flex justify-between">
                <button
                  onClick={closeModal}
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AreaPage;
