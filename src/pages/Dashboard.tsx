import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number; // Expiry time (in seconds since Unix Epoch)
  sub: {
    user_id: string;
    unix_id: string;
    username: string;
    email: string;
    level: string;
  };
}

const Spinner = () => (
  <div className="text-center">
    <div className="loader border-t-4 border-blue-600 border-solid rounded-full w-10 h-10 mx-auto animate-spin"></div>
  </div>
);

const Dashboard = () => {
  const [userData, setUserData] = useState<DecodedToken['sub'] | null>(null);
    useEffect(() => {
      const token = localStorage.getItem("access_token");
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setUserData(decoded.sub);
      } catch (err) {
        console.error("Token tidak valid:", err);
      }
    }, []);

  const [dataCounts, setDataCounts] = useState({
    employees: 0,
    employees_customer: 0,
    positions: 0,
    customers: 0,
    shifts: 0,
    surats: 0,
    patrolis: 0,
    checkpoints: 0,
    urgent: 0,

  });
  const [loading, setLoading] = useState(true); // New loading state
  const [loadingTime, setLoadingTime] = useState(0); // State to hold loading time
  const customer_id = userData ? userData.level : null;
  useEffect(() => {
    const fetchData = async () => {
        const startTime = Date.now(); // Capture the start time
        try {
           
            const responses = await Promise.allSettled([
                axios.get("https://sipandu.sinarjernihsuksesindo.biz.id/api/employees"),
                axios.get("https://sipandu.sinarjernihsuksesindo.biz.id/api/positions"),
                axios.get("https://sipandu.sinarjernihsuksesindo.biz.id/api/customers"),
                axios.get("https://sipandu.sinarjernihsuksesindo.biz.id/api/shifts"),
                axios.get("https://sipandu.sinarjernihsuksesindo.biz.id/api/msp"),
                axios.get("https://sipandu.sinarjernihsuksesindo.biz.id/api/patrol_logs"),
                axios.get(`https://sipandu.sinarjernihsuksesindo.biz.id/api/employees/customer/${customer_id}`),
                axios.get(`https://sipandu.sinarjernihsuksesindo.biz.id/api/checkpoints/${customer_id}`),
                axios.get("https://sipandu.sinarjernihsuksesindo.biz.id/api/urgent"),
                // axios.get("https://sipandu.sinarjernihsuksesindo.biz.id/api/guest_book/${customer_id}"),

            ]);

            setDataCounts({
                employees: responses[0].status === "fulfilled" ? responses[0].value.data.length : 0,
                positions: responses[1].status === "fulfilled" ? responses[1].value.data.length : 0,
                customers: responses[2].status === "fulfilled" ? responses[2].value.data.length : 0,
                shifts: responses[3].status === "fulfilled" ? responses[3].value.data.length : 0,
                surats: responses[4].status === "fulfilled" ? responses[4].value.data.length : 0,
                patrolis: responses[5].status === "fulfilled" ? responses[5].value.data.length : 0,
                employees_customer: responses[6].status === "fulfilled" ? responses[6].value.data.length : 0,
                checkpoints: responses[7].status === "fulfilled" ? responses[7].value.data.length : 0,
                urgent: responses[8].status === "fulfilled" ? responses[8].value.data.length : 0,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            const endTime = Date.now(); // Capture the end time
            setLoadingTime((endTime - startTime) / 1000); // Calculate loading time in seconds
            setLoading(false); // Set loading to false after data is fetched
        }
    };

    if (userData) {
        fetchData();
    }
}, [userData]); // Tambahkan `userData` sebagai dependency


  return (
   <>
    {userData && userData.level == '2' && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold">{loading ? <Spinner /> : dataCounts.employees}</h1>
        <p className="text-lg mt-2">Anggota</p>
        <a
          href="/master-data/karyawan"
          className="inline-block mt-4 text-blue-200 hover:text-white"
        >
          More info &rarr;
        </a>
      </div>
      <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold">{loading ? <Spinner /> : dataCounts.positions}</h1>
        <p className="text-lg mt-2">Jabatan</p>
        <a
          href="/master-data/jabatan"
          className="inline-block mt-4 text-yellow-200 hover:text-white"
        >
          More info &rarr;
        </a>
      </div>
      <div className="bg-red-500 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold">{loading ? <Spinner /> : dataCounts.customers}</h1>
        <p className="text-lg mt-2">Lokasi Kantor</p>
        <a
          href="/master-data/lokasi"
          className="inline-block mt-4 text-red-200 hover:text-white"
        >
          More info &rarr;
        </a>
      </div>
      <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold">{loading ? <Spinner /> : dataCounts.shifts}</h1>
        <p className="text-lg mt-2">Jam Kerja</p>
        <a
          href="/master-data/shift"
          className="inline-block mt-4 text-green-200 hover:text-white"
        >
          More info &rarr;
        </a>
      </div>
      <div className="bg-orange-500 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold">{loading ? <Spinner /> : dataCounts.surats}</h1>
        <p className="text-lg mt-2">Surat Edaran</p>
        <a
          href="/msp/msp"
          className="inline-block mt-4 text-green-200 hover:text-white"
        >
          More info &rarr;
        </a>
      </div>

      <div className="bg-orange-500 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold">{loading ? <Spinner /> : dataCounts.patrolis}</h1>
        <p className="text-lg mt-2">Patroli</p>
        <a
          href="/msp/msp"
          className="inline-block mt-4 text-green-200 hover:text-white"
        >
          More info &rarr;
        </a>
      </div>

      {/* Display loading time */}
      {/* {!loading && (
        <div className="col-span-1 sm:col-span-2 lg:col-span-4 p-6">
          <p className="text-lg text-center">Data loaded in {loadingTime.toFixed(2)} seconds.</p>
        </div>
      )} */}
    </div>
      )}
       {userData && userData.level != '2' && (
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
<div className="bg-orange-500 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold">{loading ? <Spinner /> : dataCounts.employees_customer}</h1>
        <p className="text-lg mt-2">Anggota</p>
        <a
          href="/master-data/karyawan"
          className="inline-block mt-4 text-green-200 hover:text-white"
        >
          More info &rarr;
        </a>
      </div>

      <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold">{loading ? <Spinner /> : dataCounts.checkpoints}</h1>
        <p className="text-lg mt-2">Checkpoints</p>
        <a
          href=""
          className="inline-block mt-4 text-green-200 hover:text-white"
        >
          More info &rarr;
        </a>
      </div>

      <div className="bg-red-500 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold">{loading ? <Spinner /> : dataCounts.urgent}</h1>
        <p className="text-lg mt-2">Patroli Urgent</p>
        <a
          href=""
          className="inline-block mt-4 text-green-200 hover:text-white"
        >
          More info &rarr;
        </a>
      </div>

      </div>
       )}
   </>
  );
};

export default Dashboard;
