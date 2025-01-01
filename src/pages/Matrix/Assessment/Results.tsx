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
  updated_at: string;
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

interface Result {
  id_question: number;
  answer: string;
}

interface Matrix {
    matrix_id: number;
    matrix_name: string;
  }

const ResultsPage: React.FC = () => {
  const { id_test } = useParams<{ id_test: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"review" | "hasil">("review");
  const [startTest, setStartTest] = useState<StartTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);
  const [matrix, setMatrix] = useState<User | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, [id_test]);

  const fetchData = async () => {
    try {
      // Fetch data untuk start_test
      const { data: startTestData } = await axios.get<StartTest>(`${API_BASE_URL}/start_tests/${id_test}`);
      setStartTest(startTestData);
  
      // Fetch data untuk employee, position, customer, dan admin
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
  
      // Fetch data untuk questions
      const { data: questionsData } = await axios.get<Question[]>(
        `${API_BASE_URL}/questions?matrix_id=${startTestData.id_matrix}&position_id=${employeeData.position_id}`
      );
      setQuestions(questionsData);
  
      // Fetch data untuk results
      const { data: resultsData } = await axios.get<Result[]>(`${API_BASE_URL}/results_test/test/${id_test}`);
      setResults(resultsData);
  
      // Hitung skor
      calculateScore(questionsData, resultsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data!",
        text: "Silakan coba lagi.",
      });
    }
  };
  

  const calculateScore = (questions: Question[], results: Result[]) => {
    let correctAnswers = 0;
    questions.forEach((question) => {
      const userAnswer = results.find((result) => result.id_question === question.question_id)?.answer;
      if (userAnswer && userAnswer === question.answer) {
        correctAnswers += 1;
      }
    });
    const finalScore = (correctAnswers / questions.length) * 100;
    setScore(finalScore);
  };
  

  const renderReviewTab = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Data Peserta</h2>
      {startTest && employee && position && customer && admin ? (
        <div>
          <p><strong>Tanggal/Waktu Mulai:</strong> {startTest.created_at} </p>
          <p><strong>Tanggal/Waktu Selesai:</strong> {startTest.updated_at}</p>
          <p><strong>Penguji:</strong> {admin.fullname}</p>
          <p><strong>Nama:</strong> {employee.employees_name}</p>
          <p><strong>Level:</strong> {position.position_name}</p>
          <p><strong>Perusahaan:</strong> {customer.name}</p>
        </div>
      ) : (
        <p>Memuat data...</p>
      )}
      <h2 className="text-xl font-semibold mt-6 mb-4">Pertanyaan Matrix</h2>
      {questions.length > 0 ? (
        questions.map((question, index) => {
          const userAnswer = results.find((result) => result.id_question === question.question_id)?.answer;
          const isCorrect = userAnswer === question.answer;
          return (
            <div key={question.question_id} className="mb-6 p-4 bg-gray-100 rounded-lg shadow-sm">
              <p className="font-bold mb-2">{index + 1}. {question.question_text}</p>
              <p><strong>Skill:</strong>{matrix.matrix_name}</p>
              <p className={`mt-2 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                Poin: {isCorrect ? 1 : 0}
              </p>
              <p>A. {question.answer_a}</p>
              <p>B. {question.answer_b}</p>
              {question.answer_c && <p>C. {question.answer_c}</p>}
              <p>Jawaban Benar : {question.answer}</p>
              
            </div>
          );
        })
      ) : (
        <p>Tidak ada pertanyaan untuk matrix ini.</p>
      )}
    </div>
  );
  
  const renderHasilTab = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Hasil Ujian</h2>
        <p><strong>Nilai:</strong> {score}%</p>
        <div className="flex mt-4 space-x-4">
          <div
            className={`w-12 h-12 rounded ${
              score >= 0 ? "bg-red-500" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`w-12 h-12 rounded ${
              score > 25 ? "bg-orange-500" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`w-12 h-12 rounded ${
              score > 50 ? "bg-green-500" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`w-12 h-12 rounded ${
              score > 75 ? "bg-blue-500" : "bg-gray-300"
            }`}
          ></div>
        </div>
      </div>
    );
  };
  
  
  

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Review Data</h1>
      <div className="flex mb-6">
        <button
          className={`px-4 py-2 mr-2 ${activeTab === "review" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
          onClick={() => setActiveTab("review")}
        >
          Review
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "hasil" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
          onClick={() => setActiveTab("hasil")}
        >
          Hasil Ujian
        </button>
      </div>
      {activeTab === "review" ? renderReviewTab() : renderHasilTab()}
      <div className="mt-6">
        <button
          onClick={() => navigate("/matrix/assessment")}
          className="bg-gray-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700"
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
