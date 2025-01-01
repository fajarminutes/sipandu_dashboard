import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Dialog, Transition } from "@headlessui/react"; // Pastikan diimpor
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


const API_EMPLOYEES = "https://sipandu.sinarjernihsuksesindo.biz.id/api/employees/";
const API_SHIFTS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts/";
const API_POSITIONS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/positions/";
const API_CUSTOMERS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/customers/";

const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [penempatan, setPenempatan] = useState([]);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTermEmployees") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // Tambahkan state ini
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // Tambahkan state ini
  const [importFile, setImportFile] = useState(null); // State untuk file
  const [isImportLoading, setIsImportLoading] = useState(false); // State untuk tombol loading
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

      const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

const openModal = (index: number) => {
  setCurrentImageIndex(index);
};

const closeModal = () => {
  setCurrentImageIndex(null);
};

const nextImage = () => {
  if (currentImageIndex !== null) {
    setCurrentImageIndex((prev) => (prev! + 1) % employees.length);
  }
};

const prevImage = () => {
  if (currentImageIndex !== null) {
    setCurrentImageIndex((prev) => (prev! - 1 + employees.length) % employees.length);
  }
};


const handleFileChange = (e) => {
  setImportFile(e.target.files[0]);
};


const handleImportSubmit = async () => {
  if (!importFile) {
    Swal.fire("Error", "Pilih file sebelum mengimpor!", "error");
    return;
  }

  const formData = new FormData();
  formData.append("file", importFile);

  // Ubah status tombol menjadi loading
  setIsImportLoading(true);

  try {
    const response = await axios.post(`${API_EMPLOYEES}import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const { message, errors } = response.data;

    if (errors && errors.length > 0) {
      // Simpan error ke localStorage dengan timestamp
      const timestamp = new Date().getTime();
      const errorData = { errors, timestamp };
      localStorage.setItem("import_errors", JSON.stringify(errorData));

      // Tampilkan dialog dengan dua opsi
      Swal.fire({
        icon: "warning",
        title: "Import Sebagian Berhasil",
        text: "Data berhasil diimpor sebagian, pilih tindakan:",
        showCancelButton: true,
        confirmButtonText: "Lihat Notifikasi",
        cancelButtonText: "OK",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/master-data/karyawan/error-import"; // Arahkan ke halaman ErrorPage
        } else {
          setIsImportModalOpen(false); // Tutup modal
        }
      });
    } else {
      // Semua data berhasil diimpor
      Swal.fire("Success", message, "success");
      setIsImportModalOpen(false); // Tutup modal
    }

    fetchEmployees(); // Perbarui data
  } catch (error) {
    console.error("Error importing data:", error);

    // Tampilkan pesan error dari backend jika ada
    if (error.response && error.response.data && error.response.data.error) {
      Swal.fire("Error", error.response.data.error, "error");
    } else {
      Swal.fire("Error", "Gagal mengimpor data. Periksa file Anda dan coba lagi.", "error");
    }
  } finally {
    setIsImportLoading(false); // Kembalikan tombol ke status awal
  }
};

  useEffect(() => {
  
    fetchPositions();
    fetchShifts();
    fetchPenempatan();
  }, []);

  useEffect(() => {
    localStorage.setItem("searchTermEmployees", searchTerm);
  }, [searchTerm]);

  const fetchEmployees = async () => {
    setIsLoading(true); // Mulai loading
    try {
      let apiUrl = API_EMPLOYEES; // Default URL untuk level 2 (semua data)
  
      // Jika level pengguna bukan 2, gunakan URL khusus
      if (userData && userData.level != "2") {
        apiUrl = `${API_EMPLOYEES}customer/${userData.level}`; // Sesuaikan URL untuk level tertentu
      }
  
  
      const response = await axios.get(apiUrl);
     
      // Urutkan data berdasarkan ID dari besar ke kecil
      const sortedEmployees = response.data.sort((a, b) => b.id - a.id);
      setEmployees(sortedEmployees); // Set data setelah diurutkan
    } catch (error) {
      console.error("Error fetching employees:", error.response?.data || error.message); // Debug error
      Swal.fire("Error!", error.response?.data?.message || "Gagal memuat data karyawan.", "error");
    } finally {
      setIsLoading(false); // Akhiri loading meskipun terjadi error
    }
  };
  useEffect(() => {
    if (userData) {
      fetchEmployees(); // Panggil fetchEmployees hanya jika userData sudah ada
    }
  }, [userData]);
  

const fetchPositions = async () => {
    try {
        const response = await axios.get(API_POSITIONS);
        setTimeout(() => {
            setPositions(response.data); // Set data setelah 1 detik
        }, 1000); // Simulasi delay 1 detik
    } catch (error) {
        console.error("Error fetching positions:", error);
        Swal.fire("Error!", "Gagal memuat data posisi.", "error");
    }
};

const fetchShifts = async () => {
    try {
        const response = await axios.get(API_SHIFTS);
        setTimeout(() => {
            setShifts(response.data); // Set data setelah 1 detik
        }, 1000); // Simulasi delay 1 detik
    } catch (error) {
        console.error("Error fetching shifts:", error);
        Swal.fire("Error!", "Gagal memuat data shift.", "error");
    }
};

const fetchPenempatan = async () => {
    try {
        const response = await axios.get(API_CUSTOMERS);
        setTimeout(() => {
            setPenempatan(response.data); // Set data setelah 1 detik
        }, 1000); // Simulasi delay 1 detik
    } catch (error) {
        console.error("Error fetching penempatan:", error);
        Swal.fire("Error!", "Gagal memuat data penempatan.", "error");
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
          await axios.delete(`${API_EMPLOYEES}${id}`);
          fetchEmployees();
          Swal.fire("Terhapus!", "Data karyawan berhasil dihapus!", "success");
        } catch (error) {
          console.error("Error deleting employee:", error);
          Swal.fire("Error!", "Gagal menghapus data karyawan.", "error");
        }
      }
    });
  };

  const filteredEmployees = employees.filter((employee) => {
    const positionName = positions.find((p) => p.position_id === employee.position_id)?.position_name || "";
    const shiftName = shifts.find((s) => s.shift_id === employee.shift_id)?.shift_name || "";
    const penempatanName = penempatan.find((p) => p.customer_id === employee.id_area_patroli)?.name || "";
    return (
      employee.employees_nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employees_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employees_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      positionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shiftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      penempatanName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = filteredEmployees.length === 1 ? 0 : Math.ceil(filteredEmployees.length / itemsPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
  <h1 className="text-2xl font-bold">Data Pegawai </h1>
  <div className="flex space-x-4">
    <button
      onClick={() => navigate("/master-data/karyawan/create")}
      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
    >
      Tambah Baru
    </button>
    <button
      onClick={() => setIsImportModalOpen(true)}
      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
      title="Import Data"
    >
      Import
    </button>
  </div>
</div>

      

      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari karyawan berdasarkan NIP, nama, email, jabatan, shift, atau penempatan..."
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
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
  <thead className="bg-gray-100">
    <tr>
      <th className="border px-4 py-2">No</th>
      <th className="border px-4 py-2">Qr Code</th>
      <th className="border px-4 py-2">NIP</th>
      <th className="border px-4 py-2">Nama</th>
      <th className="border px-4 py-2">Email</th>
      <th className="border px-4 py-2">Jabatan</th>
      <th className="border px-4 py-2">Shift</th>
      <th className="border px-4 py-2">Penempatan</th>
      <th className="border px-4 py-2">Aksi</th>
    </tr>
  </thead>
  <tbody>
    {currentItems.map((employee, index) => {
      const positionName = positions.find((p) => p.position_id === employee.position_id)?.position_name || "Tidak ada data";
      const shiftName = shifts.find((s) => s.shift_id === employee.shift_id)?.shift_name || "Tidak ada data";
      const penempatanName = penempatan.find((p) => p.customer_id === employee.customer_id)?.name || "Tidak ada data";
      const qrCodeUrl = employee.employees_code
        ? `https://sipandu.sinarjernihsuksesindo.biz.id/uploads/${employee.employees_code.toLowerCase().replace(/\//g, "-")}.png`
        : null;

      return (
        <tr key={employee.id}>
          <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
          <td className="border px-4 py-2 text-center">
  {qrCodeUrl ? (
    <img
      src={qrCodeUrl}
      alt={`${employee.employees_code}`}
      className="w-16 h-16 object-cover cursor-pointer"
      onClick={() => openModal(indexOfFirstItem + index)}
    />
  ) : (
    "Tidak ada data"
  )}
</td>
{currentImageIndex !== null && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
    <div className="relative bg-white p-4 rounded-lg max-w-md w-full">
      {/* Tombol Close */}
      <div className="absolute top-2 right-2">
        <button
          onClick={closeModal}
          className="bg-red-600 text-white px-3 rounded-full py-2 hover:bg-red-700 shadow-md"
        >
          X
        </button>
      </div>
      {/* Konten Modal */}
      <div className="flex flex-col items-center space-y-4">
        {/* Gambar */}
        <img
  src={`https://sipandu.sinarjernihsuksesindo.biz.id/uploads/${employees[currentImageIndex].employees_code?.toLowerCase().replace(/\//g, "-")}.png`}
  alt={employee.employees_code}
  className="max-h-32 md:max-h-64 w-auto object-contain"
/>

        {/* Tombol Navigasi */}
        <div className="flex justify-between w-full mt-4 space-x-4">
          <button
            onClick={prevImage}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex-1"
          >
            Prev
          </button>
          <button
            onClick={nextImage}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex-1"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
)}



          <td className="border px-4 py-2">{employee.employees_nip || "Tidak ada data"}</td>
          <td className="border px-4 py-2">{employee.employees_name || "Tidak ada data"}</td>
          <td className="border px-4 py-2">{employee.employees_email || "Tidak ada data"}</td>
          <td className="border px-4 py-2">{positionName}</td>
          <td className="border px-4 py-2">{shiftName}</td>
          <td className="border px-4 py-2">{penempatanName}</td>
          <td className="border px-4 py-2 flex justify-center space-x-2">
            <button
              onClick={() => navigate(`/master-data/karyawan/edit/${employee.id}`)}
              className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(employee.id)}
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
      
        {/* Tombol Navigasi Pagination */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center mt-4 space-y-2 sm:space-y-0">
          <button
            disabled={currentPage === 1 || totalPages === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-gray-600 text-center sm:text-left">
            Halaman {filteredEmployees.length > 0 ? currentPage : 0} dari {totalPages}
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

      <Transition appear show={isInfoModalOpen} as={Fragment}>
        <Dialog onClose={() => setIsInfoModalOpen(false)} className="relative z-10">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
              <Dialog.Title className="text-lg font-bold mb-4">Informasi</Dialog.Title>
              <p className="mb-4">
                <strong>Cara Penggunaan:</strong> Gunakan kolom pencarian untuk mencari karyawan berdasarkan NIP, nama, email, jabatan, shift, atau penempatan.
              </p>
              <p>
                <strong>Jumlah Data:</strong> Gunakan input angka untuk menentukan berapa banyak data yang ingin ditampilkan di setiap halaman.
              </p>
              <p>
              <strong>Notifikasi Error Import Data:</strong> Notifikasi error ada dikarenakan kesalahan input dari Pengguna, 
              Pengguna bisa ke halaman <a href="/master-data/karyawan/error-import" className="text-blue-600 hover:underline">Notifikasi Error</a>.
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

      <Transition appear show={isImportModalOpen} as={Fragment}>
  <Dialog onClose={() => setIsImportModalOpen(false)} className="relative z-10">
    <div className="fixed inset-0 bg-black bg-opacity-30" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <Dialog.Title className="text-lg font-bold mb-4">Import Data</Dialog.Title>
        <p className="mb-4">
          <strong>Cara Penggunaan:</strong> Gunakan fitur ini untuk mengunggah data karyawan melalui file Excel.
        </p>

        {/* Input untuk Upload File */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-bold">Upload File Excel</label>
          <input
            type="file"
            accept=".xlsx, .xls"
            className="block w-full text-gray-700 border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleFileChange}
          />
        </div>

        {/* Tautan untuk Mengunduh Contoh Sampel */}
        <div className="mb-4">
          <a
            href="/assets/employees_sample.xlsx"
            download="employees_sample.xlsx"
            className="text-blue-600 hover:underline"
          >
            Download contoh file sampel
          </a>
        </div>

        {/* Tombol untuk Mengunggah */}
       <div className="flex justify-end space-x-4">
  <button
    onClick={() => setIsImportModalOpen(false)}
    className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
    disabled={isImportLoading} // Disable tombol batal saat loading
  >
    Batal
  </button>
  <button
    onClick={handleImportSubmit}
    className={`bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 ${
      isImportLoading ? "opacity-50 cursor-not-allowed" : ""
    }`}
    disabled={isImportLoading} // Disable tombol saat loading
  >
    {isImportLoading ? "Loading..." : "Import"} {/* Tampilkan teks loading */}
  </button>
</div>

      </Dialog.Panel>
    </div>
  </Dialog>
</Transition>

    </div>
  );
};

export default EmployeesPage;
