import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API_CHECKPOINTS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/checkpoints/";
const API_AREA_PATROLI = "https://sipandu.sinarjernihsuksesindo.biz.id/api/area-patroli/";
const API_CUSTOMERS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/customers/";

const UpdateCheckpoint = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formFields, setFormFields] = useState({
    urutan: "",
    checkpoints_name: "",
    todo_list: "",
    id_area_patroli: "",
    shift_id: "",
    customer_id: "",
    duration: "",
    photo: null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [shifts, setShifts] = useState([]);

  const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    const initializeData = async () => {
      await fetchAreas(); // Pastikan data area patroli selesai dimuat
      await fetchCheckpointData(); // Setelah area patroli, muat data checkpoint
      fetchCustomers();
      fetchShifts();
    };
  
    initializeData();
  }, []);
  
  const fetchCheckpointData = async () => {
    try {
      const response = await axios.get(`${API_CHECKPOINTS}${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = response.data;
  
      setFormFields({
        urutan: data.urutan,
        checkpoints_name: data.checkpoints_name,
        todo_list: data.todo_list,
        id_area_patroli: data.id_area_patroli,
        shift_id: data.shift_id,
        customer_id: data.customer_id,
        duration: data.duration,
        photo: null,
      });
  
      const filtered = areas.filter((area) => area.customer_id === parseInt(data.customer_id));
      setFilteredAreas(filtered);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data checkpoint.", "error");
    }
  };
  
  const fetchAreas = async () => {
    try {
      const response = await axios.get(API_AREA_PATROLI, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setAreas(response.data);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data area patroli.", "error");
    }
  };
  
  useEffect(() => {
    if (formFields.customer_id && areas.length > 0) {
      const filtered = areas.filter((area) => area.customer_id === parseInt(formFields.customer_id));
      setFilteredAreas(filtered);
    }
  }, [formFields.customer_id, areas]);
  
  
  

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(API_CUSTOMERS);
      setCustomers(response.data);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data lokasi.", "error");
    }
  };

  const fetchShifts = async () => {
    try {
      const response = await axios.get("https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts/");
      setShifts(response.data);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data shift.", "error");
    }
  };

  const handleCustomerChange = (customerId) => {
    setFormFields({ ...formFields, customer_id: customerId, id_area_patroli: "" });

    // Filter area patroli berdasarkan customer_id
    const filtered = areas.filter((area) => area.customer_id === parseInt(customerId));
    setFilteredAreas(filtered);
  };

  const validateForm = () => {
    const { urutan, checkpoints_name, todo_list, id_area_patroli, shift_id, duration } = formFields;
    if (!urutan || !checkpoints_name || !todo_list || !id_area_patroli || !shift_id || !duration) {
      Swal.fire("Error!", "Semua kolom harus diisi!", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    const formData = new FormData();
    Object.entries(formFields).forEach(([key, value]) => {
      if (key === "photo" && value) {
        formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    });

    try {
      await axios.put(`${API_CHECKPOINTS}${id}`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      Swal.fire("Berhasil!", "Data checkpoint berhasil diperbarui!", "success");
      navigate("/patroli/checkpoints");
    } catch (error) {
      Swal.fire("Error!", "Gagal memperbarui data checkpoint.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Perbarui Data Checkpoints</h1>
      <form className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Urutan</label>
          <input
            type="number"
            value={formFields.urutan}
            onChange={(e) => setFormFields({ ...formFields, urutan: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Masukkan urutan"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Nama</label>
          <input
            type="text"
            value={formFields.checkpoints_name}
            onChange={(e) => setFormFields({ ...formFields, checkpoints_name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Masukkan nama checkpoint"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Todo List</label>
          <textarea
            value={formFields.todo_list}
            onChange={(e) => setFormFields({ ...formFields, todo_list: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Masukkan todo list"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Lokasi</label>
          <select
            value={formFields.customer_id}
            onChange={(e) => handleCustomerChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Pilih Lokasi</option>
            {customers.map((customer) => (
              <option key={customer.customer_id} value={customer.customer_id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Area Patroli</label>
          <select
            value={formFields.id_area_patroli}
            onChange={(e) => setFormFields({ ...formFields, id_area_patroli: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Pilih Area Patroli</option>
            {filteredAreas.map((area) => (
              <option key={area.id_area_patroli} value={area.id_area_patroli}>
                {area.desc_area_patroli}
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
          <label className="block text-lg font-medium text-gray-700 mb-2">Durasi</label>
          <input
            type="number"
            value={formFields.duration}
            onChange={(e) => setFormFields({ ...formFields, duration: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Masukkan durasi (dalam menit)"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Foto</label>
          <input
            type="file"
            onChange={(e) => setFormFields({ ...formFields, photo: e.target.files[0] })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            accept="image/*"
          />
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
            onClick={() => navigate("/patroli/checkpoints")}
            className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700"
          >
            Kembali
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateCheckpoint;
