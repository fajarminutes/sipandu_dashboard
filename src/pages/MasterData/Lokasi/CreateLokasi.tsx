import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = "https://sipandu.sinarjernihsuksesindo.biz.id/api/customers/";

const generateCode = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${year}/${randomChars}/${year}-${month}-${day}`;
};

const Create: React.FC = () => {
  const navigate = useNavigate();
  const [formFields, setFormFields] = useState({
    address: "",
    code: generateCode(),
    latitude: "-6.1537",
    longitude: "106.7425",
    name: "",
    radius: 0,
  });

  const mapRef = useRef<H.Map | null>(null);
  const markerRef = useRef<H.map.Marker | null>(null);

  useEffect(() => {
    const platform = new H.service.Platform({
      apikey: "gjkQ9ztotcPm2sjUicZBGFOLhcdchU_BtYPFy0UJMZE",
    });

    const defaultLayers = platform.createDefaultLayers();

    const map = new H.Map(
      document.getElementById("map") as HTMLElement,
      defaultLayers.vector.normal.map,
      {
        center: { lat: parseFloat(formFields.latitude), lng: parseFloat(formFields.longitude) },
        zoom: 15,
        pixelRatio: window.devicePixelRatio || 1,
      }
    );

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    const ui = H.ui.UI.createDefault(map, defaultLayers);

    const marker = new H.map.Marker(
      { lat: parseFloat(formFields.latitude), lng: parseFloat(formFields.longitude) },
      { volatility: true }
    );

    map.addObject(marker);
    mapRef.current = map;
    markerRef.current = marker;

    map.addEventListener("tap", (evt) => {
      const coord = map.screenToGeo(
        evt.currentPointer.viewportX,
        evt.currentPointer.viewportY
      );

      marker.setGeometry(coord);
      setFormFields((prev) => ({
        ...prev,
        latitude: coord.lat.toFixed(6),
        longitude: coord.lng.toFixed(6),
      }));
    });

    return () => {
      map.dispose();
    };
  }, []);

  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      const newCoord = {
        lat: parseFloat(formFields.latitude),
        lng: parseFloat(formFields.longitude),
      };
      markerRef.current.setGeometry(newCoord);
      mapRef.current.setCenter(newCoord);
    }
  }, [formFields.latitude, formFields.longitude]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormFields((prev) => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
          }));
          Swal.fire("Berhasil!", "Lokasi Anda berhasil diambil!", "success");
        },
        (error) => {
          console.error("Error getting location:", error);
          Swal.fire("Error!", "Gagal mengambil lokasi Anda.", "error");
        }
      );
    } else {
      Swal.fire("Error!", "Browser Anda tidak mendukung Geolocation.", "error");
    }
  };

  const validateForm = () => {
    const { address, name, latitude, longitude, radius } = formFields;
    if (!address || !name || !latitude || !longitude || radius <= 0) {
      Swal.fire("Error!", "Semua kolom harus diisi!", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const locationData = {
      address: formFields.address,
      code: formFields.code,
      latitude_longtitude: `${formFields.latitude},${formFields.longitude}`,
      name: formFields.name,
      radius: formFields.radius,
    };

    try {
      await axios.post(API_BASE_URL, locationData);
      Swal.fire("Berhasil!", "Data lokasi berhasil disimpan!", "success");
      navigate("/master-data/lokasi");
    } catch (error) {
      console.error("Error saving location:", error);
      Swal.fire("Error!", "Gagal menyimpan data lokasi.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Tambah Lokasi</h1>
      <form className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Nama Lokasi</label>
          <input
            type="text"
            value={formFields.name}
            onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Masukkan nama lokasi"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Alamat Lokasi</label>
          <textarea
            value={formFields.address}
            onChange={(e) => setFormFields({ ...formFields, address: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Masukkan alamat lokasi"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Pilih Lokasi (HERE Maps)</label>
          <div id="map" style={{ height: "400px", borderRadius: "10px" }}></div>
        </div>
        <div>
          <button
            type="button"
            onClick={handleGetLocation}
            className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 mb-4"
          >
            Ambil Lokasi Saya
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Latitude</label>
            <input
              type="text"
              value={formFields.latitude}
              onChange={(e) => setFormFields({ ...formFields, latitude: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Masukkan latitude"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Longitude</label>
            <input
              type="text"
              value={formFields.longitude}
              onChange={(e) => setFormFields({ ...formFields, longitude: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Masukkan longitude"
            />
          </div>
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Radius</label>
          <input
            type="number"
            value={formFields.radius}
            onChange={(e) => setFormFields({ ...formFields, radius: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Masukkan radius"
          />
        </div>
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleSave}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => navigate("/master-data/lokasi")}
            className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700"
          >
            Kembali
          </button>
        </div>
      </form>
    </div>
  );
};

export default Create;
