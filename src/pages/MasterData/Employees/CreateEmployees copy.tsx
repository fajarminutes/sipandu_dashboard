import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API_EMPLOYEES = "https://sipandu.sinarjernihsuksesindo.biz.id/api/employees/";
const API_SHIFTS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts/";
const API_POSITIONS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/positions/";
const API_CUSTOMERS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/customers/";

const CreateEmployee: React.FC = () => {
  const navigate = useNavigate();
  const [formFields, setFormFields] = useState({
    employees_nip: "",
    employees_name: "",
    employees_email: "",
    password: "",
    position_id: "",
    shift_id: "",
    id_area_patroli: "",
    photo: null as File | null,
  });

  const [positions, setPositions] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [penempatan, setPenempatan] = useState([]);

  useEffect(() => {
    fetchPositions();
    fetchShifts();
    fetchPenempatan();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await axios.get(API_POSITIONS);
      setPositions(response.data);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const fetchShifts = async () => {
    try {
      const response = await axios.get(API_SHIFTS);
      setShifts(response.data);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  const fetchPenempatan = async () => {
    try {
      const response = await axios.get(API_CUSTOMERS);
      setPenempatan(response.data);
    } catch (error) {
      console.error("Error fetching penempatan:", error);
    }
  };

  const validateForm = () => {
    const { employees_nip, employees_name, employees_email, position_id, shift_id, id_area_patroli } = formFields;
    if (!employees_nip || !employees_name || !employees_email || !position_id || !shift_id || !id_area_patroli) {
      Swal.fire("Error!", "Semua kolom harus diisi!", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("employees_nip", formFields.employees_nip);
    formData.append("employees_name", formFields.employees_name);
    formData.append("employees_email", formFields.employees_email);
    if (formFields.password) formData.append("password", formFields.password);
    formData.append("position_id", formFields.position_id);
    formData.append("shift_id", formFields.shift_id);
    formData.append("id_area_patroli", formFields.id_area_patroli);
    if (formFields.photo) formData.append("photo", formFields.photo);

    try {
      await axios.post(API_EMPLOYEES, formData);
      Swal.fire("Berhasil!", "Data karyawan berhasil disimpan!", "success");
      navigate("/master-data/employees");
    } catch (error) {
      console.error("Error saving employee:", error);
      Swal.fire("Error!", "Gagal menyimpan data karyawan.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Tambah Karyawan</h1>
      <form className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">NIP</label>
          <input
            type="text"
            value={formFields.employees_nip}
            onChange={(e) => setFormFields({ ...formFields, employees_nip: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Masukkan NIP"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Nama</label>
          <input
            type="text"
            value={formFields.employees_name}
            onChange={(e) => setFormFields({ ...formFields, employees_name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Masukkan nama"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formFields.employees_email}
            onChange={(e) => setFormFields({ ...formFields, employees_email: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Masukkan email"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={formFields.password}
            onChange={(e) => setFormFields({ ...formFields, password: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Masukkan password"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Jabatan</label>
          <select
            value={formFields.position_id}
            onChange={(e) => setFormFields({ ...formFields, position_id: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Pilih Jabatan</option>
            {positions.map((position) => (
              <option key={position.position_id} value={position.position_id}>
                {position.position_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Shift</label>
          <select
            value={formFields.shift_id}
            onChange={(e) => setFormFields({ ...formFields, shift_id: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Pilih Shift</option>
            {shifts.map((shift) => (
              <option key={shift.shift_id} value={shift.shift_id}>
                {shift.shift_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Penempatan</label>
          <select
            value={formFields.id_area_patroli}
            onChange={(e) => setFormFields({ ...formFields, id_area_patroli: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Pilih Penempatan</option>
            {penempatan.map((area) => (
              <option key={area.customer_id} value={area.customer_id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Foto</label>
          <input
            type="file"
            onChange={(e) => setFormFields({ ...formFields, photo: e.target.files ? e.target.files[0] : null })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
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
            onClick={() => navigate("/master-data/employees")}
            className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700"
          >
            Kembali
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEmployee;
