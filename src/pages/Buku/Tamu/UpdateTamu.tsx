import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API_GUEST_BOOK = "https://sipandu.sinarjernihsuksesindo.biz.id/api/guest_book/";

const UpdateGuestBook: React.FC = () => {
  const navigate = useNavigate();
  const { id_guest } = useParams<{ id_guest: string }>();
  const [formFields, setFormFields] = useState({
    guest_date: "",
    guest_name: "",
    identity_number: "",
    hp_number: "",
    from_company: "",
    address: "",
    unit_goals: "",
    necessity: "",
    visitor_number: "",
    clock_in: "",
    clock_out: "",
    guest_book_photo: null,
  });

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

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchGuestBook();
  }, []);
  
  const fetchGuestBook = async () => {
    try {
      const response = await axios.get(`${API_GUEST_BOOK}${id_guest}`);
      const { guest_date, guest_name, identity_number, hp_number, from_company, address, unit_goals, necessity, visitor_number, clock_in, clock_out, guest_book_photo } = response.data;
  
      // Set formFields dengan data guest book
      setFormFields({
        guest_date,
        guest_name,
        identity_number,
        hp_number,
        from_company,
        address,
        unit_goals,
        necessity,
        visitor_number,
        clock_in,
        clock_out,
        guest_book_photo,  // Setel foto ke formFields
      });
  
      // Proses guest_book_photo jika ada
      if (guest_book_photo) {
        const updatedPhotoURL = `https://sipandu.sinarjernihsuksesindo.biz.id/${guest_book_photo}`;
        setPhotoPreview(updatedPhotoURL); // Set photoPreview dengan URL foto
      }
  
      setIsLoading(false);
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data buku tamu.", "error");
      setIsLoading(false);
    }
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };


  const validateForm = () => {
    const requiredFields = {
      guest_date: "Tanggal",
      guest_name: "Nama Tamu",
      identity_number: "No. Identitas",
      hp_number: "No. HP",
      from_company: "Dari Perusahaan",
      address: "Alamat",
      necessity: "Keperluan",
      visitor_number: "No. Visitor",
      clock_in: "Jam Masuk",
    };
  
    const emptyFields = Object.entries(requiredFields).filter(
      ([key]) => !formFields[key]
    );
  
    if (emptyFields.length > 0) {
      const fieldNames = emptyFields
        .map(([, name]) => name)
        .join(", ");
  
      Swal.fire(
        "Error!",
        `Kolom berikut wajib diisi: ${fieldNames}.`,
        "error"
      );
      return false;
    }
  
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
  
    setIsSaving(true);
    const formData = new FormData();
  
    // Menambahkan semua data ke formData
    Object.entries(formFields).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
  
    try {
      await axios.put(`${API_GUEST_BOOK}${id_guest}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Pastikan content-type untuk multipart/form-data
        },
      });
      Swal.fire("Berhasil!", "Data buku tamu berhasil diperbarui!", "success");
      navigate("/buku/tamu");
    } catch (error) {
      Swal.fire("Error!", "Gagal memperbarui data buku tamu.", "error");
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
                      const fileName = `Update_Guest_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`; // Nama file final
                      const file = new File([blob], fileName, { type: "image/jpeg" });
        
                      setFormFields((prev) => ({ ...prev, guest_book_photo: file }));
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
                      const fileName = `Update_Guest_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`;
                      const file = new File([blob], fileName, { type: "image/jpeg" });
        
                      setFormFields((prev) => ({ ...prev, guest_book_photo: file }));
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
                  const fileName = `Update_Guest_${randomString}_${formattedDate.replace(/[: ]/g, "_")}.jpg`;
                  const file = new File([blob], fileName, { type: "image/jpeg" });
        
                  setFormFields((prev) => ({ ...prev, guest_book_photo: file }));
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
            setFormFields((prev) => ({ ...prev, guest_book_photo: file }));
            const reader = new FileReader();
            reader.onload = () => setPhotoPreview(reader.result as string); // Set preview image
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
      <h1 className="text-3xl font-bold text-center mb-6">Form Update Buku Tamu</h1>
      <form className="space-y-6">
        {/* Tanggal */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Tanggal</label>
          <input
            type="date"
            name="guest_date"
            value={formFields.guest_date}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Nama Tamu */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Nama Tamu</label>
          <input
            type="text"
            name="guest_name"
            value={formFields.guest_name}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* No. Identitas */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">No. Identitas</label>
          <input
            type="text"
            name="identity_number"
            value={formFields.identity_number}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* No. HP */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">No. HP</label>
          <input
            type="text"
            name="hp_number"
            value={formFields.hp_number}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Dari Perusahaan */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Dari Perusahaan</label>
          <input
            type="text"
            name="from_company"
            value={formFields.from_company}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Alamat */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Alamat</label>
          <textarea
            name="address"
            value={formFields.address}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          ></textarea>
        </div>

        {/* Tujuan Unit */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Tujuan Unit</label>
          <input
            type="text"
            name="unit_goals"
            value={formFields.unit_goals}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Keperluan */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Keperluan</label>
          <input
            type="text"
            name="necessity"
            value={formFields.necessity}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* No. Visitor */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">No. Visitor</label>
          <input
            type="text"
            name="visitor_number"
            value={formFields.visitor_number}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Jam Masuk */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Jam Masuk</label>
          <input
            type="time"
            name="clock_in"
            value={formFields.clock_in}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Jam Keluar */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Jam Keluar</label>
          <input
            type="time"
            name="clock_out"
            value={formFields.clock_out}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
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
   {photoPreview && (
  <img
    src={photoPreview}
    alt="Preview"
    className="mt-4 w-32 h-32 object-cover rounded-md"
  />
)}


        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleUpdate}
            className={`bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isSaving}
          >
            {isSaving ? "Menyimpan..." : "Update"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/buku/tamu")}
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

export default UpdateGuestBook;
