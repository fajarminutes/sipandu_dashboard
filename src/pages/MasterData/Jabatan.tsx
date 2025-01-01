import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import Swal from 'sweetalert2';

interface Position {
  position_id: number;
  position_name: string;
}

const API_BASE_URL = 'https://sipandu.sinarjernihsuksesindo.biz.id/api/positions/';

const JabatanPage: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({ position_name: '' });
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTermJabatan") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);


// Simpan ke localStorage saat searchTerm berubah
useEffect(() => {
  localStorage.setItem("searchTermJabatan", searchTerm);
}, [searchTerm]);


  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Position[]>(API_BASE_URL);
      setTimeout(() => {
      setPositions(response.data);
      setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching positions:', error);
      setIsLoading(false);
    }
  };

  const openModal = (position: Position | null = null) => {
    setEditingPosition(position);
    setFormFields({ position_name: position ? position.position_name : '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPosition(null);
    setFormFields({ position_name: '' });
  };

  const validateForm = () => {
    if (!formFields.position_name.trim()) {
      Swal.fire('Error!', 'Nama jabatan harus diisi.', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const positionData = { position_name: formFields.position_name };

      if (editingPosition) {
        // Update existing position
        await axios.put(`${API_BASE_URL}${editingPosition.position_id}`, positionData);
      } else {
        // Add new position
        await axios.post(API_BASE_URL, positionData);
      }

      fetchPositions();
      closeModal();
      Swal.fire('Success!', 'Data jabatan berhasil disimpan.', 'success');
    } catch (error) {
      console.error('Error saving position:', error);
      Swal.fire('Error!', 'Gagal menyimpan data jabatan.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Hapus jabatan?',
      text: 'Data ini tidak dapat dikembalikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}${id}`);
          fetchPositions();
          Swal.fire('Deleted!', 'Jabatan berhasil dihapus.', 'success');
        } catch (error) {
          console.error('Error deleting position:', error);
          Swal.fire('Error!', 'Gagal menghapus jabatan.', 'error');
        }
      }
    });
  };

  // Filter and Pagination Logic
  const filteredPositions = positions.filter((position) =>
    position.position_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPositions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = filteredPositions.length === 1 ? 0 : Math.ceil(filteredPositions.length / itemsPerPage);


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Jabatan</h1>
        <button
          onClick={() => openModal()}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Tambah Baru
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari jabatan..."
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
                  <th className="border px-4 py-2">Nama Jabatan</th>
                  <th className="border px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((position, index) => (
                  <tr key={position.position_id}>
                    <td className="border px-4 py-2 text-center">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="border px-4 py-2">{position.position_name}</td>
                    <td className="border justify-center flex space-x-2 px-4 py-2 text-center">
                      <button
                        onClick={() => openModal(position)}
                        className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(position.position_id)}
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
            Halaman {filteredPositions.length > 0 ? currentPage : 0} dari {totalPages}
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

      {/* Modal Tambah/Edit */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog onClose={closeModal} className="relative z-10">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
              <Dialog.Title className="text-lg font-bold mb-4">
                {editingPosition ? 'Edit Jabatan' : 'Tambah Jabatan'}
              </Dialog.Title>
              <input
                type="text"
                value={formFields.position_name}
                onChange={(e) =>
                  setFormFields({ position_name: e.target.value })
                }
                className="w-full border px-4 py-2 mb-4"
                placeholder="Nama Jabatan"
              />
              <div className="flex justify-end space-x-2">
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

       {/* Modal Informasi */}
       <Transition appear show={isInfoModalOpen} as={Fragment}>
        <Dialog onClose={() => setIsInfoModalOpen(false)} className="relative z-10">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
              <Dialog.Title className="text-lg font-bold mb-4">Informasi</Dialog.Title>
              <p className="mb-4">
                <strong>Cara Penggunaan:</strong> Gunakan kolom pencarian untuk mencari nama jabatan.
              </p>
              <p>
                <strong>Jumlah Data:</strong> Gunakan input angka untuk menentukan berapa banyak data
                yang ingin ditampilkan di setiap halaman.
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

export default JabatanPage;
