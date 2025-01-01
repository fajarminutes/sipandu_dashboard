import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';

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
}

interface Position {
  position_id: number;
  position_name: string;
}

const API_BASE_URL = 'https://sipandu.sinarjernihsuksesindo.biz.id/api';

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
const AssessmentPage: React.FC = () => {
  const [startTests, setStartTests] = useState<StartTest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState<Partial<StartTest>>({});
  const [editingTest, setEditingTest] = useState<StartTest | null>(null);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTerm") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("searchTerm", searchTerm);
  }, [searchTerm]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [startTestsRes, employeesRes, positionsRes] = await Promise.all([
            axios.get<StartTest[]>(`${API_BASE_URL}/start_tests/`),
            axios.get<Employee[]>(`${API_BASE_URL}/employees/`),
            axios.get<Position[]>(`${API_BASE_URL}/positions/`),
        ]);

        setTimeout(() => {
            setStartTests(startTestsRes.data);
            setEmployees(employeesRes.data);
            setPositions(positionsRes.data);
            setIsLoading(false);
        }, 1000); // Jeda selama 1 detik
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

  const openModal = () => {
    setFormFields({ test_date: "", id_employees: undefined, id_matrix: undefined });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTest(null);
    setFormFields({});
  };

  const validateForm = () => {
    if (!formFields.test_date || !formFields.id_employees || !formFields.status_test) {
      Swal.fire("Error", "Semua field wajib diisi!", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingTest) {
        await axios.put(`${API_BASE_URL}/start_tests/${editingTest.id_test}`, formFields);
        Swal.fire("Sukses", "Data berhasil diperbarui.", "success");
      } else {
        await axios.post(`${API_BASE_URL}/start_tests/`, formFields);
        Swal.fire("Sukses", "Data berhasil ditambahkan.", "success");
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error("Error saving data:", error);
      Swal.fire("Error", "Gagal menyimpan data.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Hapus data?",
      text: "Data ini tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/start_tests/${id}`);
          Swal.fire("Sukses", "Data berhasil dihapus.", "success");
          fetchData();
        } catch (error) {
          console.error("Error deleting data:", error);
          Swal.fire("Error", "Gagal menghapus data.", "error");
        }
      }
    });
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Assessment Page</h1>
        <button
          onClick={() => openModal()}
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
                <td className="border px-4 py-2">
                  <button
                    onClick={() => openModal(test)}
                    className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700 mr-2"
                  >
                    Edit
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

     

       {/* Modal */}
    <Transition appear show={isModalOpen} as={Fragment}>
      <Dialog onClose={closeModal} className="relative z-10">
        <div className="fixed inset-0 bg-black bg-opacity-30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <Dialog.Title className="text-lg font-bold mb-4">Mulai Ujian</Dialog.Title>

            {/* Penguji (Static) */}
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
                onChange={(e) => setFormFields({ ...formFields, id_location: e.target.value })}
                defaultValue=""
              >
                <option value="" disabled>
                  Tentukan Lokasi
                </option>
                {/* Contoh data lokasi */}
                <option value="1">Lokasi A</option>
                <option value="2">Lokasi B</option>
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
                {employees.map((emp) => (
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
                {/* Contoh data matrix */}
                <option value="1">Matrix A</option>
                <option value="2">Matrix B</option>
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
