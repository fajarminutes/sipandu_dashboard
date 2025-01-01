import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Dialog, Transition } from "@headlessui/react";
import { jsPDF } from "jspdf"; // Library PDF untuk frontend
import autoTable from "jspdf-autotable"; // Import plugin untuk tabel

const API_JOURNAL_BOOK = "https://sipandu.sinarjernihsuksesindo.biz.id/api/journal_book/";
const API_CUSTOMERS = "https://sipandu.sinarjernihsuksesindo.biz.id/api/customers/";

const JournalPage: React.FC = () => {
  const navigate = useNavigate();

  // State utama
  const [journals, setJournals] = useState([]); // Data jurnal
  const [customers, setCustomers] = useState([]); // Data lokasi dari customers
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); // Modal ekspor
  const [month, setMonth] = useState(""); // Bulan untuk filter
  const [year, setYear] = useState(""); // Tahun untuk filter
  const [location, setLocation] = useState(""); // Lokasi dari customers

  // Load data journals & customers saat komponen di-mount
  useEffect(() => {
    fetchJournals();
    fetchCustomers();
  }, []);

  // Fetch data journals
  const fetchJournals = async () => {
    try {
      const response = await axios.get(API_JOURNAL_BOOK);
      setJournals(response.data); // Simpan data jurnal
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data jurnal.", "error");
    }
  };

  // Fetch data customers untuk lokasi
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(API_CUSTOMERS);
      setCustomers(response.data); // Simpan data customers
    } catch (error) {
      Swal.fire("Error!", "Gagal memuat data lokasi.", "error");
    }
  };

// Fungsi generatePDF
const generatePDF = () => {
  const doc = new jsPDF("p", "pt", "a4");

  // Header PDF
  doc.setFontSize(14);
  doc.setFont("Helvetica", "bold");
  doc.text(`BUKU JURNAL ${month} - ${year}`, 40, 40);
  doc.setFontSize(12);
  doc.text(
    `Lokasi: ${
      customers.find((c) => c.customer_id.toString() === location)?.name || "N/A"
    }`,
    40,
    60
  );

  // Filter data berdasarkan bulan, tahun, dan lokasi
  const filteredJournals = journals.filter((journal) => {
    const journalDate = new Date(journal.journal_date); // Ubah journal_date ke tipe Date
    const journalMonth = (journalDate.getMonth() + 1).toString().padStart(2, "0"); // Bulan dalam format 2 digit
    const journalYear = journalDate.getFullYear().toString();

    return (
      journalMonth === month &&
      journalYear === year &&
      journal.location_id === parseInt(location) // Cocokkan lokasi
    );
  });

  // Data untuk tabel
  const tableData = filteredJournals.map((entry, index) => [
    index + 1,
    entry.journal_date,
    entry.shift_id, // Ganti dengan nama shift jika ada
    entry.id, // Ganti dengan nama petugas jika ada
    entry.o_clock,
    entry.incident_description,
    entry.information,
  ]);

  // Tabel menggunakan autoTable
  autoTable(doc, {
    startY: 80, // Mulai di bawah header
    head: [
      [
        "No",
        "Tanggal",
        "Shift Regu",
        "Nama Petugas",
        "Jam",
        "Deskripsi Insiden",
        "Keterangan",
      ],
    ],
    body: tableData,
    styles: { fontSize: 10 }, // Ukuran font untuk tabel
    theme: "grid", // Tema tabel
    headStyles: { fillColor: [41, 128, 185] }, // Warna header
  });

  // Preview PDF di tab baru
  window.open(doc.output("bloburl"), "_blank");
};


  const handleExport = () => {
    if (!month || !year || !location) {
      Swal.fire("Error!", "Semua kolom filter harus diisi!", "error");
      return;
    }
    generatePDF();
  };

  return (
    <div>
      <button
        onClick={() => setIsExportModalOpen(true)}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Ekspor Data
      </button>

      {/* Modal Ekspor */}
      <Transition appear show={isExportModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsExportModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Laporan Buku Jurnal Semua Karyawan
                  </Dialog.Title>
                  <div className="mt-4">
                    <label className="block text-sm font-medium">Bulan</label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="border rounded-lg px-3 py-2 w-full"
                    >
                     <option value="">Pilih Bulan</option>
<option value="01">Januari</option>
<option value="02">Februari</option>
<option value="03">Maret</option>
<option value="04">April</option>
<option value="05">Mei</option>
<option value="06">Juni</option>
<option value="07">Juli</option>
<option value="08">Agustus</option>
<option value="09">September</option>
<option value="10">Oktober</option>
<option value="11">November</option>
<option value="12">Desember</option>

                    </select>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium">Tahun</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium">Lokasi</label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="border rounded-lg px-3 py-2 w-full"
                    >
                      <option value="">Pilih Lokasi</option>
                      {customers.map((customer) => (
                        <option key={customer.customer_id} value={customer.customer_id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setIsExportModalOpen(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg mr-2"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleExport}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Ekspor PDF
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default JournalPage;
