import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import Swal from 'sweetalert2';

interface Shift {
  shift_id: number;
  shift_name: string;
  time_in: string;
  time_out: string;
}

const API_BASE_URL = 'https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts/';

const ShiftPage: React.FC = () => {
  const [shiftList, setShiftList] = useState<Shift[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({
    shift_name: '',
    time_in: '',
    time_out: '',
  });
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTermShift") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  

  // Simpan ke localStorage saat searchTerm berubah
  useEffect(() => {
    localStorage.setItem("searchTermShift", searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Shift[]>(API_BASE_URL);
      setTimeout(() => {
      setShiftList(response.data);
      setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setIsLoading(false);
    }
  };

  const openModal = (shift: Shift | null = null) => {
    setEditingShift(shift);
    setFormFields({
      shift_name: shift ? shift.shift_name : '',
      time_in: shift ? shift.time_in : '',
      time_out: shift ? shift.time_out : '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingShift(null);
    setFormFields({ shift_name: '', time_in: '', time_out: '' });
  };

  const validateForm = () => {
    const { shift_name, time_in, time_out } = formFields;
    if (!shift_name || !time_in || !time_out) {
      Swal.fire('Error!', 'Semua kolom harus diisi!', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const shiftData = {
        shift_name: formFields.shift_name,
        time_in: formFields.time_in,
        time_out: formFields.time_out,
      };

      if (editingShift) {
        await axios.put(`${API_BASE_URL}${editingShift.shift_id}`, shiftData);
      } else {
        await axios.post(API_BASE_URL, shiftData);
      }

      fetchShifts();
      closeModal();
      Swal.fire('Success!', 'Shift berhasil disimpan!', 'success');
    } catch (error) {
      console.error('Error saving shift:', error);
      Swal.fire('Error!', 'Gagal menyimpan shift.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Data ini tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}${id}`);
          fetchShifts();
          Swal.fire('Deleted!', 'Shift berhasil dihapus!', 'success');
        } catch (error) {
          console.error('Error deleting shift:', error);
          Swal.fire('Error!', 'Gagal menghapus shift.', 'error');
        }
      }
    });
  };

  const filteredShifts = shiftList.filter((shift) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      shift.shift_name.toLowerCase().includes(searchValue) ||
      shift.time_in.toLowerCase().includes(searchValue) ||
      shift.time_out.toLowerCase().includes(searchValue)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredShifts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = filteredShifts.length === 1 ? 0 : Math.ceil(filteredShifts.length / itemsPerPage);


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Shift</h1>
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
          placeholder="Cari shift..."
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
                  <th className="border px-4 py-2">Nama Shift</th>
                  <th className="border px-4 py-2">Jam Masuk</th>
                  <th className="border px-4 py-2">Jam Keluar</th>
                  <th className="border px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((shift, index) => (
                  <tr key={shift.shift_id}>
                    <td className="border px-4 py-2 text-center">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="border px-4 py-2">{shift.shift_name}</td>
                    <td className="border px-4 py-2">{shift.time_in}</td>
                    <td className="border px-4 py-2">{shift.time_out}</td>
                    <td className="border px-4 py-2 flex justify-center space-x-2 text-center">
                      <button
                        onClick={() => openModal(shift)}
                        className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(shift.shift_id)}
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
            Halaman {filteredShifts.length > 0 ? currentPage : 0} dari {totalPages}
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
                {editingShift ? 'Edit Shift' : 'Tambah Shift Baru'}
              </Dialog.Title>
              <input
                type="text"
                value={formFields.shift_name}
                onChange={(e) =>
                  setFormFields({ ...formFields, shift_name: e.target.value })
                }
                className="w-full border px-4 py-2 mb-4"
                placeholder="Nama Shift"
              />
              <label className="block font-bold">Jam Masuk</label>
              <input
                type="time"
                value={formFields.time_in}
                onChange={(e) =>
                  setFormFields({ ...formFields, time_in: e.target.value })
                }
                className="w-full border px-4 py-2 mb-4"
              />
              <label className="block font-bold">Jam Keluar</label>
              <input
                type="time"
                value={formFields.time_out}
                onChange={(e) =>
                  setFormFields({ ...formFields, time_out: e.target.value })
                }
                className="w-full border px-4 py-2 mb-4"
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
                <strong>Cara Penggunaan:</strong> Gunakan kolom pencarian untuk mencari nama shift atau waktu.
              </p>
              <p>
                <strong>Jumlah Data:</strong> Gunakan input angka untuk menentukan berapa banyak data yang ingin
                ditampilkan di setiap halaman.
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

export default ShiftPage;
