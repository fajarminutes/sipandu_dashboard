import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";
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

const UpdateJournal: React.FC = () => {
  const navigate = useNavigate();
  const { id: id_journal } = useParams<{ id: string }>();
  const [formFields, setFormFields] = useState({
    journal_date: "",
    shift_id: "",
    employee_id: "",
    o_clock: "",
    incident_description: "",
    information: "",
  });

  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
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
    fetchShifts();
    fetchJournalData();
  }, []);
   useEffect(() => {
        if (userData) {
          fetchEmployees();
        }
      }, [userData]);
      

  const fetchShifts = async () => {
    try {
      const response = await axios.get(API_SHIFTS);
      setShifts(response.data);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data shift.", "error");
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(API_EMPLOYEES);
      let employeeOptions = response.data.map((employee) => ({
        value: employee.id,
        label: employee.employees_name,
        shift_id: employee.shift_id,
        customer_id: employee.customer_id, // Pastikan customer_id ada
      }));

      // Filter berdasarkan userData.level
      if (userData && userData.level) {
        const userLevel = parseInt(userData.level, 10);
        if (userLevel !== 2) {
          employeeOptions = employeeOptions.filter(
            (employee) => employee.customer_id === userLevel
          );
        }
      }

      setEmployees(employeeOptions);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data karyawan.", "error");
    }
  };

  const fetchJournalData = async () => {
    try {
      const response = await axios.get(`${API_JOURNAL_BOOK}${id_journal}`);
      const data = response.data;

      setFormFields({
        journal_date: data.journal_date || "",
        shift_id: data.shift_id || "",
        employee_id: data.id || "",
        o_clock: data.o_clock || "",
        incident_description: data.incident_description || "",
        information: data.information || "",
      });
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data jurnal.", "error");
    }
  };

  const handleEmployeeChange = (selectedOption) => {
    const employeeId = selectedOption?.value || "";
    setFormFields((prev) => ({
      ...prev,
      employee_id: employeeId,
    }));

    const selectedEmployee = employees.find((emp) => emp.value === employeeId);
    if (selectedEmployee) {
      const employeeShiftId = selectedEmployee.shift_id || "";
      setFormFields((prev) => ({
        ...prev,
        shift_id: employeeShiftId,
      }));
    } else {
      setFormFields((prev) => ({
        ...prev,
        shift_id: "",
      }));
    }
  };

  const validateForm = () => {
    const { journal_date, shift_id, employee_id, o_clock, incident_description } = formFields;
    if (!journal_date || !shift_id || !employee_id || !o_clock || !incident_description) {
      Swal.fire("Error!", "Semua kolom wajib diisi!", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      await axios.put(`${API_JOURNAL_BOOK}${id_journal}`, {
        ...formFields,
        id: formFields.employee_id, // Gunakan `employee_id` sebagai `id`
      });
      Swal.fire("Berhasil!", "Data jurnal berhasil diperbarui!", "success");
      navigate("/buku/jurnal");
    } catch (error) {
      Swal.fire("Error!", "Gagal memperbarui data jurnal.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Form Update Jurnal</h1>
      <form className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Tanggal</label>
          <input
            type="date"
            value={formFields.journal_date}
            onChange={(e) => setFormFields({ ...formFields, journal_date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Nama Petugas</label>
          <Select
            options={employees}
            value={employees.find((emp) => emp.value === formFields.employee_id)} // Set nilai default
            onChange={handleEmployeeChange}
            placeholder="Pilih Nama Petugas"
            isClearable
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Shift Regu</label>
          <input
            type="text"
            value={
              shifts.find((shift) => shift.shift_id === Number(formFields.shift_id))?.shift_name || ""
            }
            readOnly
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Jam</label>
          <input
            type="time"
            value={formFields.o_clock}
            onChange={(e) => setFormFields({ ...formFields, o_clock: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Uraian Kejadian</label>
          <textarea
            value={formFields.incident_description}
            onChange={(e) =>
              setFormFields({ ...formFields, incident_description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32"
          ></textarea>
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Keterangan</label>
          <textarea
            value={formFields.information}
            onChange={(e) => setFormFields({ ...formFields, information: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32"
          ></textarea>
        </div>
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleSave}
            className={`bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isSaving}
          >
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/buku/jurnal")}
            className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700"
          >
            Kembali
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateJournal;
