import React, { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Dialog, Transition } from "@headlessui/react";
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

const API_ITEM_DISCOVERY = "https://sipandu.sinarjernihsuksesindo.biz.id/api/item_discovery/";
const API_EMPLOYEES = "https://sipandu.sinarjernihsuksesindo.biz.id/api/employees/";
const API_SHIFTS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts/";
const API_POSITIONS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/positions/";

const CreateItem = () => {
  const navigate = useNavigate();
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
  });
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
  
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

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
                          const fileName = `Create_PenemuanBarang_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`; // Nama file final
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
                          const fileName = `Create_PenemuanBarang_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`;
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
                      const fileName = `Create_PenemuanBarang_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`;
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

   useEffect(() => {
            if (userData) {
              fetchEmployees();
              fetchShifts();
              fetchPositions();
            }
          }, [userData]);

  const fetchEmployees = async () => {
    try {
        const response = await axios.get(API_EMPLOYEES);
        let employeesData = response.data;

        // Pastikan userData tersedia
        if (userData && userData.level) {
            const userLevel = parseInt(userData.level, 10);
            // Filter berdasarkan customer_id jika level bukan "2"
            if (userLevel !== 2) {
                employeesData = employeesData.filter(
                    (employee) => employee.customer_id === userLevel
                );
            }
        }

        setEmployees(employeesData); // Set data pegawai setelah difilter
    } catch (error) {
        Swal.fire("Error!", "Gagal memuat data petugas.", "error");
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

  const fetchPositions = async () => {
    try {
      const response = await axios.get(API_POSITIONS);
      setPositions(response.data);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data jabatan.", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));

    // Jika field yang dipilih adalah 'id' (petugas), update jabatan dan shift
    if (name === "id") {
        const selectedEmployee = employees.find((employee) => employee.id === Number(value));
        if (selectedEmployee) {
            const { position_id, shift_id } = selectedEmployee;

            // Temukan nama jabatan dan shift
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
    }
};


  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormFields((prev) => ({ ...prev, item_discovery_photo: e.target.files[0] }));
    }
  };

  const handleSave = async () => {
    // Pemetaan nama inputan ke Bahasa Indonesia
    const fieldNames = {
      item_discovery_date: "Tanggal Penemuan",
      o_clock_item_discovery: "Jam Penemuan",
      inventors_name: "Nama Penemu",
      ttl: "Tempat, Tanggal Lahir",
      address: "Alamat",
      telephone_number: "Nomor Telepon",
      id_card_number: "Nomor KTP",
      location_found: "Lokasi Ditemukan",
      name_goods: "Nama Barang",
      amount: "Jumlah",
      information: "Keterangan",
      id: "Nama Petugas",
      position_id: "Jabatan",
      shift_id: "Shift"
    };
  
    const requiredFields = Object.keys(fieldNames);
  
    // Cek apakah ada kolom wajib yang kosong
    const emptyFields = requiredFields.filter((field) => !formFields[field]);
  
    if (emptyFields.length > 0) {
      const emptyFieldNames = emptyFields.map((field) => fieldNames[field]).join(", ");
      Swal.fire(
        "Error!",
        `Harap lengkapi semua kolom wajib: ${emptyFieldNames}`,
        "error"
      );
      return;
    }
  
    setIsSaving(true);
    const formData = new FormData();
    Object.entries(formFields).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
  
    try {
      await axios.post(API_ITEM_DISCOVERY, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      Swal.fire("Berhasil!", "Data berhasil disimpan!", "success");
      navigate("/buku/penemuan");
    } catch (error) {
      Swal.fire(
        "Error!",
        `Gagal menyimpan data: ${error.response?.data?.error || error.message}`,
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  
  
  
  

  return (
    <>
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Form Tambah</h1>
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




      {/* Foto */}
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

export default CreateItem;
