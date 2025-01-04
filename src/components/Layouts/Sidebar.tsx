import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import AnimateHeight from 'react-animate-height';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../store/themeConfigSlice';
import IconMenuDashboard from '../Icon/Menu/IconMenuDashboard';
import IconMenuChat from '../Icon/Menu/IconMenuChat';
import IconMenuNotes from '../Icon/Menu/IconMenuNotes';
import IconMenuWidgets from '../Icon/Menu/IconMenuWidgets';
import IconMenuPages from '../Icon/Menu/IconMenuPages';
import IconMenuUsers from '../Icon/Menu/IconMenuUsers';
import IconCaretDown from '../Icon/IconCaretDown';
import IconMinus from '../Icon/IconMinus';
import IconCaretsDown from '../Icon/IconCaretsDown';
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


const Sidebar = () => {
  const [currentMenu, setCurrentMenu] = useState<string>('');
  const [errorSubMenu, setErrorSubMenu] = useState(false);
  const themeConfig = useSelector((state: any) => state.themeConfig);
  const semidark = useSelector((state: any) => state.themeConfig.semidark);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const toggleMenu = (value: string) => {
    setCurrentMenu((oldValue) => (oldValue === value ? '' : value));
  };

  useEffect(() => {
    const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
    if (selector) {
      selector.classList.add('active');
      const ul: any = selector.closest('ul.sub-menu');
      if (ul) {
        let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
        if (ele.length) {
          ele = ele[0];
          setTimeout(() => {
            ele.click();
          });
        }
      }
    }
  }, []);

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

  return (
    <div className={semidark ? 'dark' : ''}>
      <nav
        className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] z-50 transition-all duration-300 ${
          semidark ? 'text-white-dark' : ''
        }`}
      >
        <div className="bg-white dark:bg-black h-full">
          <div className="flex justify-between items-center px-4 py-3">
            <NavLink to="/dashboard" className="main-logo flex items-center shrink-0">
              <img className="w-32 ml-[5px] flex-none" src="/assets/sipandu.png" alt="logo" />
              
            </NavLink>
          </div>

          <PerfectScrollbar className="h-[calc(100vh-80px)] relative">
            <ul className="relative font-semibold space-y-0.5 p-4 py-0">
              {/* Dashboard */}
              <li className="nav-item">
                <NavLink to="/dashboard" className="nav-link group">
                  <div className="flex items-center">
                    <IconMenuDashboard className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3">{t('Dashboard')}</span>
                  </div>
                </NavLink>
              </li>

              {/* Konten Section */}
              <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
                <IconMinus className="w-4 h-5 flex-none hidden" />
                <span>{t('Konten')}</span>
              </h2>

              {/* Beranda */}
              <li className="menu nav-item">
                <button
                  type="button"
                  className={`${currentMenu === 'master-data' ? 'active' : ''} nav-link group w-full`}
                  onClick={() => toggleMenu('master-data')}
                >
                  <div className="flex items-center">
                    <IconMenuChat className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3">{t('Master Data')}</span>
                  </div>
                  <IconCaretDown />
                </button>
                <AnimateHeight duration={300} height={currentMenu === 'master-data' ? 'auto' : 0}>
                  <ul className="sub-menu text-gray-500">
                    <li><NavLink to="/master-data/karyawan">{t('Data Pegawai')}</NavLink></li>
                    {userData && userData.level == '2' && (
                      <>
                       <li><NavLink to="/master-data/jabatan">{t('Data Jabatan')}</NavLink></li>
                    <li><NavLink to="/master-data/shift">{t('Data Jam Kerja')}</NavLink></li>
                    <li><NavLink to="/master-data/lokasi">{t('Data Lokasi')}</NavLink></li>
                    <li><NavLink to="/master-data/thema-card">{t('Tema ID Card')}</NavLink></li>
                      </>
                   
                    )}
                  </ul>
                </AnimateHeight>
              </li>

              {/* Profil */}
              <li className="menu nav-item">
                <button
                  type="button"
                  className={`${currentMenu === 'patroli' ? 'active' : ''} nav-link group w-full`}
                  onClick={() => toggleMenu('patroli')}
                >
                  <div className="flex items-center">
                    <IconMenuNotes className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3">{t('Patroli')}</span>
                  </div>
                  <IconCaretDown />
                </button>
                <AnimateHeight duration={300} height={currentMenu === 'patroli' ? 'auto' : 0}>
                  <ul className="sub-menu text-gray-500">
                    <li><NavLink to="/patroli/area-patroli">{t('Area Patroli')}</NavLink></li>
                    <li><NavLink to="/patroli/checkpoints">{t('Checkpoints')}</NavLink></li>
                  
                  </ul>
                </AnimateHeight>
              </li>

              {userData && (userData.level == '2' || userData.username.includes('customer_')) && (
                <>
                 {/* Program */}
              <li className="menu nav-item">
                <button
                  type="button"
                  className={`${currentMenu === 'matrix' ? 'active' : ''} nav-link group w-full`}
                  onClick={() => toggleMenu('matrix')}
                >
                  <div className="flex items-center">
                    <IconMenuWidgets className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3">{t('Matrix')}</span>
                  </div>
                  <IconCaretDown />
                </button>
                <AnimateHeight duration={300} height={currentMenu === 'matrix' ? 'auto' : 0}>
                  <ul className="sub-menu text-gray-500">
                    <li><NavLink to="/matrix/matrix">{t('Matrix')}</NavLink></li>
                    <li><NavLink to="/matrix/questions">{t('Questions')}</NavLink></li>
                    <li><NavLink to="/matrix/assessment">{t('Assessment')}</NavLink></li>
                   
                  </ul>
                </AnimateHeight>
              </li>

               {/* MSP */}
               <li className="menu nav-item">
                <button
                  type="button"
                  className={`${currentMenu === 'msp' ? 'active' : ''} nav-link group w-full`}
                  onClick={() => toggleMenu('msp')}
                >
                  <div className="flex items-center">
                    <IconMenuWidgets className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3">{t('Master Security Program')}</span>
                  </div>
                  <IconCaretDown />
                </button>
                <AnimateHeight duration={300} height={currentMenu === 'msp' ? 'auto' : 0}>
                  <ul className="sub-menu text-gray-500">
                    <li><NavLink to="/msp/topic">{t('Topic')}</NavLink></li>
                    {/* <li><NavLink to="/msp/surat">{t('Master Security Program')}</NavLink></li> */}
                    
                  </ul>
                </AnimateHeight>
              </li>


                </>
              )}
            
            
              <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'buku' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('buku')}>
                                    <div className="flex items-center">
                                        <IconMenuPages className="group-hover:!text-primary shrink-0" />
                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('Buku')}</span>
                                    </div>

                                    <div className={currentMenu !== 'buku' ? 'rtl:rotate-90 -rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'buku' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <NavLink to="/buku/jurnal">{t('Jurnal')}</NavLink>
                                        </li>

                                        <li>
                                            <NavLink to="/buku/tamu">{t('Tamu')}</NavLink>
                                        </li>

                                        <li>
                                            <NavLink to="/buku/serahterima">{t('Serah Terima')}</NavLink>
                                        </li>

                                        <li>
                                            <NavLink to="/buku/penemuan">{t('Penemuan Barang')}</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/buku/kendaraan/area">{t('Area Kendaraan')}</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/buku/kendaraan/kendaraan">{t('Kendaraan')}</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/buku/kendaraan/riwayat">{t('Riwayat Kendaraan')}</NavLink>
                                        </li>
                                  </ul>
                                </AnimateHeight>
                            </li>

                            {userData && userData.level == '2' && (
                              <>
                                  <li className="nav-item">
                <NavLink to="/users" className="nav-link group">
                  <div className="flex items-center">
                    <IconMenuDashboard className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3">{t('Admin')}</span>
                  </div>
                </NavLink>
              </li>

              <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
                <IconMinus className="w-4 h-5 flex-none hidden" />
                <span>{t('Pengaturan Web')}</span>
              </h2>

              <li className="nav-item">
                <NavLink to="/pengaturan" className="nav-link group">
                  <div className="flex items-center">
                    <IconMenuDashboard className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3">{t('Pengaturan Web')}</span>
                  </div>
                </NavLink>
              </li>
                              </>
                            )}

            </ul>
          </PerfectScrollbar>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
