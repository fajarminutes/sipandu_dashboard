import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '../pages/Auth/ProtectedRoute';
import PublicRoute from '../pages/Auth/PublicRoute';
import LoginPage from '../pages/Auth/Login';
import Error404 from '../pages/Auth/404';

import Coba from '../pages/Coba';

import BannerPage from '../pages/MasterData/Banner';
import ShiftPage from '../pages/MasterData/Shift';

import LokasiPage from '../pages/MasterData/Lokasi/Lokasi';
import LokasiCreatePage from '../pages/MasterData/Lokasi/CreateLokasi';
import LokasiEditPage from '../pages/MasterData/Lokasi/UpdateLokasi';

import JabatanPage from '../pages/MasterData/Jabatan';
import PegawaiPage from '../pages/MasterData/Employees/Employees';
import PegawaiCreatePage from '../pages/MasterData/Employees/CreateEmployees';
import PegawaiUpdatePage from '../pages/MasterData/Employees/UpdateEmployees';
import PegawaiErrorImportPage from '../pages/MasterData/Employees/ErrorImport';
import ThemaPage from '../pages/MasterData/ThemaCard';


import AreaPatroliPage from '../pages/Patroli/AreaPatroli';
import CheckpointsPage from '../pages/Patroli/Checkpoints/Checkpoints';
import CheckpointsCreatePage from '../pages/Patroli/Checkpoints/CreateCheckpoints';
import CheckpointsUpdatePage from '../pages/Patroli/Checkpoints/UpdateCheckpoints';

import MatrixPage from '../pages/Matrix/Matrix';
import QuestionsPage from '../pages/Matrix/Questions';
import QuestionsCreatePage from '../pages/Matrix/Questions/CreateQuestions';
import QuestionsUpdatePage from '../pages/Matrix/Questions/UpdateQuestions';
import AssessmentPage from '../pages/Matrix/Assessment/Assessment';
import AssessmentCreatePage from '../pages/Matrix/Assessment/CreateAssessment';
import ResultsAssessments from '../pages/Matrix/Assessment/Results';

import TopicPage from '../pages/Msp/Topic';

import AreaPage from '../pages/Buku/Kendaraan/AreaKendaraan';
import KendaraanPage from '../pages/Buku/Kendaraan/Kendaraan';
import KendaraanCreatePage from '../pages/Buku/Kendaraan/CreateKendaraan';
import KendaraanUpdatePage from '../pages/Buku/Kendaraan/UpdateKendaraan';

import RiwayatPage from '../pages/Buku/Kendaraan/Riwayat';
import RiwayatViewPage from '../pages/Buku/Kendaraan/ViewRiwayat';


import JournalPage from '../pages/Buku/Jurnal/Jurnal';
import JournalCreatePage from '../pages/Buku/Jurnal/CreateJurnal';
import JournalUpdatePage from '../pages/Buku/Jurnal/UpdateJurnal';

import GuestPage from '../pages/Buku/Tamu/Tamu';
import GuestCreatePage from '../pages/Buku/Tamu/CreateTamu';
import GuestUpdatePage from '../pages/Buku/Tamu/UpdateTamu';

import HandoverPage from '../pages/Buku/SerahTerima/Serah';
import HandoverCreatePage from '../pages/Buku/SerahTerima/CreateSerah';
import HandoverUpdatePage from '../pages/Buku/SerahTerima/UpdateSerah';

import PenemuanPage from '../pages/Buku/Penemuan/Penemuan';
import PenemuanCreatePage from '../pages/Buku/Penemuan/CreatePenemuan';
import PenemuanUpdatePage from '../pages/Buku/Penemuan/UpdatePenemuan';


import IndexPage from '../pages/Index';

const Index = lazy(() => import('../pages/Dashboard'));

import Users from '../pages/User/User';
import UsersCreatePage from '../pages/User/CreateUser';
import UsersUpdatePage from '../pages/User/UpdateUser';

import Pengaturan from '../pages/Pengaturan/Pengaturan';



