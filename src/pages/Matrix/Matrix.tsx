import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import Swal from "sweetalert2";

interface Matrix {
  matrix_id: number;
  matrix_name: string;
}

const MATRIX_API = "https://sipandu.sinarjernihsuksesindo.biz.id/api/matrix/";

const MatrixPage: React.FC = () => {
  const [matrixList, setMatrixList] = useState<Matrix[]>([]);
  const [searchTermMatrix, setSearchTermMatrix] = useState(() =>
    localStorage.getItem("searchTermMatrix") || ""
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({
    matrix_name: "",
  });
  const [editingMatrix, setEditingMatrix] = useState<Matrix | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMatrix();
  }, []);

  useEffect(() => {
    localStorage.setItem("searchTermMatrix", searchTermMatrix);
  }, [searchTermMatrix]);

  const fetchMatrix = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Matrix[]>(MATRIX_API);
      setTimeout(() => {
        setMatrixList(response.data);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Gagal mengambil data matrix:", error);
      setIsLoading(false);
    }
  };

  const openModal = (matrix: Matrix | null = null) => {
    setEditingMatrix(matrix);
    setFormFields({ matrix_name: matrix ? matrix.matrix_name : "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMatrix(null);
    setFormFields({ matrix_name: "" });
  };

  const validateForm = () => {
    const { matrix_name } = formFields;
    if (!matrix_name) {
      Swal.fire("Error!", "Nama matrix harus diisi!", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const matrixData = { matrix_name: formFields.matrix_name };
      if (editingMatrix) {
        await axios.put(`${MATRIX_API}${editingMatrix.matrix_id}`, matrixData);
      } else {
        await axios.post(MATRIX_API, matrixData);
      }
      fetchMatrix();
      closeModal();
      Swal.fire("Berhasil!", "Data matrix berhasil disimpan!", "success");
    } catch (error) {
      console.error("Gagal menyimpan matrix:", error);
      Swal.fire("Error!", "Gagal menyimpan data matrix.", "error");
    }
  };

  const handleDelete = async (id: number) => {
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
          await axios.delete(`${MATRIX_API}${id}`);
          fetchMatrix();
          Swal.fire("Terhapus!", "Data matrix berhasil dihapus!", "success");
        } catch (error) {
          console.error("Gagal menghapus matrix:", error);
          Swal.fire("Error!", "Gagal menghapus data matrix.", "error");
        }
      }
    });
  };

  const filteredMatrix = matrixList.filter((matrix) =>
    matrix.matrix_name.toLowerCase().includes(searchTermMatrix.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMatrix.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMatrix.length / itemsPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Matrix</h1>
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
          placeholder="Cari matrix..."
          value={searchTermMatrix}
          onChange={(e) => setSearchTermMatrix(e.target.value)}
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
        <div className="overflow-x-auto">
          <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">No</th>
                <th className="border px-4 py-2">Nama Matrix</th>
                <th className="border px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((matrix, index) => (
                <tr key={matrix.matrix_id}>
                  <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                  <td className="border px-4 py-2">{matrix.matrix_name}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => openModal(matrix)}
                      className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(matrix.matrix_id)}
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

      {/* Modal Informasi */}
      <Transition appear show={isInfoModalOpen} as={Fragment}>
        <Dialog onClose={() => setIsInfoModalOpen(false)} className="relative z-10">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
              <Dialog.Title className="text-lg font-bold mb-4">Informasi</Dialog.Title>
              <p className="mb-4">
                <strong>Cara Penggunaan:</strong> Gunakan kolom pencarian untuk mencari matrix berdasarkan nama.
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

      {/* Modal Tambah/Edit */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog onClose={closeModal} className="relative z-10">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
              <Dialog.Title className="text-lg font-bold mb-4">
                {editingMatrix ? "Edit Matrix" : "Tambah Matrix Baru"}
              </Dialog.Title>
              <input
                type="text"
                value={formFields.matrix_name}
                onChange={(e) =>
                  setFormFields({ ...formFields, matrix_name: e.target.value })
                }
                className="w-full border px-4 py-2 mb-4"
                placeholder="Nama Matrix"
              />
              <div className="mt-6 flex justify-between">
                <button
                  onClick={closeModal}
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 ml-2"
                >
                  Simpan
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default MatrixPage;
