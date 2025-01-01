import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import Swal from "sweetalert2";


interface Topic {
  id_topic: number;
  topic_name: string;
  created_at: string;
  updated_at: string | null;
}

const TOPIC_API = "https://sipandu.sinarjernihsuksesindo.biz.id/api/topic/";

const TopicPage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({ topic_name: "" });
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // Tambahkan state ini
  

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Topic[]>(TOPIC_API);
      setTimeout(() => {
        const sortedTopics = response.data.sort((a, b) => b.id_topic - a.id_topic);
        setTopics(sortedTopics);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Gagal mengambil data topic:", error);
      setIsLoading(false);
      Swal.fire("Error!", "Gagal memuat data topic.", "error");
    }
  };

  const openModal = (topic: Topic | null = null) => {
    setEditingTopic(topic);
    setFormFields({ topic_name: topic ? topic.topic_name : "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTopic(null);
    setFormFields({ topic_name: "" });
  };

  const validateForm = () => {
    if (!formFields.topic_name) {
      Swal.fire("Error!", "Nama topic harus diisi!", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const topicData = { topic_name: formFields.topic_name };

      if (editingTopic) {
        await axios.put(`${TOPIC_API}${editingTopic.id_topic}`, topicData);
      } else {
        await axios.post(TOPIC_API, topicData);
      }

      fetchTopics();
      closeModal();
      Swal.fire("Berhasil!", "Data topic berhasil disimpan!", "success");
    } catch (error) {
      console.error("Gagal menyimpan topic:", error);
      Swal.fire("Error!", "Gagal menyimpan data topic.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data ini tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${TOPIC_API}${id}`);
          fetchTopics();
          Swal.fire("Terhapus!", "Data topic berhasil dihapus!", "success");
        } catch (error) {
          console.error("Gagal menghapus topic:", error);
          Swal.fire("Error!", "Gagal menghapus data topic.", "error");
        }
      }
    });
  };

  const filteredTopics = topics.filter((topic) =>
    topic.topic_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTopics.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTopics.length / itemsPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Topic</h1>
        <button
          onClick={() => openModal()}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Tambah Topic Baru
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border px-4 py-2"
        />
        <input
          type="number"
          min="1"
          max="50"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Math.max(1, Number(e.target.value)))}
          className="border px-2 py-1 w-20"
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
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">No</th>
                <th className="border px-4 py-2">Nama Topic</th>
                <th className="border px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((topic, index) => (
                <tr key={topic.id_topic}>
                  <td className="border px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                  <td className="border px-4 py-2">{topic.topic_name}</td>
                  <td className="border px-4 py-2 flex justify-center space-x-2">
                    <button
                      onClick={() => openModal(topic)}
                      className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(topic.id_topic)}
                      className="bg-red-600 text-white py-1 px-4 rounded-lg hover:bg-red-700"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-gray-600">
              Halaman {filteredTopics.length > 0 ? currentPage : 0} dari {totalPages}
            </p>
            <button
              disabled={currentPage >= totalPages}
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
                  {editingTopic ? "Edit Topic" : "Tambah Topic Baru"}
                </Dialog.Title>
                <div className="mt-4">
                  <label className="block font-bold">Nama Topic</label>
                  <input
                    type="text"
                    value={formFields.topic_name}
                    onChange={(e) =>
                      setFormFields({ ...formFields, topic_name: e.target.value })
                    }
                    className="form-input mt-2 w-full"
                  />
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
                    {editingTopic ? "Perbarui" : "Simpan"}
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal Informasi */}
             <Transition appear show={isInfoModalOpen} as={Fragment}>
              <Dialog onClose={() => setIsInfoModalOpen(false)} className="relative z-10">
                <div className="fixed inset-0 bg-black bg-opacity-30" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                  <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
                    <Dialog.Title className="text-lg font-bold mb-4">Informasi</Dialog.Title>
                    <p className="mb-4">
                      <strong>Cara Penggunaan:</strong> Gunakan kolom pencarian untuk mencari nama topic.
                    </p>
                    <p>
                      <strong>Jumlah Data:</strong> Gunakan input angka untuk menentukan berapa banyak data
                      yang ingin ditampilkan di setiap halaman.
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

export default TopicPage;
