import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_SW_SITE = "https://sipandu.sinarjernihsuksesindo.biz.id/api/sw_sites/1";

const UpdatePengaturanWeb: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pengaturan"); // Tab aktif
  const [formFields, setFormFields] = useState({
    site_name: "",
    site_description: "",
    site_phone: "",
    site_address: "",
    site_email: "",
    site_email_domain: "",
    site_url: "",
    site_logo: null as File | null,
  });
  const [formFieldsProfil, setFormFieldsProfil] = useState({
    profil_company: "",
    profil_director: "",
    profil_manager: "",
  });

  const [formFieldsServerEmail, setFormFieldsServerEmail] = useState({
    gmail_host: "",
    gmail_username: "",
    gmail_password: "",
    gmail_port: "",
  });

  useEffect(() => {
    const fetchDataServerEmail = async () => {
      setIsLoadingProfil(true);
      try {
        const response = await axios.get(API_SW_SITE);
        const data = response.data;
        setFormFieldsServerEmail({
          gmail_host: data.gmail_host || "",
          gmail_username: data.gmail_username || "",
          gmail_password: data.gmail_password || "",
          gmail_port: data.gmail_port || "",
        });
      } catch (error) {
        console.error("Failed to fetch server email data:", error);
        Swal.fire("Error", "Gagal mengambil data server email!", "error");
      } finally {
        setIsLoadingProfil(false);
      }
    };
  
    fetchDataServerEmail();
  }, []);

  const handleInputChangeServerEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormFieldsServerEmail((prev) => ({ ...prev, [name]: value }));
  };
  

  const [isLoadingProfil, setIsLoadingProfil] = useState(true); // Untuk loading halaman

  const [isSubmittingProfil, setIsSubmittingProfil] = useState(false); // Untuk tombol simpan

  // Fetch data dari API dengan loading selama 2 detik
  useEffect(() => {
    const fetchDataProfil = async () => {
      setIsLoadingProfil(true); // Set loading ke true
      try {
        const response = await axios.get(API_SW_SITE);
        const data = response.data;
        setFormFieldsProfil({
          profil_company: data.site_company || "",
          profil_director: data.site_director || "",
          profil_manager: data.site_manager || "",
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        Swal.fire("Error", "Gagal mengambil data profil perusahaan!", "error");
      } finally {
        setTimeout(() => setIsLoadingProfil(false), 1500); // Tambahkan jeda 1,5 detik untuk loading
      }
    };

    fetchDataProfil();
  }, []);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Untuk loading halaman
  const [isSubmitting, setIsSubmitting] = useState(false); // Untuk tombol simpan

  // Fetch data dari API dengan loading selama 2 detik
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Set loading ke true
      try {
        const response = await axios.get(API_SW_SITE);
        const data = response.data;
        setFormFields({
          site_name: data.site_name || "",
          site_description: data.site_description || "",
          site_phone: data.site_phone || "",
          site_address: data.site_address || "",
          site_email: data.site_email || "",
          site_email_domain: data.site_email_domain || "",
          site_url: data.site_url || "",
          site_logo: null,
        });
        setPhotoPreview(data.site_logo ? `https://sipandu.sinarjernihsuksesindo.biz.id/${data.site_logo}` : null);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        Swal.fire("Error", "Gagal mengambil data pengaturan web!", "error");
      } finally {
        setTimeout(() => setIsLoading(false), 2000); // Tambahkan jeda 2 detik untuk loading
      }
    };

    fetchData();
  }, []);

   // Handle perubahan input
   const handleInputChangeProfil = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormFieldsProfil((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit dengan jeda 1 detik
  const handleSubmitProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfil(true); // Set tombol submit menjadi disabled
    try {
      const formDataProfil = {
        site_company: formFieldsProfil.profil_company,
        site_director: formFieldsProfil.profil_director,
        site_manager: formFieldsProfil.profil_manager,
      };

      await axios.put(API_SW_SITE, formDataProfil);

      // Tambahkan jeda 1 detik sebelum notifikasi
      setTimeout(() => {
        Swal.fire("Success", "Profil perusahaan berhasil diperbarui!", "success");
      }, 1000);
    } catch (error) {
      console.error("Failed to update data:", error);
      Swal.fire("Error", "Gagal memperbarui profil perusahaan!", "error");
    } finally {
      // Tambahkan jeda 1 detik sebelum tombol aktif kembali
      setTimeout(() => setIsSubmittingProfil(false), 1000);
    }
  };

  // Tampilkan loading jika data sedang diambil
  if (isLoadingProfil) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-gray-600 animate-pulse">Memuat data...</p>
      </div>
    );
  }

  const handleSubmitServerEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfil(true); // Set tombol submit menjadi disabled
    try {
      // Kirim data sebagai JSON
      const formData = {
        gmail_host: formFieldsServerEmail.gmail_host,
        gmail_username: formFieldsServerEmail.gmail_username,
        gmail_password: formFieldsServerEmail.gmail_password,
        gmail_port: formFieldsServerEmail.gmail_port,
      };
  
      await axios.put(API_SW_SITE, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      // Tampilkan notifikasi sukses
      Swal.fire("Success", "Pengaturan Gmail berhasil diperbarui!", "success");
    } catch (error) {
      console.error("Failed to update server email data:", error);
      Swal.fire("Error", "Gagal memperbarui pengaturan Gmail!", "error");
    } finally {
      setIsSubmittingProfil(false); // Aktifkan kembali tombol submit
    }
  };
  


  // Handle perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  // Handle upload logo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormFields((prev) => ({ ...prev, site_logo: file }));
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle submit dengan jeda 1 detik
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Set tombol submit menjadi disabled
    try {
      const formData = new FormData();
      for (const key in formFields) {
        if (formFields[key as keyof typeof formFields]) {
          formData.append(key, formFields[key as keyof typeof formFields] as any);
        }
      }

      await axios.put(API_SW_SITE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Tambahkan jeda 1 detik sebelum notifikasi
      setTimeout(() => {
        Swal.fire("Success", "Pengaturan web berhasil diperbarui!", "success");
      }, 1000);
    } catch (error) {
      console.error("Failed to update data:", error);
      Swal.fire("Error", "Gagal memperbarui pengaturan web!", "error");
    } finally {
      // Tambahkan jeda 1 detik sebelum tombol aktif kembali
      setTimeout(() => setIsSubmitting(false), 1000);
    }
  };

  // Tampilkan loading jika data sedang diambil
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-gray-600 animate-pulse">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Pengaturan Web</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${
            activeTab === "pengaturan" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("pengaturan")}
        >
          Pengaturan
        </button>

        <button
          className={`px-4 py-2 ${
            activeTab === "profil" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("profil")}
        >
          Profil
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "serverEmail" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("serverEmail")}
        >
          Server Email
        </button>
      </div>

      {activeTab === "pengaturan" && (
        <>
       
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div>
          <div className="form-group mb-4">
            <label className="block font-medium mb-2">Nama Website</label>
            <input
              type="text"
              name="site_name"
              value={formFields.site_name}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="form-group mb-4">
            <label className="block font-medium mb-2">Deskripsi</label>
            <textarea
              name="site_description"
              value={formFields.site_description}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="form-group mb-4">
            <label className="block font-medium mb-2">No Telepon</label>
            <input
              type="text"
              name="site_phone"
              value={formFields.site_phone}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="form-group mb-4">
            <label className="block font-medium mb-2">Alamat</label>
            <textarea
              name="site_address"
              value={formFields.site_address}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="form-group mb-4">
            <label className="block font-medium mb-2">Email</label>
            <input
              type="email"
              name="site_email"
              value={formFields.site_email}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="form-group mb-4">
            <label className="block font-medium mb-2">Domain Email</label>
            <input
              type="text"
              name="site_email_domain"
              value={formFields.site_email_domain}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="form-group mb-4">
            <label className="block font-medium mb-2">Alamat Website</label>
            <input
              type="text"
              name="site_url"
              value={formFields.site_url}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="form-group mb-4">
            <label className="block font-medium mb-2">Logo Website</label>
            <input type="file" onChange={handleFileChange} className="w-full border rounded-lg p-2" />
            {photoPreview && <img src={photoPreview} alt="Logo Preview" className="mt-4 w-92 h-32 rounded-md" />}
          </div>
        </div>

        <button
          type="submit"
          className={`bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
      </>
        )}

