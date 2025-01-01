import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API_VEHICLE_BOOK = "https://sipandu.sinarjernihsuksesindo.biz.id/api/vehicle_book/";
const API_EMPLOYEES = "https://sipandu.sinarjernihsuksesindo.biz.id/api/employees/";
const API_SHIFTS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts/";
const API_AREAS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/areas/";
const API_CUSTOMERS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/customers/";

const UpdateKendaraan: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get ID from URL
  const navigate = useNavigate();
  const [formFields, setFormFields] = useState({
    vehicle_book_date: "",
    id_area: "",
    shift_id: "",
    id: "",
    foto: null,
  });

  const [areas, setAreas] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAreas();
    fetchCustomers();
    fetchShifts();
    fetchEmployees();
    fetchVehicleBook(); // Fetch data to populate the form for editing
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await axios.get(API_AREAS);
      setAreas(response.data);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data area.", "error");
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(API_CUSTOMERS);
      setCustomers(response.data);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data pelanggan.", "error");
    }
  };

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
      setEmployees(response.data);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data karyawan.", "error");
    }
  };

  const fetchVehicleBook = async () => {
    try {
      const response = await axios.get(`${API_VEHICLE_BOOK}${id}`);
      const data = response.data;
      setFormFields({
        vehicle_book_date: data.vehicle_book_date,
        id_area: data.id_area.toString(),
        shift_id: data.shift_id.toString(),
        id: data.id.toString(),
        foto: null, // Foto tidak akan diisi ulang
      });

      // Filter employees based on the current area
      const selectedArea = areas.find((area) => area.id_area === data.id_area);
      if (selectedArea) {
        const relatedEmployees = employees.filter(
          (employee) => employee.customer_id === selectedArea.building_id
        );
        setFilteredEmployees(relatedEmployees);
      }
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data kendaraan.", "error");
    }
  };

  const handleAreaChange = (areaId: string) => {
    setFormFields((prev) => ({
      ...prev,
      id_area: areaId,
      id: "",
      shift_id: "",
    }));

    const selectedArea = areas.find((area) => area.id_area === Number(areaId));
    if (selectedArea) {
      const relatedEmployees = employees.filter(
        (employee) => employee.customer_id === selectedArea.building_id
      );
      setFilteredEmployees(relatedEmployees);
    } else {
      setFilteredEmployees([]);
    }
  };

  const handleEmployeeChange = (employeeId: string) => {
    setFormFields((prev) => ({
      ...prev,
      id: employeeId,
      shift_id: "",
    }));

    const selectedEmployee = employees.find((emp) => emp.id === Number(employeeId));
    if (selectedEmployee) {
      setFormFields((prev) => ({
        ...prev,
        shift_id: selectedEmployee.shift_id || "",
      }));
    }
  };

  const validateForm = () => {
    const { vehicle_book_date, id_area, id } = formFields;
    if (!vehicle_book_date || !id_area || !id) {
      Swal.fire("Error!", "Semua kolom wajib diisi!", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    Object.entries(formFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    setIsSaving(true);

    try {
      await axios.put(`${API_VEHICLE_BOOK}${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      Swal.fire("Berhasil!", "Data kendaraan berhasil diperbarui!", "success");
      navigate("/buku/kendaraan");
    } catch (error) {
      Swal.fire("Error!", "Gagal memperbarui data kendaraan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Form Edit Kendaraan</h1>
      <form className="space-y-6">
        {/* Area Penempatan */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Area Penempatan</label>
          <select
            value={formFields.id_area}
            onChange={(e) => handleAreaChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Pilih Area</option>
            {areas.map((area) => {
              const customer = customers.find((cust) => cust.customer_id === area.building_id);
              return (
                <option key={area.id_area} value={area.id_area}>
                  {area.area_name} {customer ? `- ${customer.name}` : ""}
                </option>
              );
            })}
          </select>
        </div>

        {/* Tanggal */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Tanggal</label>
          <input
            type="date"
            value={formFields.vehicle_book_date}
            onChange={(e) => setFormFields({ ...formFields, vehicle_book_date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Nama Petugas */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Nama Petugas</label>
          <select
            value={formFields.id}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Pilih Nama Petugas</option>
            {filteredEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.employees_name}
              </option>
            ))}
          </select>
        </div>

        {/* Shift Regu */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Shift Regu</label>
          <input
            type="text"
            value={
              shifts.find((shift) => shift.shift_id === Number(formFields.shift_id))?.shift_name ||
              ""
            }
            readOnly
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
            placeholder="Pilih Nama Petugas terlebih dahulu"
          />
        </div>

        {/* Foto */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormFields({ ...formFields, foto: e.target.files ? e.target.files[0] : null })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
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
            onClick={() => navigate("/buku/kendaraan")}
            className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700"
          >
            Kembali
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateKendaraan;
