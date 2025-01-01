import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
const navigate = useNavigate();
  const [errors, setErrors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const errorData = localStorage.getItem("import_errors");
    if (errorData) {
      const parsedData = JSON.parse(errorData);
      const currentTime = new Date().getTime();

      // Periksa apakah data masih valid (1 jam)
      if (currentTime - parsedData.timestamp < 60 * 60 * 1000) {
        setErrors(parsedData.errors);
      } else {
        // Hapus data jika sudah kadaluarsa
        localStorage.removeItem("import_errors");
      }
    }
  }, []);

  const filteredErrors = errors.filter(
    (error) =>
      error.NIP.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.Email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredErrors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredErrors.length / itemsPerPage);

  return (
    <div className="p-6">
     <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Notifikasi Error Import Data</h1>
        <button
      onClick={() => navigate("/master-data/karyawan")}
      className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
    >
      Kembali
    </button>
      </div>

      {/* Pencarian dan Konfigurasi Pagination */}
      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan NIP atau Email..."
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

      {/* Tabel Error */}
      {currentItems.length > 0 ? (
         <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-4">
         <div className="overflow-x-auto">
           <table className="table-auto w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Baris</th>
                <th className="border px-4 py-2">NIP</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Detail Error</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((error, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2 text-center">{error.row}</td>
                  <td className="border px-4 py-2">{error.NIP || "Tidak ada"}</td>
                  <td className="border px-4 py-2">{error.Email || "Tidak ada"}</td>
                  <td className="border px-4 py-2">
                    {error.errors.map((err, i) => (
                      <span key={i}>
                        {err}
                        <br />
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      ) : (
        <p className="text-gray-600">Tidak ada notifikasi error yang tersedia.</p>
      )}

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
          Halaman {currentItems.length > 0 ? currentPage : 0} dari {totalPages}
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
  );
};

export default ErrorPage;
