import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Dialog, Transition } from "@headlessui/react";
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
const API_JOURNAL_BOOK = "https://sipandu.sinarjernihsuksesindo.biz.id/api/journal_book/";
const API_EMPLOYEES = "https://sipandu.sinarjernihsuksesindo.biz.id/api/employees/";
const API_SHIFTS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts/";

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

const JournalPage: React.FC = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTermJournal") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
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
    fetchJournals();
    fetchEmployees();
    fetchShifts();
  }, []);

  useEffect(() => {
    localStorage.setItem("searchTermJournal", searchTerm);
  }, [searchTerm]);

  const fetchJournals = async () => {
    setIsLoading(true);
    try {
        const response = await axios.get(API_JOURNAL_BOOK);
        
        // Tunggu 1 detik sebelum melanjutkan
        setTimeout(() => {
            if (userData && userData.level) {
                let filteredJournals = response.data;

                // Pastikan level dibandingkan dengan tipe data yang sama
                const userLevel = parseInt(userData.level, 10);

                // Jika level selain "2", filter berdasarkan customer_id
                if (userLevel !== 2) {
                    filteredJournals = filteredJournals.filter(
                        (journal) => journal.customer_id === userLevel
                    );
                }

                // Urutkan data berdasarkan ID dari besar ke kecil
                const sortedJournals = filteredJournals.sort(
                    (a, b) => b.id_journal - a.id_journal
                );

                setJournals(sortedJournals); // Set data setelah diurutkan
            } else {
                setJournals([]); // Kosongkan data jika tidak ada userData atau level
            }

            setIsLoading(false); // Akhiri loading setelah data di-set
        }, 1000); // Delay 1 detik
    } catch (error) {
        console.error("Error fetching journals:", error);
        Swal.fire("Error!", "Gagal memuat data jurnal.", "error");
        setIsLoading(false); // Akhiri loading meskipun terjadi error
    }
};

   useEffect(() => {
      if (userData) {
        fetchJournals();
      }
    }, [userData]);
    

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(API_EMPLOYEES);
      setTimeout(() => {
        setEmployees(response.data);
      }, 1000); // Tambahkan jeda 1 detik
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data karyawan.", "error");
    }
  };
  
  const fetchShifts = async () => {
    try {
      const response = await axios.get(API_SHIFTS);
      setTimeout(() => {
        setShifts(response.data);
      }, 1000); // Tambahkan jeda 1 detik
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data shift.", "error");
    }
  };
  

  const filteredJournals = journals.filter((journal) => {
    const shiftName = shifts.find((shift) => shift.shift_id === journal.shift_id)?.shift_name || "";
    const employeeName = employees.find((emp) => emp.id === journal.id)?.employees_name || "";
    return (
      shiftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.journal_date.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredJournals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJournals.length / itemsPerPage);

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
          await axios.delete(`${API_JOURNAL_BOOK}${id}`);
          setJournals((prevJournals) => prevJournals.filter((journal) => journal.id_journal !== id)); // Update state
          Swal.fire("Terhapus!", "Data Jurnal berhasil dihapus!", "success");
        } catch (error) {
          console.error("Error deleting journal:", error);
          Swal.fire("Error!", "Gagal menghapus data jurnal.", "error");
        }
      }
    });
  };
  

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Buku Jurnal</h1>
        <div className="flex space-x-4">
    <button
      onClick={() => navigate("/buku/jurnal/create")}
      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
    >
      Tambah Jurnal
    </button>
   
  </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan tanggal, shift regu, atau nama petugas..."
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
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">No</th>
                  <th className="border px-4 py-2">Tanggal</th>
                  <th className="border px-4 py-2">Shift Regu</th>
                  <th className="border px-4 py-2">Nama Petugas</th>
                  <th className="border px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((journal, index) => {
                  const shiftName =
                    shifts.find((shift) => shift.shift_id === journal.shift_id)?.shift_name || "Tidak ada data";
                  const employeeName =
                  employees.find((emp) => emp.id === journal.id)?.employees_name || "Tidak ada data";
                  const formattedDate = formatDate(journal.journal_date);

                  return (
                    <tr key={journal.id_journal}>
                      <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                      <td className="border px-4 py-2 text-center">{formattedDate}</td>
                      <td className="border px-4 py-2">{shiftName}</td>
                      <td className="border px-4 py-2">{employeeName}</td>
                      <td className="border px-4 py-2 flex justify-center space-x-2">
            <button
              onClick={() => navigate(`/buku/jurnal/edit/${journal.id_journal}`)}
              className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(journal.id_journal)}
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
          <div className="flex flex-col sm:flex-row sm:justify-between items-center mt-4 space-y-2 sm:space-y-0">
            <button
              disabled={currentPage === 1 || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-gray-600 text-center sm:text-left">
              Halaman {filteredJournals.length > 0 ? currentPage : 0} dari {totalPages}
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

export default JournalPage;
