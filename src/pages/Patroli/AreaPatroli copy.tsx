import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import Swal from 'sweetalert2';

interface AreaPatroli {
  id_area_patroli: number;
  desc_area_patroli: string;
  customer_id: number;
  created_at: string;
  updated_at: string;
}

interface Customer {
  customer_id: number;
  name: string;
}

const AREA_PATROLI_API = 'https://sipandu.sinarjernihsuksesindo.biz.id/api/area-patroli/';
const CUSTOMER_API = 'https://sipandu.sinarjernihsuksesindo.biz.id/api/customers/';

const AreaPatroliPage: React.FC = () => {
  const [areaPatroliList, setAreaPatroliList] = useState<AreaPatroli[]>([]);
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({
    desc_area_patroli: '',
    customer_id: '',
  });
  const [editingAreaPatroli, setEditingAreaPatroli] = useState<AreaPatroli | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState<string>(() =>
    localStorage.getItem('searchTermAreaPatroli') || ''
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAreaPatroli();
    fetchCustomers();
  }, []);

  useEffect(() => {
    localStorage.setItem('searchTermAreaPatroli', searchTerm);
  }, [searchTerm]);

  const getToken = () => localStorage.getItem('access_token');

  const fetchAreaPatroli = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Unauthorized');

      const response = await axios.get<AreaPatroli[]>(AREA_PATROLI_API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTimeout(() => {
        setAreaPatroliList(response.data);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Gagal mengambil data area patroli:', error);
      Swal.fire('Error!', 'Gagal mengambil data area patroli.', 'error');
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('Unauthorized');

      const response = await axios.get<Customer[]>(CUSTOMER_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomerList(response.data);
    } catch (error) {
      console.error('Gagal mengambil data customer:', error);
    }
  };

  const openModal = (areaPatroli: AreaPatroli | null = null) => {
    setEditingAreaPatroli(areaPatroli);
    if (areaPatroli) {
      setFormFields({
        desc_area_patroli: areaPatroli.desc_area_patroli,
        customer_id: areaPatroli.customer_id.toString(),
      });
    } else {
      setFormFields({ desc_area_patroli: '', customer_id: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAreaPatroli(null);
    setFormFields({ desc_area_patroli: '', customer_id: '' });
  };

  const validateForm = () => {
    const { desc_area_patroli, customer_id } = formFields;
    if (!desc_area_patroli || !customer_id) {
      Swal.fire('Error!', 'Semua kolom harus diisi!', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const token = getToken();
      if (!token) throw new Error('Unauthorized');

      const areaPatroliData = {
        desc_area_patroli: formFields.desc_area_patroli,
        customer_id: Number(formFields.customer_id),
      };

      if (editingAreaPatroli) {
        await axios.put(
          `${AREA_PATROLI_API}${editingAreaPatroli.id_area_patroli}`,
          areaPatroliData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(AREA_PATROLI_API, areaPatroliData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchAreaPatroli();
      closeModal();
      Swal.fire('Berhasil!', 'Data area patroli berhasil disimpan!', 'success');
    } catch (error) {
      console.error('Gagal menyimpan area patroli:', error);
      Swal.fire('Error!', 'Gagal menyimpan data area patroli.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Data ini tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = getToken();
          if (!token) throw new Error('Unauthorized');

          await axios.delete(`${AREA_PATROLI_API}${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchAreaPatroli();
          Swal.fire('Terhapus!', 'Data area patroli berhasil dihapus!', 'success');
        } catch (error) {
          console.error('Gagal menghapus area patroli:', error);
          Swal.fire('Error!', 'Gagal menghapus data area patroli.', 'error');
        }
      }
    });
  };

  const filteredAreas = areaPatroliList.filter((area) =>
    area.desc_area_patroli.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAreas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Area Patroli</h1>
        <button
          onClick={() => openModal()}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Tambah Area Patroli Baru
        </button>
      </div>

      <input
        type="text"
        placeholder="Cari area patroli..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border px-4 py-2 mb-4"
      />

      {isLoading ? (
        <div className="text-center">
          <div className="loader border-t-4 border-blue-600 border-solid rounded-full w-16 h-16 mx-auto animate-spin"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">No</th>
                <th className="border px-4 py-2">Deskripsi Area</th>
                <th className="border px-4 py-2">Nama Gedung</th>
                <th className="border px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((area, index) => (
                <tr key={area.id_area_patroli}>
                  <td className="border px-4 py-2 text-center">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="border px-4 py-2">{area.desc_area_patroli}</td>
                  <td className="border px-4 py-2">
                    {customerList.find((c) => c.customer_id === area.customer_id)?.name || '-'}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => openModal(area)}
                      className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(area.id_area_patroli)}
                      className="bg-red-600 text-white py-1 px-4 rounded-lg hover:bg-red-700"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="bg-gray-600 text-white py-1 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-gray-600">
              Halaman {currentPage} dari {totalPages}
            </p>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="bg-gray-600 text-white py-1 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaPatroliPage;
