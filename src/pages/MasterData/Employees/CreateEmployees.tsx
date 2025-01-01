import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import axios from "axios";
import Swal from "sweetalert2";
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

  const [isSaving, setIsSaving] = useState(false); // Tambahkan state untuk tombol

  const [latitude, setLatitude] = useState(null);
const [longitude, setLongitude] = useState(null);
const [dateTime, setDateTime] = useState(null);


  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isDragAndDropVisible, setIsDragAndDropVisible] = useState(false);
  const [isUploadDisabled, setIsUploadDisabled] = useState(false);
  const [isCaptureDisabled, setIsCaptureDisabled] = useState(false);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("user");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSwitchCameraAvailable, setIsSwitchCameraAvailable] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [positions, setPositions] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [penempatan, setPenempatan] = useState([]);
  
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
    fetchPositions();
    fetchShifts();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await axios.get(API_POSITIONS);
      const formattedPositions = response.data.map((position) => ({
        value: position.position_id,
        label: position.position_name,
      }));
      setPositions(formattedPositions);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data posisi.", "error");
    }
  };
  
  const fetchShifts = async () => {
    try {
      const response = await axios.get(API_SHIFTS);
      const formattedShifts = response.data.map((shift) => ({
        value: shift.shift_id,
        label: shift.shift_name,
      }));
      setShifts(formattedShifts);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data shift.", "error");
    }
  };
  
  const fetchPenempatan = async () => {
    try {
      let apiUrl = API_CUSTOMERS;
      if (userData && userData.level != "2") {
        apiUrl = `${API_CUSTOMERS}${userData.level}`;
      }
  
  
      const response = await axios.get(apiUrl);
    
  
      let formattedPenempatan;
  
      // Tangani jika response.data adalah array atau objek tunggal
      if (Array.isArray(response.data)) {
        // Jika respons adalah array
        formattedPenempatan = response.data.map((area) => ({
          value: area.customer_id,
          label: area.name,
        }));
      } else if (response.data && typeof response.data === "object") {
        // Jika respons adalah objek tunggal
        formattedPenempatan = [
          {
            value: response.data.customer_id,
            label: response.data.name,
          },
        ];
      } else {
        throw new Error("Data penempatan tidak valid.");
      }
  
      setPenempatan(formattedPenempatan);
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message); // Debug error
      Swal.fire("Error!", error.response?.data?.message || "Gagal memuat data penempatan.", "error");
    }
  };
  

  useEffect(() => {
    if (userData) {
      fetchPenempatan();
    }
  }, [userData]);
  


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
  
    setIsSaving(true); // Set tombol menjadi loading
  
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
      navigate("/master-data/karyawan");
    } catch (error) {
      let errorMessage = "Gagal menyimpan data karyawan.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error; // Pesan error dari backend
      } else if (error.message) {
        errorMessage = error.message; // Pesan error dari axios atau jaringan
      }
      Swal.fire("Error!", errorMessage, "error");
    } finally {
      setIsSaving(false); // Set tombol kembali normal setelah selesai
    }
  };

  useEffect(() => {
    if (isCameraOpen) {
      openCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraOpen, cameraFacingMode]);

  useEffect(() => {
    checkCameraAvailability();
    setIsMobile(window.innerWidth <= 768); // Deteksi perangkat (ponsel jika lebar layar <= 768px)
  }, []);

  const checkCameraAvailability = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === "videoinput");
    setIsSwitchCameraAvailable(videoDevices.length > 1); // True jika ada lebih dari satu kamera.
  };

  const openCamera = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacingMode },
      });
      setStream(newStream);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Sistem sedang mendeteksi kamera, harap coba lagi!");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
  };

  const handleCapturePhoto = () => {
    if (!stream) return;
  
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
  
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();
  
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
  
      // Ambil gambar dari video
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      // Ambil waktu saat ini
      const today = new Date();
      const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  
      // Tambahkan geolokasi (jika ada)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude.toFixed(4);
            const longitude = position.coords.longitude.toFixed(4);
  
            // Tambahkan metadata ke foto
            context.font = "20px Arial";
            context.fillStyle = "white";
            context.fillText(`Date: ${formattedDate}`, 10, canvas.height - 60);
            context.fillText(`Lat: ${latitude}, Long: ${longitude}`, 10, canvas.height - 30);
  
            // Convert ke Blob dan File
            canvas.toBlob((blob) => {
              if (blob) {
                const randomString = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 karakter random
                const fileName = `Create_Employees_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`; // Nama file final
                const file = new File([blob], fileName, { type: "image/jpeg" });
  
                setFormFields((prev) => ({ ...prev, photo: file }));
                setPhotoPreview(URL.createObjectURL(blob));
                setIsCaptureDisabled(true); // Disable tombol "Ambil Gambar" setelah gambar diambil
              }
            });
  
            stopCamera();
            setIsCameraOpen(false);
          },
          (error) => {
            console.error("Error fetching location:", error);
  
            // Tetap tambahkan metadata waktu tanpa geolokasi jika gagal
            context.font = "20px Arial";
            context.fillStyle = "white";
            context.fillText(`Date: ${formattedDate}`, 10, canvas.height - 30);
  
            canvas.toBlob((blob) => {
              if (blob) {
                const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
                const fileName = `Create_Employees_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`;
                const file = new File([blob], fileName, { type: "image/jpeg" });
  
                setFormFields((prev) => ({ ...prev, photo: file }));
                setPhotoPreview(URL.createObjectURL(blob));
                setIsCaptureDisabled(true);
              }
            });
  
            stopCamera();
            setIsCameraOpen(false);
          }
        );
      } else {
        // Jika geolokasi tidak didukung
        context.font = "20px Arial";
        context.fillStyle = "white";
        context.fillText(`Date: ${formattedDate}`, 10, canvas.height - 30);
  
        canvas.toBlob((blob) => {
          if (blob) {
            const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
            const fileName = `Create_Employees_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`;
            const file = new File([blob], fileName, { type: "image/jpeg" });
  
            setFormFields((prev) => ({ ...prev, photo: file }));
            setPhotoPreview(URL.createObjectURL(blob));
            setIsCaptureDisabled(true);
          }
        });
  
        stopCamera();
        setIsCameraOpen(false);
      }
    };
  };
  


  const handleSwitchCamera = () => {
    setCameraFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    stopCamera();
    openCamera();
  };

  const togglePhotoModal = () => {
    setIsPhotoModalOpen(!isPhotoModalOpen);
    setIsDragAndDropVisible(false); // Tutup drag-and-drop jika ada.
  };

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


  const handleOpenCapture = () => {
    setIsCameraOpen(true);
    setIsCaptureDisabled(true);
    setIsUploadDisabled(false);
    setIsPhotoModalOpen(false);
  
    // Get current date and time
    const now = new Date();
    setDateTime(
      `${now.getDate()} ${now.toLocaleString("default", { month: "short" })} ${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    );
  
    // Get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };
  
  

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Tambah Pegawai </h1>
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
       {/* Jabatan */}
  <div>
    <label className="block text-lg font-medium text-gray-700 mb-2">Jabatan</label>
    <Select
      options={positions}
      value={positions.find((pos) => pos.value === formFields.position_id)}
      onChange={(selectedOption) =>
        setFormFields({ ...formFields, position_id: selectedOption?.value || "" })
      }
      placeholder="Pilih Jabatan"
      isClearable
    />
  </div>

  {/* Shift */}
  <div>
    <label className="block text-lg font-medium text-gray-700 mb-2">Shift</label>
    <Select
      options={shifts}
      value={shifts.find((shift) => shift.value === formFields.shift_id)}
      onChange={(selectedOption) =>
        setFormFields({ ...formFields, shift_id: selectedOption?.value || "" })
      }
      placeholder="Pilih Shift"
      isClearable
    />
  </div>

  {/* Penempatan */}
  <div>
    <label className="block text-lg font-medium text-gray-700 mb-2">Penempatan</label>
    <Select
      options={penempatan}
      value={penempatan.find((area) => area.value === formFields.id_area_patroli)}
      onChange={(selectedOption) =>
        setFormFields({ ...formFields, id_area_patroli: selectedOption?.value || "" })
      }
      placeholder="Pilih Penempatan"
      isClearable
    />
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
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handlePhotoSelect(e.dataTransfer.files[0]);
        }
      }}
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

        <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handleSave}
          className={`bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 ${
            isSaving ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSaving} // Tombol disable saat isSaving true
        >
          {isSaving ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/master-data/karyawan")}
          className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700"
        >
          Kembali
        </button>
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
            onClick={handleOpenCapture}
            className={`bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 ${
              isCaptureDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isCaptureDisabled} // Disable jika ambil gambar aktif
          >
            Ambil Gambar
          </button>

          <button
            type="button"
            onClick={handleOpenUpload}
            className={`bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 ${
              isUploadDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isUploadDisabled} // Disable jika upload foto aktif
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
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col items-center justify-center">
          <video
            className={`${
              isMobile ? "w-3/4" : "w-1/2"
            } bg-black rounded-md shadow-md`}
            ref={(ref) => {
              if (ref && stream) {
                ref.srcObject = stream;
                ref.play();
              }
            }}
          ></video>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={handleCapturePhoto}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Ambil Gambar Sekarang
            </button>
            
            {isSwitchCameraAvailable && isMobile && (
              <button
                onClick={handleSwitchCamera}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
              >
                Ganti Kamera
              </button>
            )}
            <button
              onClick={() => {
                stopCamera();
                setIsCameraOpen(false);
              }}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEmployee;
