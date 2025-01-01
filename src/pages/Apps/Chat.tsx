import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconSquareCheck from '../../components/Icon/IconSquareCheck';
import IconChatDots from '../../components/Icon/IconChatDots';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

// API Base URL
const API_BASE_URL = 'https://smkpkp.criwis-sjs.biz.id/api/home';

// Interfaces untuk data
interface Greeting {
  id: number;
  text: string;
  image_url: string | null;
}

interface Kompetensi {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
}

interface Testimoni {
  id: number;
  name: string;
  testimony_text: string;
  profile_picture_url: string | null;
}

interface PPDBBanner {
  id: number;
  image_url: string | null;
  description: string;
}

interface Industri {
  id: number;
  company_name: string;
  logo_url: string | null;
}

const Chat = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle('Chat'));
  }, [dispatch]);

  const [greeting, setGreeting] = useState<Greeting | null>(null);
  const [kompetensi, setKompetensi] = useState<Kompetensi | null>(null);
  const [testimoni, setTestimoni] = useState<Testimoni | null>(null);
  const [ppdbBanner, setPPDBBanner] = useState<PPDBBanner | null>(null);
  const [industri, setIndustri] = useState<Industri | null>(null);

  const [editFields, setEditFields] = useState({
    text: '',
    title: '',
    description: '',
    name: '',
    testimony_text: '',
    company_name: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Normalize URL
  const normalizeURL = (url: string | null): string | undefined => {
    return url ? `https://smkpkp.criwis-sjs.biz.id${url.replace('/home/sinarjer/smkpkp.criwis-sjs.biz.id', '')}` : undefined;
  };

  // Fetch data saat komponen dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [greetingRes, kompetensiRes, testimoniRes, ppdbBannerRes, industriRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/greeting/1`),
          axios.get(`${API_BASE_URL}/kompetensi/1`),
          axios.get(`${API_BASE_URL}/testimoni/1`),
          axios.get(`${API_BASE_URL}/ppdb_banner/1`),
          axios.get(`${API_BASE_URL}/industri/1`),
        ]);

        setGreeting(greetingRes.data);
        setKompetensi(kompetensiRes.data);
        setTestimoni(testimoniRes.data);
        setPPDBBanner(ppdbBannerRes.data);
        setIndustri(industriRes.data);

        // Set default edit fields
        setEditFields({
          text: greetingRes.data.text,
          title: kompetensiRes.data.title,
          description: kompetensiRes.data.description,
          name: testimoniRes.data.name,
          testimony_text: testimoniRes.data.testimony_text,
          company_name: industriRes.data.company_name,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Handle file upload (drag & drop)
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setImageFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'image/*': [] },
  });

  // Update data
  const handleSave = async (endpoint: string, dataKey: string) => {
    try {
      const formData = new FormData();
      Object.entries(editFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.put(`${API_BASE_URL}/${endpoint}/1`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update corresponding state
      if (dataKey === 'greeting') setGreeting(response.data);
      if (dataKey === 'kompetensi') setKompetensi(response.data);
      if (dataKey === 'testimoni') setTestimoni(response.data);
      if (dataKey === 'ppdbBanner') setPPDBBanner(response.data);
      if (dataKey === 'industri') setIndustri(response.data);

      alert('Data successfully updated!');
    } catch (error) {
      console.error(`Error updating ${dataKey}:`, error);
      alert('Failed to update data.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Chat Data Management</h1>

      <div className="space-y-6">
        {/* Greeting Section */}
        {greeting && (
          <div className="panel">
            <h5 className="font-semibold text-lg flex items-center mb-4">
              <IconChatDots className="me-2" /> Edit Greeting
            </h5>
            <div>
              <label className="font-bold">Text</label>
              <input
                type="text"
                value={editFields.text}
                onChange={(e) => setEditFields({ ...editFields, text: e.target.value })}
                className="form-input mt-2 w-full"
              />
            </div>
            <div className="mt-4">
              <label className="font-bold">Image</label>
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
              {(imageFile || greeting.image_url) && (
                <img
                  src={(imageFile ? URL.createObjectURL(imageFile) : normalizeURL(greeting.image_url))}
                  alt="Preview"
                  className="mt-4 max-w-xs rounded-md"
                />
              )}
            </div>
            <button
              onClick={() => handleSave('greeting', 'greeting')}
              className="btn btn-primary mt-4"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Kompetensi Section */}
        {kompetensi && (
          <div className="panel">
            <h5 className="font-semibold text-lg flex items-center mb-4">
              <IconSquareCheck className="me-2" /> Edit Kompetensi
            </h5>
            <div>
              <label className="font-bold">Title</label>
              <input
                type="text"
                value={editFields.title}
                onChange={(e) => setEditFields({ ...editFields, title: e.target.value })}
                className="form-input mt-2 w-full"
              />
            </div>
            <div className="mt-4">
              <label className="font-bold">Description</label>
              <textarea
                value={editFields.description}
                onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                className="form-input mt-2 w-full"
              ></textarea>
            </div>
            <button
              onClick={() => handleSave('kompetensi', 'kompetensi')}
              className="btn btn-primary mt-4"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Testimoni Section */}
        {testimoni && (
          <div className="panel">
            <h5 className="font-semibold text-lg flex items-center mb-4">
              <IconSquareCheck className="me-2" /> Edit Testimoni
            </h5>
            <div>
              <label className="font-bold">Name</label>
              <input
                type="text"
                value={editFields.name}
                onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                className="form-input mt-2 w-full"
              />
            </div>
            <div className="mt-4">
              <label className="font-bold">Testimony Text</label>
              <textarea
                value={editFields.testimony_text}
                onChange={(e) => setEditFields({ ...editFields, testimony_text: e.target.value })}
                className="form-input mt-2 w-full"
              ></textarea>
            </div>
            <button
              onClick={() => handleSave('testimoni', 'testimoni')}
              className="btn btn-primary mt-4"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* PPDB Banner Section */}
        {ppdbBanner && (
          <div className="panel">
            <h5 className="font-semibold text-lg flex items-center mb-4">
              <IconSquareCheck className="me-2" /> Edit PPDB Banner
            </h5>
            <div>
              <label className="font-bold">Description</label>
              <textarea
                value={editFields.description}
                onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                className="form-input mt-2 w-full"
              ></textarea>
            </div>
            <button
              onClick={() => handleSave('ppdb_banner', 'ppdbBanner')}
              className="btn btn-primary mt-4"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Industri Section */}
        {industri && (
          <div className="panel">
            <h5 className="font-semibold text-lg flex items-center mb-4">
              <IconSquareCheck className="me-2" /> Edit Industri
            </h5>
            <div>
              <label className="font-bold">Company Name</label>
              <input
                type="text"
                value={editFields.company_name}
                onChange={(e) => setEditFields({ ...editFields, company_name: e.target.value })}
                className="form-input mt-2 w-full"
              />
            </div>
            <div className="mt-4">
              <label className="font-bold">Logo</label>
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
              {(imageFile || industri.logo_url) && (
                <img
                  src={(imageFile ? URL.createObjectURL(imageFile) : normalizeURL(industri.logo_url))}
                  alt="Preview"
                  className="mt-4 max-w-xs rounded-md"
                />
              )}
            </div>
            <button
              onClick={() => handleSave('industri', 'industri')}
              className="btn btn-primary mt-4"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
