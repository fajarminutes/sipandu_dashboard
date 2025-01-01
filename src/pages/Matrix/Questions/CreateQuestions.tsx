import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const QUESTIONS_API = "https://sipandu.sinarjernihsuksesindo.biz.id/api/questions/";
const POSITIONS_API = "https://sipandu.sinarjernihsuksesindo.biz.id/api/positions/";
const MATRIX_API = "https://sipandu.sinarjernihsuksesindo.biz.id/api/matrix/";

const CreateQuestion: React.FC = () => {
  const navigate = useNavigate();
  const [formFields, setFormFields] = useState({
    question_text: "",
    position_id: "",
    matrix_id: "",
    answer_a: "",
    answer_b: "",
    answer_c: "",
    answer: "",
  });

  const [positions, setPositions] = useState([]);
  const [matrices, setMatrices] = useState([]);

  useEffect(() => {
    fetchPositions();
    fetchMatrices();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await axios.get(POSITIONS_API);
      setPositions(response.data);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const fetchMatrices = async () => {
    try {
      const response = await axios.get(MATRIX_API);
      setMatrices(response.data);
    } catch (error) {
      console.error("Error fetching matrices:", error);
    }
  };

  const validateForm = () => {
    const { question_text, position_id, matrix_id, answer_a, answer_b, answer } = formFields;
    if (!question_text || !position_id || !matrix_id || !answer_a || !answer_b || !answer) {
      Swal.fire("Error!", "Semua kolom harus diisi!", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

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

    try {
      await axios.post(QUESTIONS_API, questionData);
      Swal.fire("Berhasil!", "Data pertanyaan berhasil disimpan!", "success");
      navigate("/matrix/questions");
    } catch (error) {
      console.error("Error saving question:", error);
      Swal.fire("Error!", "Gagal menyimpan data pertanyaan.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Tambah Pertanyaan</h1>
      <form className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Pertanyaan</label>
          <textarea
            value={formFields.question_text}
            onChange={(e) => setFormFields({ ...formFields, question_text: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Masukkan pertanyaan"
            rows={5}
          ></textarea>
        </div>

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

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Opsi A</label>
          <textarea
            value={formFields.answer_a}
            onChange={(e) => setFormFields({ ...formFields, answer_a: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Masukkan opsi A"
            rows={3}
          ></textarea>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Opsi B</label>
          <textarea
            value={formFields.answer_b}
            onChange={(e) => setFormFields({ ...formFields, answer_b: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Masukkan opsi B"
            rows={3}
          ></textarea>
        </div>

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

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleSave}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => navigate("/matrix/questions")}
            className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700"
          >
            Kembali
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuestion;
