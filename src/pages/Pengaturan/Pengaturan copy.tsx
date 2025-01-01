import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import Swal from "sweetalert2";

const API_SW_SITE = "https://sipandu.sinarjernihsuksesindo.biz.id/api/sw_sites/1"; // Ganti dengan URL endpoint Anda

const UpdatePengaturanWeb: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profil"); // Tab aktif
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Fetch data terbaru dari API
  useEffect(() => {
    const fetchData = async () => {
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
      }
    };

    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormFields((prev) => ({ ...prev, site_logo: file }));
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      Swal.fire("Success", "Pengaturan web berhasil diperbarui!", "success");
    } catch (error) {
      console.error("Failed to update data:", error);
      Swal.fire("Error", "Gagal memperbarui pengaturan web!", "error");
    }
  };

 

  

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Pengaturan Web</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
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

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {activeTab === "profil" && (
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
              {photoPreview && <img src={photoPreview} alt="Logo Preview" className="mt-4 w-64 h-32 rounded-md" />}
            </div>
          </div>
        )}

        {activeTab === "serverEmail" && (
          <div>
            <p>Tab Server Email belum diimplementasikan.</p>
          </div>
        )}

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
};

export default UpdatePengaturanWeb;