const routes = [
    // Halaman login (akses tanpa login)
    {
        path: '/auth/login',
        element: (
            <PublicRoute>
                <LoginPage />
            </PublicRoute>
        ),
        layout: 'blank',
    },

    {
        path: '/',
        element: (
        
                <IndexPage />
        ),
        layout: 'blank',
    },


    {
        path: '/pengaturan',
        element: (
            <ProtectedRoute>
                <Pengaturan />
            </ProtectedRoute>
        ),
    },

    {
        path: '/matrix/assessment',
        element: (
            <ProtectedRoute>
                <AssessmentPage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/matrix/assessment/create/:id_test',
        element: (
            <ProtectedRoute>
                <AssessmentCreatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/matrix/assessment/results/:id_test',
        element: (
            <ProtectedRoute>
                <ResultsAssessments />
            </ProtectedRoute>
        ),
    },


    {
        path: '/users',
        element: (
            <ProtectedRoute>
                <Users />
            </ProtectedRoute>
        ),
    },
    {
        path: '/users/create',
        element: (
            <ProtectedRoute>
                <UsersCreatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/users/edit/:userId',
        element: (
            <ProtectedRoute>
                <UsersUpdatePage />
            </ProtectedRoute>
        ),
    },


    {
        path: '/coba',
        element: (
            <ProtectedRoute>
                <Coba />
            </ProtectedRoute>
        ),
    },

    // Dashboard utama (akses dengan login)
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                <Index />
            </ProtectedRoute>
        ),
    },
    // Rute master data (akses dengan login)
    {
        path: '/master-data/banner',
        element: (
            <ProtectedRoute>
                <BannerPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/master-data/shift',
        element: (
            <ProtectedRoute>
                <ShiftPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/master-data/lokasi',
        element: (
            <ProtectedRoute>
                <LokasiPage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/master-data/lokasi/create',
        element: (
            <ProtectedRoute>
                <LokasiCreatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/master-data/lokasi/edit/:id',
        element: (
            <ProtectedRoute>
                <LokasiEditPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/master-data/jabatan',
        element: (
            <ProtectedRoute>
                <JabatanPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/master-data/karyawan',
        element: (
            <ProtectedRoute>
                <PegawaiPage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/master-data/karyawan/create',
        element: (
            <ProtectedRoute>
                <PegawaiCreatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/master-data/karyawan/error-import',
        element: (
            <ProtectedRoute>
                <PegawaiErrorImportPage />
            </ProtectedRoute>
        ),
    },


    {
        path: '/master-data/karyawan/edit/:id',
        element: (
            <ProtectedRoute>
                <PegawaiUpdatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/master-data/thema-card',
        element: (
            <ProtectedRoute>
                <ThemaPage />
            </ProtectedRoute>
        ),
    },

    // Patroli
    {
        path: '/patroli/area-patroli',
        element: (
            <ProtectedRoute>
                <AreaPatroliPage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/patroli/checkpoints',
        element: (
            <ProtectedRoute>
                <CheckpointsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/patroli/checkpoints/create',
        element: (
            <ProtectedRoute>
                <CheckpointsCreatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/patroli/checkpoints/edit/:id',
        element: (
            <ProtectedRoute>
                <CheckpointsUpdatePage />
            </ProtectedRoute>
        ),
    },

    // Matrix
    {
        path: '/matrix/matrix',
        element: (
            <ProtectedRoute>
                <MatrixPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/matrix/questions',
        element: (
            <ProtectedRoute>
                <QuestionsPage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/matrix/questions/create',
        element: (
            <ProtectedRoute>
                <QuestionsCreatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/matrix/questions/edit/:id',
        element: (
            <ProtectedRoute>
                <QuestionsUpdatePage />
            </ProtectedRoute>
        ),
    },

    // MSP
    {
        path: '/msp/topic',
        element: (
            <ProtectedRoute>
                <TopicPage />
            </ProtectedRoute>
        ),
    },

    // Buku

    {
        path: '/buku/kendaraan/area',
        element: (
            <ProtectedRoute>
                <AreaPage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/kendaraan/kendaraan',
        element: (
            <ProtectedRoute>
                <KendaraanPage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/kendaraan/kendaraan/create',
        element: (
            <ProtectedRoute>
                <KendaraanCreatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/kendaraan/kendaraan/edit/:id',
        element: (
            <ProtectedRoute>
                <KendaraanUpdatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/kendaraan/riwayat',
        element: (
            <ProtectedRoute>
                <RiwayatPage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/kendaraan/riyawat/view/:id',
        element: (
            <ProtectedRoute>
                <RiwayatViewPage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/jurnal',
        element: (
            <ProtectedRoute>
                <JournalPage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/jurnal/create',
        element: (
            <ProtectedRoute>
                <JournalCreatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/jurnal/edit/:id',
        element: (
            <ProtectedRoute>
                <JournalUpdatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/tamu',
        element: (
            <ProtectedRoute>
                <GuestPage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/tamu/create',
        element: (
            <ProtectedRoute>
                <GuestCreatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/tamu/edit/:id_guest',
        element: (
            <ProtectedRoute>
                <GuestUpdatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/penemuan',
        element: (
            <ProtectedRoute>
                <PenemuanPage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/penemuan/create',
        element: (
            <ProtectedRoute>
                <PenemuanCreatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/penemuan/edit/:id',
        element: (
            <ProtectedRoute>
                <PenemuanUpdatePage />
            </ProtectedRoute>
        ),
    },


    {
        path: '/buku/serahterima',
        element: (
            <ProtectedRoute>
                <HandoverPage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/serahterima/create',
        element: (
            <ProtectedRoute>
                <HandoverCreatePage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/buku/serahterima/edit/:id_handover',
        element: (
            <ProtectedRoute>
                <HandoverUpdatePage />
            </ProtectedRoute>
        ),
    },

    // Rute fallback (halaman tidak ditemukan)
    {
        path: '*',
        element: <Navigate to="/404" />,
    },
    {
        path: '/404',
        element: (
                <Error404 />
        ),
        layout: 'blank',
    },
];

export { routes };
