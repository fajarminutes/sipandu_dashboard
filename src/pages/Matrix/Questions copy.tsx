import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Quill CSS
import Swal from "sweetalert2";

interface Position {
  position_id: number;
  position_name: string;
}

interface Matrix {
  matrix_id: number;
  matrix_name: string;
}

interface Question {
  question_id: number;
  question_text: string;
  position_id: number | null;
  building_id: number | null;
  matrix_id: number | null;
  answer_a: string;
  answer_b: string;
  answer_c: string | null;
  answer: string | null;
}

const QUESTIONS_API = "https://sipandu.sinarjernihsuksesindo.biz.id/api/questions/";
const POSITIONS_API = "https://sipandu.sinarjernihsuksesindo.biz.id/api/positions/";
const MATRIX_API = "https://sipandu.sinarjernihsuksesindo.biz.id/api/matrix/";

const QuestionsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCreate = searchParams.has("create");
  const isEdit = searchParams.get("edit") || null;

  const [formFields, setFormFields] = useState({
    question_text: "",
    position_id: "",
    matrix_id: "",
    answer_a: "",
    answer_b: "",
    answer_c: "",
    answer: "",
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
    fetchPositions();
    fetchMatrices();

    if (isCreate) {
      resetFormFields();
    } else if (isEdit) {
      fetchQuestionData(isEdit);
    }
  }, [isCreate, isEdit]);

  const resetFormFields = () => {
    setFormFields({
      question_text: "",
      position_id: "",
      matrix_id: "",
      answer_a: "",
      answer_b: "",
      answer_c: "",
      answer: "",
    });
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Question[]>(QUESTIONS_API);
     setTimeout(() => {
        setQuestions(response.data);
        setIsLoading(false); // Sembunyikan loading setelah 2 detik
      }, 1000); // Simulasi delay 2 detik
    } catch (error) {
      console.error('Gagal mengambil data questions:', error);
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

  const fetchQuestionData = async (id: string) => {
    try {
      const response = await axios.get<Question>(`${QUESTIONS_API}${id}`);
      const data = response.data;
      setFormFields({
        question_text: data.question_text,
        position_id: data.position_id?.toString() || "",
        matrix_id: data.matrix_id?.toString() || "",
        answer_a: data.answer_a,
        answer_b: data.answer_b,
        answer_c: data.answer_c || "",
        answer: data.answer || "",
      });
    } catch (error) {
      console.error("Error fetching question data:", error);
    }
  };

  const validateForm = () => {
    const { question_text, position_id, matrix_id, answer_a, answer_b, answer } = formFields;
    if (!question_text || !position_id || !matrix_id || !answer_a || !answer_b || !answer) {
      Swal.fire({
        title: "Error!",
        text: "Semua kolom wajib diisi!",
        icon: "error",
        confirmButtonText: "OK",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const questionData = {
        question_text: formFields.question_text,
        position_id: parseInt(formFields.position_id),
        matrix_id: parseInt(formFields.matrix_id),
        answer_a: formFields.answer_a,
        answer_b: formFields.answer_b,
        answer_c: formFields.answer_c || null,
        answer: formFields.answer,
        building_id: null, // Static null as per requirement
      };

      if (isEdit) {
        await axios.put(`${QUESTIONS_API}${isEdit}`, questionData, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        await axios.post(QUESTIONS_API, questionData, {
          headers: { "Content-Type": "application/json" },
        });
      }

      Swal.fire({
        title: "Berhasil!",
        text: "Data pertanyaan berhasil disimpan!",
        icon: "success",
        confirmButtonText: "OK",
      });

      navigate("/matrix/questions");
      fetchQuestions();
    } catch (error) {
      console.error("Error saving question:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal menyimpan data pertanyaan.",
        icon: "error",
        confirmButtonText: "OK",
      });
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

  return (
    <div className="p-6">
      {isCreate || isEdit ? (
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          {isEdit ? "Edit Pertanyaan" : "Tambah Pertanyaan"}
        </h1>
        <form className="space-y-6">
          {/* Pertanyaan */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Pertanyaan</label>
            <textarea
              value={formFields.question_text}
              onChange={(e) =>
                setFormFields({ ...formFields, question_text: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Masukkan pertanyaan"
              rows={5}
            ></textarea>
          </div>
      
          {/* Level Pertanyaan */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Level Pertanyaan</label>
            <select
              value={formFields.position_id}
              onChange={(e) => setFormFields({ ...formFields, position_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Pilih</option>
              {positions.map((p) => (
                <option key={p.position_id} value={p.position_id}>
                  {p.position_name}
                </option>
              ))}
            </select>
          </div>
      
          {/* Skill Matrix */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Skill Matrix</label>
            <select
              value={formFields.matrix_id}
              onChange={(e) => setFormFields({ ...formFields, matrix_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Pilih</option>
              {matrices.map((m) => (
                <option key={m.matrix_id} value={m.matrix_id}>
                  {m.matrix_name}
                </option>
              ))}
            </select>
          </div>
      
          {/* Opsi A */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Opsi A</label>
            <textarea
              value={formFields.answer_a}
              onChange={(e) =>
                setFormFields({ ...formFields, answer_a: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Masukkan opsi A"
              rows={3}
            ></textarea>
          </div>
      
          {/* Opsi B */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Opsi B</label>
            <textarea
              value={formFields.answer_b}
              onChange={(e) =>
                setFormFields({ ...formFields, answer_b: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Masukkan opsi B"
              rows={3}
            ></textarea>
          </div>
      
          {/* Jawaban Benar */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Jawaban Benar</label>
            <select
              value={formFields.answer}
              onChange={(e) => setFormFields({ ...formFields, answer: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Pilih</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
      
          {/* Tombol Aksi */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg"
            >
              {isEdit ? "Perbarui" : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/matrix/questions")}
              className="bg-gray-600 text-white py-2 px-6 rounded-lg"
            >
              Kembali
            </button>
          </div>
        </form>
      </div>
      
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Daftar Pertanyaan</h1>
            <button
              onClick={() => navigate("?create")}
              className="bg-green-600 text-white py-2 px-6 rounded-lg"
            >
              Tambah Pertanyaan Baru
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
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">No</th>
                    <th className="border border-gray-300 px-4 py-2">Pertanyaan</th>
                    <th className="border border-gray-300 px-4 py-2">Level</th>
                    <th className="border border-gray-300 px-4 py-2">Skill Matrix</th>
                    <th className="border border-gray-300 px-4 py-2">Jawaban Benar</th>
                    <th className="border border-gray-300 px-4 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, index) => (
                    <tr key={q.question_id}>
                      <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">{q.question_text}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {positions.find((p) => p.position_id === q.position_id)?.position_name || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {matrices.find((m) => m.matrix_id === q.matrix_id)?.matrix_name || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {q.answer === 'A' && `A (${q.answer_a || '-'})`}
                        {q.answer === 'B' && `B (${q.answer_b || '-'})`}
                        {q.answer === 'C' && `C (${q.answer_c || '-'})`}
                        {!['A', 'B', 'C'].includes(q.answer) && q.answer}
                        </td>


                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => navigate(`?edit=${q.question_id}`)}
                            className="bg-blue-600 text-white font-bold py-1 px-4 rounded-lg"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(q.question_id)}
                            className="bg-red-600 text-white font-bold py-1 px-4 rounded-lg"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;
