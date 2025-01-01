import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
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

  const [isSaving, setIsSaving] = useState(false); // Tambahkan state untuk tombol

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

      // Convert ke Blob dan File
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "captured_image.jpg", { type: "image/jpeg" });
          setFormFields((prev) => ({ ...prev, photo: file }));
          setPhotoPreview(URL.createObjectURL(blob));
          setIsCaptureDisabled(true); // Disable tombol "Ambil Gambar" setelah gambar diambil
        }
      });

      stopCamera();
      setIsCameraOpen(false);
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
    setIsCameraOpen(true); // Buka kamera
    setIsCaptureDisabled(true); // Disable tombol ambil gambar
    setIsUploadDisabled(false); // Enable tombol upload
    setIsPhotoModalOpen(false); // Tutup pop-up "Pilih Foto"
  };
  

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Tambah Karyawan</h1>
      

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
