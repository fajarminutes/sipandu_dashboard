import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
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

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isDragAndDropVisible, setIsDragAndDropVisible] = useState(false);
  const [isUploadDisabled, setIsUploadDisabled] = useState(false);
  const [isCaptureDisabled, setIsCaptureDisabled] = useState(false);

  const handlePhotoSelect = (file: File) => {
    setFormFields((prev) => ({ ...prev, photo: file }));
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    setIsDragAndDropVisible(false);
  };

  const handleOpenUpload = () => {
    setIsDragAndDropVisible(true);
    setIsUploadDisabled(true); // Disable tombol upload
    setIsCaptureDisabled(false); // Enable tombol ambil gambar
    setIsPhotoModalOpen(false); // Tutup pop-up "Pilih Foto"
  };

  const handleCapturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement("canvas");

      const captureImage = () => {
        const context = canvas.getContext("2d");
        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "captured_image.jpg", { type: "image/jpeg" });
              handlePhotoSelect(file);
            }

            // Stop video stream
            video.pause();
            stream.getTracks().forEach((track) => track.stop());
            setIsCaptureDisabled(true); // Disable tombol ambil gambar
            setIsUploadDisabled(false); // Enable tombol upload foto
            setIsPhotoModalOpen(false); // Tutup pop-up "Pilih Foto"
          });
        }
      };

      // Pop-up kamera dengan modal sederhana
      setIsPhotoModalOpen(false); // Tutup modal "Pilih Foto"
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.backgroundColor = "black";
      container.style.zIndex = "1000";
      container.style.display = "flex";
      container.style.justifyContent = "center";
      container.style.alignItems = "center";

      const captureButton = document.createElement("button");
      captureButton.innerText = "Ambil Gambar Sekarang";
      captureButton.style.position = "absolute";
      captureButton.style.bottom = "20px";
      captureButton.style.backgroundColor = "white";
      captureButton.style.padding = "10px 20px";
      captureButton.style.borderRadius = "8px";
      captureButton.style.border = "none";
      captureButton.style.cursor = "pointer";

      captureButton.onclick = () => {
        captureImage();
        document.body.removeChild(container);
      };

      container.appendChild(video);
      container.appendChild(captureButton);
      document.body.appendChild(container);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
    }
  };

  const togglePhotoModal = () => {
    setIsPhotoModalOpen(!isPhotoModalOpen);
    setIsDragAndDropVisible(false); // Tutup drag-and-drop jika ada.
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
          
          <button
            type="button"
            onClick={togglePhotoModal}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
          >
            Pilih Foto
          </button>
          {isDragAndDropVisible && (
            <div
              className="border-dashed border-2 border-gray-400 p-4 rounded-lg text-center mt-4"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <p>Drag and drop file atau klik untuk mengunggah</p>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handlePhotoSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          )}
          {photoPreview && <img src={photoPreview} alt="Preview" className="mt-4 w-32 h-32 object-cover rounded-md" />}
        </div>
      </form>

      <Transition appear show={isPhotoModalOpen} as={Fragment}>
        <Dialog onClose={() => setIsPhotoModalOpen(false)} className="relative z-10">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
              <Dialog.Title className="text-lg font-bold mb-4">Pilih Foto</Dialog.Title>
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className={`bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 ${
                    isCaptureDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isCaptureDisabled}
                >
                  Ambil Gambar
                </button>
                <button
                  type="button"
                  onClick={handleOpenUpload}
                  className={`bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 ${
                    isUploadDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isUploadDisabled}
                >
                  Upload Foto
                </button>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                >
                  Tutup
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CreateEmployee;
