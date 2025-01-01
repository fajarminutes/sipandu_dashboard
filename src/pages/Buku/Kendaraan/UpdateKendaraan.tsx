import React, { useState, useEffect, Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import Swal from "sweetalert2";

const API_VEHICLE_BOOK = "https://sipandu.sinarjernihsuksesindo.biz.id/api/vehicle_book/";
const API_EMPLOYEES = "https://sipandu.sinarjernihsuksesindo.biz.id/api/employees/";
const API_SHIFTS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts/";
const API_AREAS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/areas/";
const API_CUSTOMERS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/customers/";

const UpdateKendaraan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
    
        const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [dateTime, setDateTime] = useState(null);
    
      
        
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
                      const fileName = `Update_Kendaraan_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`; // Nama file final
                      const file = new File([blob], fileName, { type: "image/jpeg" });
        
                      setFormFields((prev) => ({ ...prev, foto: file }));
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
                      const fileName = `Update_Kendaraan_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`;
                      const file = new File([blob], fileName, { type: "image/jpeg" });
        
                      setFormFields((prev) => ({ ...prev, foto: file }));
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
                  const fileName = `Update_Kendaraan_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`;
                  const file = new File([blob], fileName, { type: "image/jpeg" });
        
                  setFormFields((prev) => ({ ...prev, foto: file }));
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
          setFormFields((prev) => ({ ...prev, foto: file }));
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
    const fetchData = async () => {
      await Promise.all([fetchAreas(), fetchCustomers(), fetchShifts(), fetchEmployees()]);
      fetchVehicleBook();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formFields.id_area && areas.length > 0 && employees.length > 0) {
      const selectedArea = areas.find((area) => area.id_area === Number(formFields.id_area));
      if (selectedArea) {
        const relatedEmployees = employees.filter(
          (employee) => employee.customer_id === selectedArea.building_id
        );

        
        setFilteredEmployees(relatedEmployees);
      } else {
        setFilteredEmployees([]);
      }
    }
  }, [formFields.id_area, areas, employees]);

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

      console.log(data);
      if (data.foto) {
        const updatedPhotoURL = `https://sipandu.sinarjernihsuksesindo.biz.id/uploads/${data.foto}`;
        setPhotoPreview(updatedPhotoURL); // Set photoPreview dengan URL dari API
      }

      setFormFields({
        vehicle_book_date: data.vehicle_book_date,
        id_area: data.id_area.toString(),
        shift_id: data.shift_id.toString(),
        id: data.id.toString(),
        foto: null,
      });
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
      navigate("/buku/kendaraan/kendaraan");
    } catch (error) {
      Swal.fire("Error!", "Gagal memperbarui data kendaraan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
   <>
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Form Edit Kendaraan</h1>
      <form className="space-y-6">
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
            onClick={() => navigate("/buku/kendaraan/kendaraan")}
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

export default UpdateKendaraan;
