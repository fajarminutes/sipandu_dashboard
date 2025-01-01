import React, { useEffect, useState, Fragment } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Dialog, Transition } from "@headlessui/react"; // Pastikan diimpor

const QUESTIONS_API = "https://sipandu.sinarjernihsuksesindo.biz.id/api/questions/";
const POSITIONS_API = "https://sipandu.sinarjernihsuksesindo.biz.id/api/positions/";
const MATRIX_API = "https://sipandu.sinarjernihsuksesindo.biz.id/api/matrix/";

interface Question {
  question_id: number;
  question_text: string;
  position_id: number | null;
  matrix_id: number | null;
  answer_a: string;
  answer_b: string;
  answer_c: string | null;
  answer: string | null;
}

interface Position {
  position_id: number;
  position_name: string;
}

interface Matrix {
  matrix_id: number;
  matrix_name: string;
}

const QuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  useEffect(() => {
    fetchQuestions();
    fetchPositions();
    fetchMatrices();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Question[]>(QUESTIONS_API);
      setTimeout(() => {
        setQuestions(response.data);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setIsLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await axios.get<Position[]>(POSITIONS_API);
      setPositions(response.data);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const fetchMatrices = async () => {
    try {
      const response = await axios.get<Matrix[]>(MATRIX_API);
      setMatrices(response.data);
    } catch (error) {
      console.error("Error fetching matrices:", error);
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
          await axios.delete(`${QUESTIONS_API}${id}`);
          fetchQuestions();
          Swal.fire({
            title: "Terhapus!",
            text: "Data pertanyaan berhasil dihapus!",
            icon: "success",
            confirmButtonText: "OK",
          });
        } catch (error) {
          console.error("Error deleting question:", error);
          Swal.fire({
            title: "Error!",
            text: "Gagal menghapus data pertanyaan.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  const filteredQuestions = questions.filter((question) =>
    `${question.question_text}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = filteredQuestions.length === 0 ? 1 : Math.ceil(filteredQuestions.length / itemsPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Pertanyaan</h1>
        <button
          onClick={() => navigate("/matrix/questions/create")}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Tambah Baru
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari pertanyaan..."
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
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">No</th>
              <th className="border px-4 py-2">Pertanyaan</th>
              <th className="border px-4 py-2">Level</th>
              <th className="border px-4 py-2">Skill Matrix</th>
              <th className="border px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((question, index) => (
              <tr key={question.question_id}>
                <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                <td className="border px-4 py-2">{question.question_text}</td>
                <td className="border px-4 py-2 text-center">
                  {positions.find((p) => p.position_id === question.position_id)?.position_name || "-"}
                </td>
                <td className="border px-4 py-2 text-center">
                  {matrices.find((m) => m.matrix_id === question.matrix_id)?.matrix_name || "-"}
                </td>
                <td className="border px-4 py-2 flex justify-center space-x-2">
                  <button
                    onClick={() => navigate(`/matrix/questions/edit/${question.question_id}`)}
                    className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question.question_id)}
                    className="bg-red-600 text-white py-1 px-4 rounded-lg hover:bg-red-700"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-gray-600">
            Halaman {filteredQuestions.length > 0 ? currentPage : 0} dari {totalPages}
          </p>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
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
                <strong>Cara Penggunaan:</strong> Gunakan kolom pencarian untuk mencari pertanyaan berdasarkan teks.
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

export default QuestionsPage;