{activeTab === "profil" && (
        <>
       
      {/* Form */}
      <form onSubmit={handleSubmitProfil}>
        <div className="form-group mb-4">
          <label className="block font-medium mb-2">Nama Perusahaan</label>
          <input
            type="text"
            name="profil_company"
            value={formFieldsProfil.profil_company}
            onChange={handleInputChangeProfil}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div className="form-group mb-4">
          <label className="block font-medium mb-2">Nama Direktur</label>
          <input
            type="text"
            name="profil_director"
            value={formFieldsProfil.profil_director}
            onChange={handleInputChangeProfil}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div className="form-group mb-4">
          <label className="block font-medium mb-2">Nama Manager</label>
          <input
            type="text"
            name="profil_manager"
            value={formFieldsProfil.profil_manager}
            onChange={handleInputChangeProfil}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <button
          type="submit"
          className={`bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 ${
            isSubmittingProfil ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmittingProfil}
        >
          {isSubmittingProfil ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
      </>
        )}

{activeTab === "serverEmail" && (
  <>
    <form onSubmit={handleSubmitServerEmail}>
      <div className="form-group mb-4">
        <label className="block font-medium mb-2">Host Gmail</label>
        <input
          type="text"
          name="gmail_host"
          value={formFieldsServerEmail.gmail_host}
          onChange={handleInputChangeServerEmail}
          className="w-full border rounded-lg p-2"
        />
      </div>

      <div className="form-group mb-4">
        <label className="block font-medium mb-2">Username</label>
        <input
          type="text"
          name="gmail_username"
          value={formFieldsServerEmail.gmail_username}
          onChange={handleInputChangeServerEmail}
          className="w-full border rounded-lg p-2"
        />
      </div>

      <div className="form-group mb-4">
        <label className="block font-medium mb-2">Password</label>
        <input
          type="text"
          name="gmail_password"
          value={formFieldsServerEmail.gmail_password}
          onChange={handleInputChangeServerEmail}
          className="w-full border rounded-lg p-2"
        />
      </div>

      <div className="form-group mb-4">
        <label className="block font-medium mb-2">Port</label>
        <input
          type="text"
          name="gmail_port"
          value={formFieldsServerEmail.gmail_port}
          onChange={handleInputChangeServerEmail}
          className="w-full border rounded-lg p-2"
        />
      </div>

      <button
        type="submit"
        className={`bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 ${
          isSubmittingProfil ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isSubmittingProfil}
      >
        {isSubmittingProfil ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  </>
)}

    </div>
  );
};

export default UpdatePengaturanWeb;
