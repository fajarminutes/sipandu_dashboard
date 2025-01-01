import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "https://sipandu.sinarjernihsuksesindo.biz.id/api/add_vehicle/";
const AREA_API_URL = "https://sipandu.sinarjernihsuksesindo.biz.id/api/areas/";
const VEHICLE_BOOK_API_URL = "https://sipandu.sinarjernihsuksesindo.biz.id/api/vehicle_book/";
const EMPLOYEES_API_URL = "https://sipandu.sinarjernihsuksesindo.biz.id/api/employees/";
const formatDate = (dateString) => {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [areaName, setAreaName] = useState("-");
  const [employees, SetEmployees] = useState("-");
  const [vehicleBook, setVehicleBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVehicleDetails();
  }, []);

  const fetchVehicleDetails = async () => {
    try {
        setIsLoading(true);
        const vehicleResponse = await axios.get(`${API_BASE_URL}${id}`);
        const vehicleData = vehicleResponse.data;

        setVehicle(vehicleData);

        if (vehicleData.id_area) {
            const areaResponse = await axios.get(`${AREA_API_URL}${vehicleData.id_area}`);
            setAreaName(areaResponse.data.area_name);
        }

        if (vehicleData.id_vehicle_book) {
            const bookResponse = await axios.get(`${VEHICLE_BOOK_API_URL}${vehicleData.id_vehicle_book}`);
            console.log("Vehicle Book Response:", bookResponse.data);

            setVehicleBook(bookResponse.data);

            if (bookResponse.data.id) {
                // Fetch employee name using the id from vehicle_book
                const employeeResponse = await axios.get(`${EMPLOYEES_API_URL}${bookResponse.data.id}`);
                SetEmployees(employeeResponse.data.employees_name || "-");
            } else {
                console.warn("No id associated with vehicle_book");
                SetEmployees("-");
            }
        } else {
            console.warn("No id_vehicle_book associated with this vehicle");
        }
    } catch (error) {
        console.error("Error fetching vehicle details:", error);
    } finally {
        // Add 1-second delay before hiding the loader
        setTimeout(() => {
            setIsLoading(false);
        }, 1000); // Delay of 1 second
    }
};





  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader border-t-4 border-blue-600 border-solid rounded-full w-16 h-16 animate-spin"></div>
        <br />
        <p className="ml-4 text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center mt-16">
        <h2 className="text-xl font-bold">Data kendaraan tidak ditemukan.</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-8">
      <h1 className="text-3xl font-bold text-center mb-6">Detail Kendaraan</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-lg font-medium">Nama Area</p>
          <p className="text-gray-700">{areaName}</p>
        </div>
        <div>
          <p className="text-lg font-medium">Tanggal</p>
          <p className="text-gray-700">{formatDate(vehicleBook?.vehicle_book_date || "-")}</p>
        </div>
        <div>
          <p className="text-lg font-medium">Nama Petugas</p>
          <p className="text-gray-700">{employees}</p>
        </div>
        <div>
          <p className="text-lg font-medium">Type Model</p>
          <p className="text-gray-700">{vehicle.model_type}</p>
        </div>
        <div>
          <p className="text-lg font-medium">No. Polisi</p>
          <p className="text-gray-700">{vehicle.nopol}</p>
        </div>
        <div>
          <p className="text-lg font-medium">Jumlah Roda</p>
          <p className="text-gray-700">{vehicle.wheel}</p>
        </div>
        <div>
          <p className="text-lg font-medium">Jumlah Spion</p>
          <p className="text-gray-700">{vehicle.spy}</p>
        </div>
        <div>
          <p className="text-lg font-medium">Jumlah Ban Serap</p>
          <p className="text-gray-700">{vehicle.tire}</p>
        </div>
        <div>
          <p className="text-lg font-medium">Kondisi</p>
          <p className="text-gray-700">{vehicle.condition_vehicle}</p>
        </div>
        <div>
          <p className="text-lg font-medium">Kaca/Pintu</p>
          <p className="text-gray-700">{vehicle.glass_door}</p>
        </div>
        <div className="col-span-2">
          <p className="text-lg font-medium">Keterangan</p>
          <p className="text-gray-700">{vehicle.information}</p>
        </div>
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default VehicleDetail;
