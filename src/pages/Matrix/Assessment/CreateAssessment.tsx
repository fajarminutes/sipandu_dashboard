import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = "https://sipandu.sinarjernihsuksesindo.biz.id/api";

interface StartTest {
  id_test: number;
  id_matrix: number;
  id_admin: number;
  id_employees: number;
  created_at: string;
}

interface Question {
  question_id: number;
  question_text: string;
  answer_a: string;
  answer_b: string;
  answer_c: string | null;
  answer: string;
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

interface User {
  user_id: number;
  fullname: string;
}

interface Matrix {
  matrix_id: number;
  matrix_name: string;
}
const AssessmentDetailPage: React.FC = () => {
  const { id_test } = useParams<{ id_test: string }>();
  const navigate = useNavigate();

  const [startTest, setStartTest] = useState<StartTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);
    const [matrix, setMatrix] = useState<User | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id_test]);

  const fetchData = async () => {
    try {
        const { data: startTestData } = await axios.get<StartTest>(`${API_BASE_URL}/start_tests/${id_test}`);
        setStartTest(startTestData);

        const { data: employeeData } = await axios.get<Employee>(`${API_BASE_URL}/employees/${startTestData.id_employees}`);
        setEmployee(employeeData);

        const { data: positionData } = await axios.get<Position>(`${API_BASE_URL}/positions/${employeeData.position_id}`);
        setPosition(positionData);

        const { data: customerData } = await axios.get<Customer>(`${API_BASE_URL}/customers/${employeeData.customer_id}`);
        setCustomer(customerData);


        // Logika untuk mengambil data penguji (admin atau examiner)
    if (startTestData.id_admin) {
      // Jika id_admin tidak null, ambil data dari endpoint users
      const { data: adminData } = await axios.get<User>(`${API_BASE_URL}/users/${startTestData.id_admin}`);
      setAdmin(adminData);
    } else if (startTestData.id_examiner) {
      // Jika id_admin null, ambil data dari endpoint employees
      const { data: examinerData } = await axios.get<Employee>(`${API_BASE_URL}/employees/${startTestData.id_examiner}`);
      setAdmin({ user_id: examinerData.id, fullname: examinerData.employees_name }); // Konversi ke format User
    } else {
      // Jika keduanya null
      setAdmin(null);
    }
        
        const { data: Matrix } = await axios.get<Matrix>(`${API_BASE_URL}/matrix/${startTestData.id_matrix}`);
      setMatrix(Matrix);

        // Ambil pertanyaan berdasarkan `matrix_id` dan `position_id`
        const { data: questionsData } = await axios.get<Question[]>(
            `${API_BASE_URL}/questions?matrix_id=${startTestData.id_matrix}&position_id=${employeeData.position_id}`
        );
        setQuestions(questionsData);
    } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
            icon: "error",
            title: "Gagal memuat data!",
            text: "Silakan coba lagi.",
        });
    }
};


  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    try {
      const results = Object.keys(answers).map((questionId) => ({
        id_test: Number(id_test),
        id_question: Number(questionId),
        answer: answers[Number(questionId)],
      }));

      await axios.post(`${API_BASE_URL}/results_test/bulk`, results);
      await axios.put(`${API_BASE_URL}/start_tests/${id_test}`, {
        status_test: "Selesai",
        updated_at: new Date().toISOString(),
      });

      Swal.fire({
        icon: "success",
        title: "Hasil ujian berhasil disimpan!",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/matrix/assessment");
      });
    } catch (error) {
      console.error("Error submitting results:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan hasil ujian!",
        text: "Silakan coba lagi.",
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Mulai Ujian Assessment</h1>

      {startTest && employee && position && customer && admin ? (
        <div className="mb-8 border-b pb-4">
          <h2 className="text-xl font-semibold mb-2">Data Peserta</h2>
          <p><strong>Tanggal/Waktu Mulai:</strong> {startTest.created_at} </p>
          <p><strong>Penguji:</strong> {admin.fullname}</p>
          <p><strong>Nama:</strong> {employee.employees_name}</p>
          <p><strong>Level:</strong> {position.position_name}</p>
          <p><strong>Perusahaan:</strong> {customer.name}</p>
        </div>
      ) : (
        <p>Memuat data...</p>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Pertanyaan Matrix</h2>
        <p><strong>Skill:</strong> {matrix ? matrix.matrix_name : "Memuat data matrix..."}</p>

        <div className="flex items-center mb-4">
          <label className="mr-2 font-medium">Tampilkan Jawaban:</label>
          <input
            type="checkbox"
            checked={showAnswers}
            onChange={(e) => setShowAnswers(e.target.checked)}
          />
        </div>
        {questions.length > 0 ? (
          <div>
            {questions.map((question, index) => (
              <div key={question.question_id} className="mb-6 p-4 bg-gray-100 rounded-lg shadow-sm">
                <p className="font-bold mb-2">{index + 1}. {question.question_text}</p>
                <div className="space-y-2">
                  {["A", "B", "C"].map((option, idx) => {
                    const optionText = question[`answer_${option.toLowerCase()}` as keyof Question];
                    if (!optionText) return null;

                    return (
                      <label
                        key={idx}
                        className={`flex items-center space-x-2 ${
                          showAnswers && question.answer === option ? "bg-green-100 p-2 rounded-lg" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.question_id}`}
                          value={option}
                          onChange={() => handleAnswerChange(question.question_id, option)}
                          className="form-radio"
                        />
                        <span>{option}. {optionText}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Tidak ada pertanyaan untuk matrix ini.</p>
        )}
      </div>

      <div className="flex justify-between items-center mt-8">
  {/* Tombol Kembali */}
  <button
   onClick={() => navigate("/matrix/assessment")}
    className="bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700"
  >
    Kembali
  </button>

  {/* Tombol Simpan Jawaban */}
  <button
    onClick={handleSubmit}
    className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700"
  >
    Simpan Jawaban
  </button>
</div>

    </div>
  );
};

export default AssessmentDetailPage;
