import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate, useParams } from "react-router-dom";
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

  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [shifts, setShifts] = useState([]);

  const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch checkpoint data
        const checkpointRes = await axios.get(`${API_CHECKPOINTS}${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        const checkpointData = checkpointRes.data;
  
        // Set formFields dengan data checkpoint
        setFormFields({
          urutan: checkpointData.urutan,
          checkpoints_name: checkpointData.checkpoints_name,
          todo_list: checkpointData.todo_list,
          id_area_patroli: checkpointData.id_area_patroli,
          shift_id: checkpointData.shift_id,
          customer_id: checkpointData.customer_id,
          duration: checkpointData.duration,
          photo: null,
        });
  
        // Memeriksa foto pada checkpoint
        if (checkpointData.photo) {
          const updatedPhotoURL = `https://sipandu.sinarjernihsuksesindo.biz.id/${checkpointData.photo}`;
          setPhotoPreview(updatedPhotoURL); // Set photoPreview dengan URL foto dari API
        }
  
        // Fetch customers, areas, and shifts secara paralel
        const [customersRes, areasRes, shiftsRes] = await Promise.all([
          axios.get(API_CUSTOMERS),
          axios.get(API_AREA_PATROLI, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),
          axios.get("https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts/"),
        ]);
  
        let fetchedCustomers = customersRes.data;
        let fetchedAreas = areasRes.data;
  
        if (userData && userData.level) {
          const userLevel = parseInt(userData.level, 10);
  
          // Filter customers dan areas berdasarkan level
          if (userLevel !== 2) {
            fetchedCustomers = fetchedCustomers.filter(
              (customer) => customer.customer_id === userLevel
            );
            fetchedAreas = fetchedAreas.filter(
              (area) => area.customer_id === userLevel
            );
          }
        }
  
        setCustomers(fetchedCustomers);
        setFilteredAreas(
          fetchedAreas.filter(
            (area) => area.customer_id === parseInt(checkpointData.customer_id)
          )
        );
        setShifts(shiftsRes.data);
  
      } catch (error) {
        Swal.fire("Error!", "Gagal memuat data.", "error");
      }
    };
  
    initializeData();
  }, [id, accessToken, userData]);
  
  
  const handleCustomerChange = (customerId) => {
    setFormFields({ ...formFields, customer_id: customerId, id_area_patroli: "" });
  
    // Fetch ulang area patroli berdasarkan customer_id yang dipilih
    axios
      .get(API_AREA_PATROLI, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        let filtered = response.data.filter(
          (area) => area.customer_id === parseInt(customerId)
        );
  
        if (userData && userData.level) {
          const userLevel = parseInt(userData.level, 10);
          // Filter area patroli jika level pengguna bukan "2"
          if (userLevel !== 2) {
            filtered = filtered.filter((area) => area.customer_id === userLevel);
          }
        }
  
        setFilteredAreas(filtered);
      })
      .catch(() => {
        Swal.fire("Error!", "Gagal memuat data area patroli.", "error");
      });
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
                    const fileName = `Update_Checkpoints_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`; // Nama file final
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
                    const fileName = `Update_Checkpoints_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`;
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
                const fileName = `Update_Checkpoints_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`;
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
      <h1 className="text-3xl font-bold text-center mb-6">Perbarui Data Checkpoints</h1>
      <form className="space-y-6">
        {/* Form fields */}
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
   {photoPreview && (
  <img
    src={photoPreview}
    alt="Preview"
    className="mt-4 w-32 h-32 object-cover rounded-md"
  />
)}


        </div>
        {/* Other fields */}

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

export default UpdateCheckpoint;
