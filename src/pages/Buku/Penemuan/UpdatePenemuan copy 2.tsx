import React, { useState, useEffect, Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";

import axios from "axios";
import Swal from "sweetalert2";

const API_ITEM_DISCOVERY = "https://sipandu.sinarjernihsuksesindo.biz.id/api/item_discovery/";
const API_EMPLOYEES = "https://sipandu.sinarjernihsuksesindo.biz.id/api/employees/";
const API_SHIFTS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts/";
const API_POSITIONS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/positions/";

const UpdateItem = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get item ID from URL params
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
    id: "",
    position_id: "",
    shift_id: "",
    status: "1", // Default status
    item_discovery_date_end: "",
    id_user_end: "",
    information_end: "",
    item_discovery_photo_end: null,
    inventors_name_end: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [positions, setPositions] = useState([]);

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
                              const fileName = `Update_PenemuanBarang_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`; // Nama file final
                              const file = new File([blob], fileName, { type: "image/jpeg" });
                
                              setFormFields((prev) => ({ ...prev, item_discovery_photo: file }));
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
                              const fileName = `Update_PenemuanBarang_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`;
                              const file = new File([blob], fileName, { type: "image/jpeg" });
                
                              setFormFields((prev) => ({ ...prev, item_discovery_photo: file }));
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
                          const fileName = `Update_PenemuanBarang_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`;
                          const file = new File([blob], fileName, { type: "image/jpeg" });
                
                          setFormFields((prev) => ({ ...prev, item_discovery_photo: file }));
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
                  setFormFields((prev) => ({ ...prev, item_discovery_photo: file }));
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

      // Jika ada petugas yang sudah dipilih (default), tampilkan data terkait
      if (employeesData.data.length > 0) {
        const defaultEmployee = employeesData.data[0]; // Petugas pertama sebagai default
        updatePositionAndShift(defaultEmployee.id, employeesData.data, positionsData.data, shiftsData.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Gagal memuat data. Silakan coba lagi.");
    }
  };

  fetchData();
}, []);

 // Fungsi untuk memperbarui jabatan dan shift berdasarkan ID petugas
 const updatePositionAndShift = (employeeId, employeeList, positionList, shiftList) => {
  const selectedEmployee = employeeList.find((employee) => employee.id === Number(employeeId));

  if (selectedEmployee) {
    const { position_id, shift_id } = selectedEmployee;

    // Temukan nama jabatan dan shift dari data
    const selectedPosition = positionList.find((position) => position.position_id === position_id);
    const selectedShift = shiftList.find((shift) => shift.shift_id === shift_id);

    setFormFields({
      id: employeeId,
      position_name: selectedPosition ? selectedPosition.position_name : "",
      shift_name: selectedShift ? selectedShift.shift_name : "",
    });
  }
};

// Handler untuk perubahan input petugas
const handleInputChange = (e) => {
  const { name, value } = e.target;

  if (name === "id") {
    // Perbarui jabatan dan shift ketika petugas berubah
    updatePositionAndShift(value, employees, positions, shifts);
  }
};

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const { name } = e.target;
      setFormFields((prev) => ({ ...prev, [name]: e.target.files[0] }));
    }
  };

  const handleSave = async () => {
    const requiredFields = [
      "item_discovery_date",
      "o_clock_item_discovery",
      "inventors_name",
      "id", // Nama Petugas harus dipilih
      "position_id", // Jabatan harus dipilih
      "shift_id", // Shift harus dipilih
    ];

    const emptyFields = requiredFields.filter((field) => !formFields[field]);

    if (emptyFields.length > 0) {
      Swal.fire("Error!", "Harap lengkapi semua kolom wajib!", "error");
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    Object.entries(formFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      await axios.put(`${API_ITEM_DISCOVERY}${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      Swal.fire("Berhasil!", "Data berhasil diperbarui!", "success");
      navigate("/buku/penemuan");
    } catch (error) {
      Swal.fire("Error!", `Gagal memperbarui data: ${error.response?.data?.error || error.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Form Update</h1>
      <form className="space-y-4">
         {/* Field Input */}
         <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Tanggal</label>
          <input
            type="date"
            name="item_discovery_date"
            value={formFields.item_discovery_date}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Jam</label>
          <input
            type="time"
            name="o_clock_item_discovery"
            value={formFields.o_clock_item_discovery}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Nama Penemu Barang</label>
          <input
            type="text"
            name="inventors_name"
            value={formFields.inventors_name}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">TTL</label>
          <input
            type="text"
            name="ttl"
            value={formFields.ttl}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Contoh: Bogor, 17-01-1999"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Alamat</label>
          <textarea
            name="address"
            value={formFields.address}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          ></textarea>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">No. Telepon</label>
          <input
            type="text"
            name="telephone_number"
            value={formFields.telephone_number}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">No. KTP</label>
          <input
            type="text"
            name="id_card_number"
            value={formFields.id_card_number}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Lokasi Ditemukan</label>
          <textarea
            name="location_found"
            value={formFields.location_found}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          ></textarea>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Nama Barang</label>
          <input
            type="text"
            name="name_goods"
            value={formFields.name_goods}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Jumlah</label>
          <input
            type="text"
            name="amount"
            value={formFields.amount}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Keterangan</label>
          <textarea
            name="information"
            value={formFields.information}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          ></textarea>
        </div>

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
        {/* Conditional Form */}
        {formFields.status === "2" && (
          <>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Tanggal Disampaikan</label>
              <input
                type="date"
                name="item_discovery_date_end"
                value={formFields.item_discovery_date_end}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Nama Penerima Paket</label>
              <input
                type="text"
                name="inventors_name_end"
                value={formFields.inventors_name_end}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Nama Satpam Yang Menyampaikan</label>
          <select
            name="id_user_end"
            value={formFields.id_user_end}
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

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Keterangan Yang Disampaikan</label>
              <textarea
                name="information_end"
                value={formFields.information_end}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              ></textarea>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Foto Yang Disampaikan</label>
              <input
                type="file"
                name="item_discovery_photo_end"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </>
        )}

        {/* Submit */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleSave}
            className={`bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isSaving}
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => navigate("/buku/penemuan")}
            className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700"
          >
            Kembali
          </button>
        </div>
      </form>
    </div>

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

    </>
  );
};

export default UpdateItem;
