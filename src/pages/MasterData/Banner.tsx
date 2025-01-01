import { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { DataTable } from 'mantine-datatable';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';

const API_BASE_URL = 'https://smkpkp.criwis-sjs.biz.id/api/home';

// Define the Banner interface
interface Banner {
  id: number;
  image_url: string;
  description: string;
  order: number;
}

const normalizeImageUrl = (url: string): string => {
  return url.replace('/home/sinarjer/smkpkp.criwis-sjs.biz.id', '');
};

const BannerPage = () => {
  const dispatch = useDispatch();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({
    description: '',
    order: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  useEffect(() => {
    dispatch(setPageTitle('Banner Management'));
    fetchBanners();
  }, [dispatch]);

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/hero_banner`);
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const openModal = (banner: Banner | null = null) => {
    setEditingBanner(banner);
    if (banner) {
      setFormFields({
        description: banner.description,
        order: banner.order,
      });
    } else {
      setFormFields({ description: '', order: 0 });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setImageFile(null);
    setFormFields({ description: '', order: 0 });
  };

  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setImageFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: { 'image/*': [] },
  });

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('description', formFields.description);
      formData.append('order', formFields.order.toString());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingBanner) {
        await axios.put(`${API_BASE_URL}/hero_banner/${editingBanner.id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/hero_banner`, formData);
      }

      fetchBanners();
      closeModal();
      alert('Banner saved successfully!');
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/hero_banner/${id}`);
      fetchBanners();
      alert('Banner deleted successfully!');
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Banner Management</h1>
      <button
        onClick={() => openModal()}
        className="btn btn-primary mb-4"
      >
        Add New Banner
      </button>
      <DataTable
        columns={[
          {
            accessor: 'image',
            title: 'Image',
            render: (row) => (
              <img
                src={`https://smkpkp.criwis-sjs.biz.id${normalizeImageUrl(row.image_url)}`}
                alt="Banner"
                className="w-16 h-16 rounded"
              />
            ),
          },
          { accessor: 'description', title: 'Description' },
          { accessor: 'order', title: 'Order' },
          {
            accessor: 'actions',
            title: 'Actions',
            render: (row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(row)}
                  className="btn btn-primary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        records={banners}
        totalRecords={banners.length}
        pagination={{
          page,
          onPageChange: setPage,
          totalRecords: banners.length,
          recordsPerPage: 10,
        }}
        highlightOnHover
        withBorder
        withColumnBorders
      />

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                  </Dialog.Title>
                  <div className="mt-4">
                    <label className="block font-bold">Description</label>
                    <textarea
                      value={formFields.description}
                      onChange={(e) =>
                        setFormFields({ ...formFields, description: e.target.value })
                      }
                      className="form-input mt-2 w-full"
                    ></textarea>

                    <label className="block font-bold mt-4">Order</label>
                    <input
                      type="number"
                      value={formFields.order}
                      onChange={(e) =>
                        setFormFields({ ...formFields, order: Number(e.target.value) })
                      }
                      className="form-input mt-2 w-full"
                    />

                    <label className="block font-bold mt-4">Image</label>
                    <div
                      {...getRootProps()}
                      className="border-dashed border-2 border-gray-400 p-4 mt-2 rounded-md cursor-pointer"
                    >
                      <input {...getInputProps()} />
                      {imageFile ? (
                        <p>{imageFile.name}</p>
                      ) : (
                        <p>Drag & drop an image file here, or click to select one</p>
                      )}
                    </div>

                    {(imageFile || editingBanner?.image_url) && (
                      <img
                        src={
                          imageFile
                            ? URL.createObjectURL(imageFile)
                            : `https://smkpkp.criwis-sjs.biz.id${normalizeImageUrl(editingBanner?.image_url ?? '')}`
                        }
                        alt="Preview"
                        className="mt-4 max-w-full rounded-md"
                      />
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="btn btn-primary mr-4"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                    >
                      Cancel
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

export default BannerPage;
