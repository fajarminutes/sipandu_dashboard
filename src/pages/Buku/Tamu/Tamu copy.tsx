import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const API_GUEST_BOOK = "https://sipandu.sinarjernihsuksesindo.biz.id/api/guest_book/";
const API_EMPLOYEES = "https://sipandu.sinarjernihsuksesindo.biz.id/api/employees/";

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

const GuestBookPage = () => {
  const navigate = useNavigate();
  const [guestBooks, setGuestBooks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTermGuestBook") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      const employeesData = await fetchEmployees();
      const guestBooksData = await fetchGuestBooks();

      if (employeesData && guestBooksData) {
        // Pastikan guestBooks dan employees sudah ada, lalu gabungkan
        const mergedGuestBooks = guestBooksData.map((guestBook) => {
          const employee = employeesData.find((emp) => emp.id === guestBook.id);
          return {
            ...guestBook,
            employeeName: employee ? employee.employees_name : "Tidak ada data",
          };
        });
        setGuestBooks(mergedGuestBooks);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("searchTermGuestBook", searchTerm);
  }, [searchTerm]);

  const fetchGuestBooks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_GUEST_BOOK);
      const sortedGuestBooks = response.data.sort((a, b) => b.id_guest - a.id_guest);
      return sortedGuestBooks;
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data buku tamu.", "error");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(API_EMPLOYEES);
      return response.data;
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data karyawan.", "error");
      return [];
    }
  };

  const filteredGuestBooks = guestBooks.filter((guestBook) => {
    return (
      (guestBook.guest_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (guestBook.employeeName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (guestBook.guest_date?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGuestBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGuestBooks.length / itemsPerPage);

  const handleDelete = async (id_guest) => {
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
          await axios.delete(`${API_GUEST_BOOK}${id_guest}`);
          setGuestBooks((prev) => prev.filter((guestBook) => guestBook.id_guest !== id_guest));
          Swal.fire("Terhapus!", "Data buku tamu berhasil dihapus!", "success");
        } catch (error) {
          Swal.fire("Error!", "Gagal menghapus data buku tamu.", "error");
        }
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Buku Tamu</h1>
        <button
          onClick={() => navigate("/buku/tamu/create")}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Tambah Buku Tamu
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan nama tamu, pencatat, atau tanggal..."
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
                  <th className="border px-4 py-2">Nama Tamu</th>
                  <th className="border px-4 py-2">Pencatat</th>
                  <th className="border px-4 py-2">Datang</th>
                  <th className="border px-4 py-2">Keluar</th>
                  <th className="border px-4 py-2">Foto</th>
                  <th className="border px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((guestBook, index) => {
                  const formattedDate = formatDate(guestBook.guest_date);
                  return (
                    <tr key={guestBook.id_guest}>
                      <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                      <td className="border px-4 py-2 text-center">{formattedDate}</td>
                      <td className="border px-4 py-2">{guestBook.guest_name}</td>
                      <td className="border px-4 py-2">{guestBook.employeeName}</td>
                      <td className="border px-4 py-2">{guestBook.clock_in || "Tidak ada data"}</td>
                      <td className="border px-4 py-2">{guestBook.clock_out || "Tidak ada data"}</td>
                      <td className="border px-4 py-2">
                        {guestBook.guest_book_photo ? (
                          <img
                            src={`https://sipandu.sinarjernihsuksesindo.biz.id/${guestBook.guest_book_photo}`}
                            alt="Foto Buku Tamu"
                            className="w-16 h-16 object-cover"
                          />
                        ) : (
                          "Tidak ada data"
                        )}
                      </td>
                      <td className="border px-4 py-2 flex justify-center space-x-2">
                        <button
                          onClick={() => navigate(`/buku/tamu/edit/${guestBook.id_guest}`)}
                          className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(guestBook.id_guest)}
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
              Halaman {filteredGuestBooks.length > 0 ? currentPage : 0} dari {totalPages}
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

export default GuestBookPage;
