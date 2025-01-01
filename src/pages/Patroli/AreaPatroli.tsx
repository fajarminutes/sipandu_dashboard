import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { jwtDecode } from 'jwt-decode';


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

interface UserData {
  user_id: string;
  unix_id: string;
  username: string;
  email: string;
  level: string;
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
const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // Modal informasi

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

    
  

const combinedAreas = areaPatroliList.map((area) => {
  const customer = customerList.find((c) => c.customer_id === area.customer_id);
  return {
    ...area,
    customer_name: customer ? customer.name : "-", // Tambahkan nama gedung
  };

 
  
});

const customerOptions = customerList.map((customer) => ({
  value: customer.customer_id,
  label: customer.name,
}));




  // Search & Pagination
    const [searchTerm, setSearchTerm] = useState<string>(() =>
      localStorage.getItem('searchTermAreaPatroli') || ''
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // Jumlah data per halaman

    const filteredAreas = combinedAreas.filter((area) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        area.desc_area_patroli.toLowerCase().includes(searchLower) || // Filter berdasarkan deskripsi
        area.customer_name.toLowerCase().includes(searchLower) // Filter berdasarkan nama gedung
      );
    });
    
    const totalPages = filteredAreas.length === 0 ? 1 : Math.ceil(filteredAreas.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAreas.slice(indexOfFirstItem, indexOfLastItem);

  
  useEffect(() => {
    fetchAreaPatroli();
    fetchCustomers();
  }, []);

    useEffect(() => {
      if (userData) {
        fetchAreaPatroli(); // Hanya dipanggil jika userData sudah ada
      }
  }, [userData]);

  useEffect(() => {
    localStorage.setItem('searchTermAreaPatroli', searchTerm); // Simpan nilai pencarian ke localStorage
  }, [searchTerm]);


  // Fungsi untuk mendapatkan token dari localStorage
  const getToken = () => {
    const token = localStorage.getItem('access_token');
    return token;
  };
  

  const fetchAreaPatroli = async () => {
    setIsLoading(true); // Mulai loading
    try {
        const response = await axios.get(AREA_PATROLI_API);

        // Tunggu 1 detik sebelum melanjutkan
        setTimeout(() => {
            if (userData && userData.level) {
               

                let filteredAreas = response.data;

                // Pastikan level dibandingkan dengan tipe data yang sama
                const userLevel = parseInt(userData.level, 10);

                // Jika level selain "2", filter berdasarkan customer_id
                if (userLevel != 2) {
                    filteredAreas = filteredAreas.filter(
                        (area) => area.customer_id === userLevel
                    );
                }

                // Urutkan data berdasarkan ID dari besar ke kecil
                const sortedAreas = filteredAreas.sort(
                    (a, b) => b.id_area_patroli - a.id_area_patroli
                );
                setAreaPatroliList(sortedAreas); // Set data setelah diurutkan
            } else {
              
                setAreaPatroliList([]); // Kosongkan data jika tidak ada userData atau level
            }

            setIsLoading(false); // Akhiri loading setelah data di-set
        }, 1000); // Delay 1 detik
    } catch (error) {
        console.error("Error fetching area patroli:", error);
        Swal.fire("Error!", "Gagal memuat data area patroli.", "error");
        setIsLoading(false); // Akhiri loading meskipun terjadi error
    }
};



  const fetchCustomers = async () => {
    try {
      const token = getToken(); // Ambil token dari localStorage
      if (!token) {
        Swal.fire({
          title: 'Unauthorized',
          text: 'Anda belum login. Silakan login terlebih dahulu.',
          icon: 'warning',
        });
        return;
      }

      const response = await axios.get<Customer[]>(CUSTOMER_API, {
        headers: {
          Authorization: `Bearer ${token}`, // Tambahkan token di header
        },
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
      Swal.fire({
        title: 'Error!',
        text: 'Semua kolom harus diisi!',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const areaPatroliData = {
        desc_area_patroli: formFields.desc_area_patroli,
        customer_id: Number(formFields.customer_id),
      };

      const token = getToken(); // Ambil token dari localStorage
      if (!token) {
        Swal.fire({
          title: 'Unauthorized',
          text: 'Anda belum login. Silakan login terlebih dahulu.',
          icon: 'warning',
        });
        return;
      }

      if (editingAreaPatroli) {
        await axios.put(`${AREA_PATROLI_API}${editingAreaPatroli.id_area_patroli}`, areaPatroliData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await axios.post(AREA_PATROLI_API, areaPatroliData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }

      fetchAreaPatroli();
      closeModal();
      Swal.fire({
        title: 'Berhasil!',
        text: 'Data area patroli berhasil disimpan!',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      console.error('Gagal menyimpan area patroli:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Gagal menyimpan data area patroli.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
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
          const token = getToken(); // Ambil token dari localStorage
          if (!token) {
            Swal.fire({
              title: 'Unauthorized',
              text: 'Anda belum login. Silakan login terlebih dahulu.',
              icon: 'warning',
            });
            return;
          }

          await axios.delete(`${AREA_PATROLI_API}${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          fetchAreaPatroli();
          Swal.fire({
            title: 'Terhapus!',
            text: 'Data area patroli berhasil dihapus!',
            icon: 'success',
            confirmButtonText: 'OK',
          });
        } catch (error) {
          console.error('Gagal menghapus area patroli:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Gagal menghapus data area patroli.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      }
    });
  };

  return (
    <div className="p-6 ">
        <div className='flex justify-between items-center mb-4'>
        <h1 className="text-2xl font-bold mb-6">Data Area Patroli</h1>
      <button
        onClick={() => openModal()}
        className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 mb-4"
      >
        Tambah Baru
      </button>
        </div>
        <div className="flex items-center space-x-4 mb-4">
  <input
    type="text"
    placeholder="Cari area patroli..."
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
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
  <div className="overflow-x-auto">
    <table className="table-auto w-full border-collapse border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-4 py-2">No</th>
          <th className="border px-4 py-2">Deskripsi Area</th>
          <th className="border px-4 py-2">Nama Lokasi</th>
          <th className="border px-4 py-2">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {currentItems.map((area, index) => (
          <tr key={area.id_area_patroli}>
            {/* Nomor Urut */}
            <td className="border px-4 py-2 text-center">
              {indexOfFirstItem + index + 1}
            </td>
            
            {/* Deskripsi Area */}
            <td className="border px-4 py-2">{area.desc_area_patroli}</td>
            
            {/* Nama Lokasi */}
            <td className="border px-4 py-2">{area.customer_name}</td>
            
            {/* Aksi */}
            <td className="border px-4 py-2 flex justify-center space-x-2">
              <button
                onClick={() => openModal(area)}
                className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700"
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
  </div>

  {/* Tombol Navigasi Pagination */}
  <div className="flex flex-col sm:flex-row sm:justify-between items-center mt-4 space-y-2 sm:space-y-0">
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((prev) => prev - 1)}
      className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
    >
      Previous
    </button>
    <p className="text-gray-600 text-center sm:text-left">
      Halaman {currentPage} dari {totalPages}
    </p>
    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((prev) => prev + 1)}
      className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>

      )}

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <div className="fixed inset-0 bg-black bg-opacity-25" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
                <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                  {editingAreaPatroli ? 'Edit Area Patroli' : 'Tambah Area Patroli Baru'}
                </Dialog.Title>
                <div className="mt-4">
                  <label className="block font-bold">Deskripsi Area Patroli</label>
                  <input
                    type="text"
                    value={formFields.desc_area_patroli}
                    onChange={(e) => setFormFields({ ...formFields, desc_area_patroli: e.target.value })}
                    className="form-input mt-2 w-full"
                  />
                </div>
                <div className="mt-4">
                  <label className="block font-bold">Nama Lokasi</label>
                  <Select
  options={
    userData && userData.level === "2" // Jika level 2, tampilkan semua opsi
      ? customerOptions
      : customerOptions.filter((option) => option.value === parseInt(userData?.level || "0", 10)) // Filter sesuai level
  }
  value={customerOptions.find((option) => option.value === Number(formFields.customer_id))} // Nilai yang dipilih
  onChange={(selectedOption) =>
    setFormFields((prev) => ({
      ...prev,
      customer_id: selectedOption ? selectedOption.value : "",
    }))
  } // Fungsi untuk menangani perubahan nilai
  placeholder="Pilih Lokasi"
  isClearable // Tambahkan opsi untuk menghapus pilihan
/>

                </div>
                <div className="mt-6 flex justify-between">
                  <button type="button" className="bg-gray-600 text-white py-2 px-6 rounded-lg" onClick={closeModal}>
                    Batal
                  </button>
                  <button type="button" className="bg-blue-600 text-white py-2 px-6 rounded-lg" onClick={handleSave}>
                    {editingAreaPatroli ? 'Perbarui' : 'Simpan'}
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isInfoModalOpen} as={Fragment}>
  <Dialog onClose={() => setIsInfoModalOpen(false)} className="relative z-10">
    <div className="fixed inset-0 bg-black bg-opacity-30" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <Dialog.Title className="text-lg font-bold mb-4">Informasi</Dialog.Title>
        <p className="mb-4">
          <strong>Cara Penggunaan:</strong> Gunakan kolom pencarian untuk mencari area patroli berdasarkan deskripsi atau nama lokasi.
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

export default AreaPatroliPage;
