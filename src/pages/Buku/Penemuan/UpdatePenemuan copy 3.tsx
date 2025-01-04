import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_ITEM_DISCOVERY = "https://sipandu.sinarjernihsuksesindo.biz.id/api/item_discovery/";
const API_EMPLOYEES = "https://sipandu.sinarjernihsuksesindo.biz.id/api/employees/";
const API_SHIFTS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts/";
const API_POSITIONS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/positions/";

const UpdateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Ambil ID dari URL params
  const [formFields, setFormFields] = useState({
    item_discovery_date: "",
    o_clock_item_discovery: "",
    inventors_name: "",
    ttl: "",
    address: "",
    telephone_number: "",
    id_card_number: "",
    location_found: "",
    name_goods: "",
    amount: "",
    information: "",
    item_discovery_photo: null,
    id: "", // ID Petugas
    position_id: "",
    shift_id: "",
  });

  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [shifts, setShifts] = useState([]);

  // Load data dari API saat pertama kali render
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil semua data secara paralel
        const [employeesData, positionsData, shiftsData] = await Promise.all([
          axios.get(API_EMPLOYEES),
          axios.get(API_POSITIONS),
          axios.get(API_SHIFTS),
        ]);

        // Simpan data ke state
        setEmployees(employeesData.data);
        setPositions(positionsData.data);
        setShifts(shiftsData.data);

        // Ambil data item berdasarkan ID
        const itemResponse = await axios.get(`${API_ITEM_DISCOVERY}${id}`);
        const itemData = itemResponse.data;

        // Set form fields dengan data item
        setFormFields((prev) => ({
          ...prev,
          ...itemData, // Gabungkan data API ke formFields yang ada
        }));

        // Perbarui jabatan dan shift berdasarkan petugas yang dipilih
        updatePositionAndShift(itemData.id);
      } catch (error) {
        console.error("Error loading data:", error);
        alert("Gagal memuat data. Silakan coba lagi.");
      }
    };

    fetchData();
  }, [id]); // Tambahkan id sebagai dependency

  // Fungsi untuk memperbarui jabatan dan shift berdasarkan ID petugas
  const updatePositionAndShift = (employeeId) => {
    const selectedEmployee = employees.find((employee) => employee.id === Number(employeeId));

    if (selectedEmployee) {
      const { position_id, shift_id } = selectedEmployee;

      // Temukan nama jabatan dan shift dari data
      const selectedPosition = positions.find((position) => position.position_id === position_id);
      const selectedShift = shifts.find((shift) => shift.shift_id === shift_id);

      setFormFields((prev) => ({
        ...prev,
        position_id: position_id,
        shift_id: shift_id,
        position_name: selectedPosition ? selectedPosition.position_name : "",
        shift_name: selectedShift ? selectedShift.shift_name : "",
      }));
    }
  };

  // Handler untuk perubahan input petugas
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "id") {
      // Perbarui jabatan dan shift ketika petugas berubah
      updatePositionAndShift(value);
    }

    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-6">Update Data Petugas</h1>
      <form className="space-y-4">
        {/* Dropdown Petugas */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Nama Petugas</label>
          <select
            name="id"
            value={formFields.id}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Pilih Nama Petugas</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.employees_name}
              </option>
            ))}
          </select>
        </div>

        {/* Jabatan */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Jabatan</label>
          <input
            type="text"
            value={formFields.position_name || ""}
            readOnly
            placeholder="Pilih Petugas Terlebih Dahulu"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
          />
        </div>

        {/* Shift */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Shift</label>
          <input
            type="text"
            value={formFields.shift_name || ""}
            readOnly
            placeholder="Pilih Petugas Terlebih Dahulu"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
          />
        </div>
      </form>
    </div>
  );
};

export default UpdateForm;
