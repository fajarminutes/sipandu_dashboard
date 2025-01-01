import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import Swal from "sweetalert2";

interface UserData {
    user_id: string;
    unix_id: string;
    username: string;
    email: string;
    level: string;
  }

interface StartTest {
  id_test: number;
  test_date: string;
  id_employees: number;
  status_test: string;
}

interface Employee {
  id: number;
  employees_name: string;
  position_id: number;
  customer_id: number;
}

interface Position {
  position_id: number;
  position_name: string;
}

interface Customer {
  customer_id: number;
  name: string;
}

interface Matrix {
  matrix_id: number;
  matrix_name: string;
}

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

const API_BASE_URL = "https://sipandu.sinarjernihsuksesindo.biz.id/api";

const AssessmentPage: React.FC = () => {
    const navigate = useNavigate();
  const [startTests, setStartTests] = useState<StartTest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState<Partial<StartTest & { id_location: number; id_matrix: number }>>({});
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTerm") || "");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
     const [userData, setUserData] = useState<UserData | null>(null);
        
        useEffect(() => {
          const user = localStorage.getItem("user_data");
          if (user) {
            try {
              const parsedUser: UserData = JSON.parse(user);
              setUserData(parsedUser);
            } catch (error) {
              console.error("Gagal mem-parsing user_data:", error);
              localStorage.removeItem("user_data"); // Bersihkan jika data tidak valid
            }
          }
        }, []);
  useEffect(() => {
    fetchData();
  }, []);

   useEffect(() => {
      localStorage.setItem("searchTerm", searchTerm);
    }, [searchTerm]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
          const [startTestsRes, employeesRes, positionsRes, customersRes, matricesRes] = await Promise.all([
            axios.get<StartTest[]>(`${API_BASE_URL}/start_tests/`),
            axios.get<Employee[]>(`${API_BASE_URL}/employees/`),
            axios.get<Position[]>(`${API_BASE_URL}/positions/`),
            axios.get<Customer[]>(`${API_BASE_URL}/customers/`),
            axios.get<Matrix[]>(`${API_BASE_URL}/matrix/`)
          ]);
      
          setTimeout(() => {
            // Sort data startTests by id_test in descending order
            const sortedStartTests = startTestsRes.data.sort((a, b) => b.id_test - a.id_test);
      
            setStartTests(sortedStartTests);
            setEmployees(employeesRes.data);
            setPositions(positionsRes.data);
            setCustomers(customersRes.data);
            setMatrices(matricesRes.data);
            setIsLoading(false);
          }, 1000); // Tambahkan jeda 1 detik
        } catch (error) {
          console.error("Error fetching data:", error);
          setIsLoading(false);
        }
      };
      

  const getEmployeeName = (id: number) => {
    const employee = employees.find((e) => e.id === id);
    return employee ? employee.employees_name : "Tidak ditemukan";
  };

  const getPositionName = (id: number) => {
    const employee = employees.find((e) => e.id === id);
    if (!employee) return "Tidak ditemukan";
    const position = positions.find((p) => p.position_id === employee.position_id);
    return position ? position.position_name : "Tidak ditemukan";
  };

  const handleLocationChange = (locationId: number) => {
    setFormFields({ ...formFields, id_location: locationId });
  
    // Filter employees berdasarkan customer_id dan posisi yang mengandung "Chief"
    const filtered = employees.filter((emp) => {
      const position = positions.find((pos) => pos.position_id === emp.position_id);
      return emp.customer_id === locationId && position?.position_name.toLowerCase().includes("chief");
    });
  
    setFilteredEmployees(filtered);
  };
  

  const openModal = () => {
    setFormFields({ id_location: undefined, id_employees: undefined, id_matrix: undefined });
    setFilteredEmployees([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormFields({});
  };

  const handleSave = async () => {
    if (!formFields.id_location || !formFields.id_employees || !formFields.id_matrix) {
      Swal.fire("Error", "Semua field wajib diisi!", "error");
      return;
    }
  
    try {
      // Ambil tanggal sekarang untuk `test_date`
      const today = new Date();
      const testDate = today.toISOString().split("T")[0]; // Format menjadi "YYYY-MM-DD"
  
      // Buat payload dengan format sesuai database
      const payload = {
        ...formFields,
        test_date: testDate, // Format "YYYY-MM-DD"
        id_admin: userData?.unix_id, // Ambil dari userData
        status_test: "Berlangsung",
      };
  
      // Kirim data ke API
      const response = await axios.post(`${API_BASE_URL}/start_tests/`, payload);
  
      console.log("Response API:", response.data);
  
      // Ambil `id_test` dari respons API
      const { id_test } = response.data.test || response.data;
  
      // Pastikan `id_test` tidak undefined
      if (!id_test) {
        Swal.fire("Error", "Gagal mendapatkan ID ujian. Coba lagi.", "error");
        return;
      }
  
      Swal.fire("Sukses", "Selamat Ujian!.", "success");
      fetchData();
  
      // Navigasi ke halaman assessment dengan `id_test`
      navigate(`/matrix/assessment/create/${id_test}`);
    } catch (error) {
      console.error("Error saving data:", error);
  
      // Jika error dari API
      if (error.response && error.response.data) {
        Swal.fire("Error", error.response.data.error || "Gagal menyimpan data.", "error");
      } else {
        Swal.fire("Error", "Gagal menyimpan data. Periksa koneksi Anda.", "error");
      }
    }
  };
  
  
  
  

  const filteredTests = startTests.filter((test) => {
    const employeeName = employees.find((emp) => emp.id === test.id_employees)?.employees_name || "Tidak ditemukan";
    const positionName = positions.find(
      (pos) =>
        pos.position_id === employees.find((emp) => emp.id === test.id_employees)?.position_id
    )?.position_name || "Tidak ditemukan";
    const testDate = test.test_date ? new Date(test.test_date).toLocaleDateString() : "Tanggal tidak tersedia";
  
    return (
      employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      positionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testDate.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Hapus Assessment?',
      text: 'Data ini tidak dapat dikembalikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/start_tests/${id}`);
          await axios.delete(`${API_BASE_URL}/results_test/test/${id}`);
          fetchData();
          Swal.fire('Deleted!', 'Assessment berhasil dihapus.', 'success');
        } catch (error) {
          console.error('Error deleting Assessment:', error);
          Swal.fire('Error!', 'Gagal menghapus Assessment.', 'error');
        }
      }
    });
  };

  

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Assessment Page  </h1>
        <button
          onClick={openModal}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Tambah Data
        </button>
      </div>

      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Cari nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 mr-2 w-full"
        />
        <input
          type="number"
          min="1"
          max="50"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="border px-2 py-1 w-20"
        />
      </div>

      {isLoading ? (
        <div className="text-center">
        <div className="loader border-t-4 border-blue-600 border-solid rounded-full w-16 h-16 mx-auto animate-spin"></div>
        <p className="mt-4 text-gray-600">Memuat data...</p>
      </div>
      ) : (
        <>
          <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-4">
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">No</th>
              <th className="border px-4 py-2">Tanggal</th>
              <th className="border px-4 py-2">Nama</th>
              <th className="border px-4 py-2">Level</th>
              <th className="border px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((test, index) => {
                const formattedDate = formatDate(test.test_date);
                return (
                    <tr key={test.id_test}>
                <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                <td className="border px-4 py-2">{formattedDate}</td>
                <td className="border px-4 py-2">{getEmployeeName(test.id_employees)}</td>
                <td className="border px-4 py-2">{getPositionName(test.id_employees)}</td>
                <td className="border px-4 py-2 flex justify-center space-x-2">
                <button
  onClick={() => {
    if (test.status_test === "Berlangsung") {
        navigate(`/matrix/assessment/create/${test.id_test}`); // Navigate to the results page
    } else if (test.status_test === "Selesai") {
      navigate(`/matrix/assessment/results/${test.id_test}`); // Navigate to the results page
    }
  }}
  className={`py-1 px-4 rounded-lg mr-2 ${
    test.status_test === "Berlangsung"
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-green-600 hover:bg-green-700 text-white"
  }`}
>
  {test.status_test === "Berlangsung" ? "Mulai Ujian" : "Lihat"}
</button>

                  <button
                    onClick={() => handleDelete(test.id_test)}
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
        </div>
 <div className="flex justify-between items-center mt-4">
 <button
   disabled={currentPage === 1}
   onClick={() => setCurrentPage((prev) => prev - 1)}
   className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
 >
   Previous
 </button>
 <span>
   Halaman {currentPage} dari {totalPages}
 </span>
 <button
   disabled={currentPage >= totalPages}
   onClick={() => setCurrentPage((prev) => prev + 1)}
   className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
 >
   Next
 </button>
</div>
        </>

      )}


      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog onClose={closeModal} className="relative z-10">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
              <Dialog.Title className="text-lg font-bold mb-4">Mulai Ujian</Dialog.Title>

              {/* Penguji */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Penguji</label>
                <input
                  type="text"
                  value="Admin"
                  disabled
                  className="w-full border px-4 py-2 bg-gray-100 text-gray-600"
                />
              </div>

              {/* Pilih Lokasi */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Lokasi</label>
                <select
                  className="w-full border px-4 py-2"
                  onChange={(e) => handleLocationChange(Number(e.target.value))}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Pilih Lokasi
                  </option>
                  {customers.map((customer) => (
                    <option key={customer.customer_id} value={customer.customer_id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilih Peserta */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Peserta</label>
                <select
                  className="w-full border px-4 py-2"
                  value={formFields.id_employees || ""}
                  onChange={(e) => setFormFields({ ...formFields, id_employees: Number(e.target.value) })}
                >
                  <option value="" disabled>
                    Pilih Peserta
                  </option>
                  {filteredEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employees_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilih Matrix */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Matrix</label>
                <select
                  className="w-full border px-4 py-2"
                  value={formFields.id_matrix || ""}
                  onChange={(e) => setFormFields({ ...formFields, id_matrix: Number(e.target.value) })}
                >
                  <option value="" disabled>
                    Pilih Matrix
                  </option>
                  {matrices.map((matrix) => (
                    <option key={matrix.matrix_id} value={matrix.matrix_id}>
                      {matrix.matrix_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tombol Aksi */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Mulai Ujian
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AssessmentPage;
