import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import Swal from "sweetalert2";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";

interface Thema {
  id: number;
  name: string;
  photo: string;
  active: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = "https://sipandu.sinarjernihsuksesindo.biz.id/api/thema-cards/";
const IMAGE_BASE_URL = "https://sipandu.sinarjernihsuksesindo.biz.id/";

const ThemaPage: React.FC = () => {
  const [themaList, setThemaList] = useState<Thema[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({ name: "", photo: null });
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [editingThema, setEditingThema] = useState<Thema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTermThema, setSearchTermThema] = useState(() => localStorage.getItem("searchTermThema") || "");
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(5); // Jumlah data per halaman
const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // Untuk modal informasi


  useEffect(() => {
    fetchThemas();
  }, []);

  useEffect(() => {
    localStorage.setItem("searchTermThema", searchTermThema); // Simpan nilai pencarian ke LocalStorage
  }, [searchTermThema]);
  

  const fetchThemas = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Thema[]>(API_BASE_URL);
      const updatedData = response.data.map((thema) => ({
        ...thema,
        photo: `${IMAGE_BASE_URL}${thema.photo}`,
      }));
  
      // Sort the data by ID in descending order
      const sortedData = updatedData.sort((a, b) => b.id - a.id); // Assuming 'id' is the property name
  
      setTimeout(() => {
        setThemaList(sortedData);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
      Swal.fire("Error", "Gagal memuat data.", "error");
    }
  };
  
  const openModal = (thema: Thema | null = null) => {
    setEditingThema(thema);
    if (thema) {
      setFormFields({ name: thema.name, photo: null });
      setPreviewPhoto(thema.photo);
    } else {
      setFormFields({ name: "", photo: null });
      setPreviewPhoto(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingThema(null);
    setFormFields({ name: "", photo: null });
    setPreviewPhoto(null);
  };

  const handleSave = async () => {
    const { name, photo } = formFields;
    if (!name) {
      Swal.fire("Error", "Nama harus diisi!", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (photo) formData.append("photo", photo);
      formData.append("active", editingThema ? editingThema.active : "2");

      if (editingThema) {
        await axios.put(`${API_BASE_URL}${editingThema.id}`, formData);
      } else {
        await axios.post(API_BASE_URL, formData);
      }

      fetchThemas();
      closeModal();
      Swal.fire("Success", "Data berhasil disimpan!", "success");
    } catch (error) {
      console.error("Error saving data:", error.response?.data || error.message);
      Swal.fire("Error", "Gagal menyimpan data.", "error");
    }
  };

  const handleDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
  
      // Validasi format file
      if (!file.type.includes("image")) {
        Swal.fire("Error", "Hanya file gambar yang diperbolehkan!", "error");
        return;
      }
  
      try {
        // Konversi gambar ke format .jpg dengan canvas
        const compressImage = async (imageFile: File) => {
          const img = new Image();
          img.src = URL.createObjectURL(imageFile);
  
          return new Promise<File>((resolve, reject) => {
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
  
              const maxWidth = 800; // Dimensi maksimum gambar
              const maxHeight = 800;
              let width = img.width;
              let height = img.height;
  
              if (width > height) {
                if (width > maxWidth) {
                  height = (height * maxWidth) / width;
                  width = maxWidth;
                }
              } else {
                if (height > maxHeight) {
                  width = (width * maxHeight) / height;
                  height = maxHeight;
                }
              }
  
              canvas.width = width;
              canvas.height = height;
  
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
  
                canvas.toBlob(
                  (blob) => {
                    if (blob) {
                      // Generate nama file
                      const now = new Date();
                      const day = now.getDate().toString().padStart(2, "0");
                      const month = (now.getMonth() + 1).toString().padStart(2, "0");
                      const year = now.getFullYear();
                      const randomChars = Math.random().toString(36).substring(2, 7); // 5 karakter acak
  
                      const fileName = `compressed_${day}_${month}_${year}_${randomChars}.jpg`;
  
                      const newFile = new File([blob], fileName, {
                        type: "image/jpeg",
                      });
                      resolve(newFile);
                    } else {
                      reject(new Error("Gagal mengubah gambar."));
                    }
                  },
                  "image/jpeg",
                  0.8 // Kualitas gambar
                );
              } else {
                reject(new Error("Canvas tidak tersedia."));
              }
            };
  
            img.onerror = () => {
              reject(new Error("Gagal memuat gambar."));
            };
          });
        };
  
        const compressedFile = await compressImage(file);
  
        // Validasi ukuran file
        if (compressedFile.size > 1000 * 1024) {
          Swal.fire(
            "Error",
            "Ukuran file setelah diproses melebihi 50 KB.",
            "error"
          );
          return;
        }
  
        setFormFields({ ...formFields, photo: compressedFile });
        setPreviewPhoto(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error("Error compressing image:", error);
        Swal.fire("Error", "Gagal memproses gambar.", "error");
      }
    }
  };
  
  

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const updatedStatus = currentStatus === '2' ? '1' : '2';
      await axios.put(`${API_BASE_URL}${id}`, { active: updatedStatus });
      fetchThemas();
      Swal.fire('Success', 'Status berhasil diubah!', 'success');
    } catch (error) {
      console.error('Error toggling status:', error);
      Swal.fire('Error', 'Gagal mengubah status.', 'error');
    }
  };


  const filteredThemas = themaList.filter((thema) =>
    thema.name.toLowerCase().includes(searchTermThema.toLowerCase())
  );
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredThemas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredThemas.length / itemsPerPage);
  

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: "image/*",
  });


  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Hapus Thema?',
      text: 'Data ini tidak dapat dikembalikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}${id}`);
          fetchThemas();
          Swal.fire('Deleted!', 'Thema berhasil dihapus.', 'success');
        } catch (error) {
          console.error('Error deleting thema:', error);
          Swal.fire('Error!', 'Gagal menghapus thema.', 'error');
        }
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Tema Card</h1>
        <button
          onClick={() => openModal()}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Tambah Tema Baru
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
  <input
    type="text"
    placeholder="Cari tema..."
    value={searchTermThema}
    onChange={(e) => setSearchTermThema(e.target.value)}
    className="w-full border px-4 py-2"
  />
  <input
    type="number"
    min="1"
    max="50"
    value={itemsPerPage}
    onChange={(e) => setItemsPerPage(Number(e.target.value))}
    className="border px-2 py-1 w-20"
    title="Jumlah data per halaman"
  />
  <button
    onClick={() => setIsInfoModalOpen(true)}
    className="text-gray-500 hover:text-gray-700"
    title="Informasi"
  >
    ?
  </button>
