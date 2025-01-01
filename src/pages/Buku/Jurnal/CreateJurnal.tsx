import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";

const API_JOURNAL_BOOK = "https://sipandu.sinarjernihsuksesindo.biz.id/api/journal_book/";
const API_EMPLOYEES = "https://sipandu.sinarjernihsuksesindo.biz.id/api/employees/";
const API_SHIFTS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts/";

const CreateJournal: React.FC = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    fetchShifts();
    fetchEmployees();
  }, []);

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
      const employeeOptions = response.data.map((employee) => ({
        value: employee.id,
        label: employee.employees_name,
        shift_id: employee.shift_id,
      }));
      setEmployees(employeeOptions);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data karyawan.", "error");
    }
  };

  const handleEmployeeChange = (selectedOption) => {
    setFormFields((prev) => ({
      ...prev,
      employee_id: selectedOption?.value || "",
      shift_id: selectedOption?.shift_id || "",
    }));
  };

   

  const validateForm = () => {
    const { journal_date, shift_id, employee_id, o_clock, incident_description, information } = formFields;
    if (!journal_date || !shift_id || !employee_id || !o_clock || !incident_description || !information) {
      Swal.fire("Error!", "Semua kolom wajib diisi!", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      await axios.post(API_JOURNAL_BOOK, formFields);
      Swal.fire("Berhasil!", "Data jurnal berhasil disimpan!", "success");
      navigate("/buku/jurnal");
    } catch (error) {
      Swal.fire("Error!", "Gagal menyimpan data jurnal.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
   <>
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Form Tambah Jurnal</h1>
      <form className="space-y-6">
        {/* Tanggal */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Tanggal</label>
          <input
            type="date"
            value={formFields.journal_date}
            onChange={(e) => setFormFields({ ...formFields, journal_date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Nama Petugas */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Nama Petugas</label>
          <Select
            options={employees}
            onChange={handleEmployeeChange}
            placeholder="Pilih Nama Petugas"
            isClearable
          />
        </div>

        {/* Shift Regu */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Shift Regu</label>
          <input
            type="text"
            value={
              shifts.find((shift) => shift.shift_id === Number(formFields.shift_id))?.shift_name || ""
            }
            readOnly
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
            placeholder="Pilih Nama Petugas terlebih dahulu"
          />
        </div>

        {/* Jam */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Jam</label>
          <input
            type="time"
            value={formFields.o_clock}
            onChange={(e) => setFormFields({ ...formFields, o_clock: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Uraian Kejadian */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Uraian Kejadian</label>
          <textarea
            value={formFields.incident_description}
            onChange={(e) => setFormFields({ ...formFields, incident_description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32"
          ></textarea>
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Keterangan</label>
          <textarea
            value={formFields.information}
            onChange={(e) => setFormFields({ ...formFields, information: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32"
          ></textarea>
        </div>

        {/* Tombol Aksi */}
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
   </>
  );
};

export default CreateJournal;
