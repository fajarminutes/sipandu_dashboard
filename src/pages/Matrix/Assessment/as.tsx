import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "https://sipandu.sinarjernihsuksesindo.biz.id/api";

interface StartTest {
  id_test: number;
  id_matrix: number;
  id_admin: number;
  id_employees: number;
  test_date: string;
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

const AssessmentDetailPage: React.FC = () => {
  const { id_test } = useParams<{ id_test: string }>();
  const navigate = useNavigate();

  const [startTest, setStartTest] = useState<StartTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null); // Tambahkan state ini
  const [admin, setAdmin] = useState<User | null>(null);

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
      setCustomer(customerData); // Pastikan setCustomer dipanggil dengan benar

      const { data: adminData } = await axios.get<User>(`${API_BASE_URL}/users/${startTestData.id_admin}`);
      setAdmin(adminData);

      const { data: questionsData } = await axios.get<Question[]>(`${API_BASE_URL}/questions?matrix_id=${startTestData.id_matrix}`);
      setQuestions(questionsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Mulai Ujian Assessment</h1>

      {startTest && employee && position && customer && admin ? (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Data Peserta</h2>
          <p>
            <strong>Tanggal/Waktu Mulai:</strong> {new Date(startTest.test_date).toLocaleString()}
          </p>
          <p>
            <strong>Penguji:</strong> {admin.fullname}
          </p>
          <p>
            <strong>Nama:</strong> {employee.employees_name}
          </p>
          <p>
            <strong>Level Peserta:</strong> {position.position_name}
          </p>
          <p>
            <strong>Perusahaan:</strong> {customer.name}
          </p>
        </div>
      ) : (
        <p>Memuat data...</p>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Pertanyaan Matrix</h2>
        {questions.length > 0 ? (
          <ul className="list-disc pl-6">
            {questions.map((question) => (
              <li key={question.question_id}>
                <p className="font-semibold">{question.question_text}</p>
                <p>
                  A. {question.answer_a} | B. {question.answer_b} {question.answer_c && `| C. ${question.answer_c}`}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Tidak ada pertanyaan untuk matrix ini.</p>
        )}
      </div>

      <button
        onClick={() => navigate("/")}
        className="bg-orange-500 text-white py-2 px-6 rounded-lg hover:bg-orange-600"
      >
        Akhiri Ujian
      </button>
    </div>
  );
};

export default AssessmentDetailPage;