</div>


      {isLoading ? (
        <div className="text-center">
          <div className="loader border-t-4 border-blue-600 border-solid rounded-full w-16 h-16 mx-auto animate-spin"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-4">
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">No</th>
                <th className="border px-4 py-2">Foto</th>
                <th className="border px-4 py-2">Nama</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((thema, index) => (
                <tr key={thema.id}>
                  {/* Nomor Urut */}
                  <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                  
                  {/* Kolom Foto */}
                  <td className="border px-4 py-2 text-center">
                    <img
                      src={thema.photo}
                      alt={thema.name}
                      className="w-16 h-16 object-cover rounded-full mx-auto"
                    />
                  </td>
                  
                  {/* Kolom Nama */}
                  <td className="border px-4 py-2">{thema.name}</td>
                  
                  {/* Kolom Status */}
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleToggleStatus(thema.id, thema.active)}
                      className={`py-1 px-4 rounded-lg font-bold ${
                        thema.active === "2" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                      }`}
                    >
                      {thema.active === "2" ? "Aktif" : "Tidak Aktif"}
                    </button>
                  </td>
                  
                  {/* Kolom Aksi */}
                  <td className="border px-4 py-2 flex justify-center space-x-2">
                    <button
                      onClick={() => openModal(thema)}
                      className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(thema.id)}
                      className="bg-red-600 text-white py-1 px-4 rounded-lg hover:bg-red-700"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      
       {/* Pagination */}
       <div className="flex flex-col sm:flex-row sm:justify-between items-center mt-4 space-y-2 sm:space-y-0">
          <button
            disabled={currentPage === 1 || totalPages === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-gray-600 text-center sm:text-left">
            Halaman {filteredThemas.length > 0 ? currentPage : 0} dari {totalPages}
          </p>
          <button
            disabled={currentPage >= totalPages || totalPages === 1}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      
      )}

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <div className="fixed inset-0 bg-black bg-opacity-25" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
                <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                  {editingThema ? "Edit Tema" : "Tambah Tema Baru"}
                </Dialog.Title>
                <div className="mt-4">
                  <label className="block font-bold">Nama Tema</label>
                  <input
                    type="text"
                    value={formFields.name}
                    onChange={(e) =>
                      setFormFields({ ...formFields, name: e.target.value })
                    }
                    className="form-input mt-2 w-full"
                  />
                </div>
                <div className="mt-4">
                  <label className="block font-bold">Foto</label>
                  <div
                    {...getRootProps({
                      className:
                        "border-2 border-dashed border-gray-400 p-4 rounded-lg cursor-pointer text-center",
                    })}
                  >
                    <input {...getInputProps()} />
                    {previewPhoto ? (
                      <img
                        src={previewPhoto}
                        alt="Preview"
                        className="w-full h-32 object-cover mt-2"
                      />
                    ) : (
                      <p>Drag and drop file atau klik untuk mengunggah</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    className="bg-gray-600 text-white py-2 px-6 rounded-lg"
                    onClick={closeModal}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg"
                    onClick={handleSave}
                  >
                    {editingThema ? "Perbarui" : "Simpan"}
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isInfoModalOpen} as={Fragment}>
  <Dialog onClose={() => setIsInfoModalOpen(false)} className="relative z-10">
    <div className="fixed inset-0 bg-black bg-opacity-30" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <Dialog.Title className="text-lg font-bold mb-4">Informasi</Dialog.Title>
        <p className="mb-4">
          <strong>Cara Penggunaan:</strong> Gunakan kolom pencarian untuk mencari tema berdasarkan nama.
        </p>
        <p>
          <strong>Jumlah Data:</strong> Gunakan input angka untuk menentukan berapa banyak data yang ingin
          ditampilkan di setiap halaman.
        </p>
        <div className="flex justify-end">
          <button
            onClick={() => setIsInfoModalOpen(false)}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
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

export default ThemaPage;
