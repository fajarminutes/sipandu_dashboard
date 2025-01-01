// IndexPage.js
import React from 'react';

const IndexPage = () => {
  return (
    <div className="font-sans bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <a href="index.php" className="flex items-center">
            <img
              src="https://sipandu3.sinarjernihsuksesindo.id/sw-content/header11pngpng.png"
              alt="NESIPANDU Logo"
              className="h-12 w-auto"
            />
          </a>
          <nav className="flex space-x-6">
            <a href="#banner" className="text-lg">Home</a>
            <a href="#features" className="text-lg">Features</a>
            <a href="#how-it-works" className="text-lg">How It Works</a>
          </nav>
          <div className="ml-4">
            <a href="/auth/login" className="bg-blue-600 text-white px-4 py-2 rounded">Sign In</a>
          </div>
        </div>
      </header>

      {/* Banner Section */}
      <section id="banner" className="bg-blue-50 py-16">
        <div className="container mx-auto flex items-center space-x-12">
          <div className="w-1/2">
            <h3 className="text-4xl font-semibold">Awesome App for Your Security Management</h3>
            <p className="mt-4 text-lg">Security management platform that simplifies daily operations through digitalization and process automation.</p>
            <div className="mt-8 space-x-4">
              <a href="https://nesipandu.com/download/NESIPANDU.apk" className="bg-blue-600 text-white px-6 py-3 rounded">Download App</a>
              <a href="#how-it-works" className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded">Discover more</a>
            </div>
          </div>
          <div className="w-1/2">
            <img src="img/slider-moc-2.png" alt="App Mockup" className="w-full" />
          </div>
        </div>
      </section>

      {/* Fun Fact Section */}
      <div className="bg-gray-200 py-16">
        <div className="container mx-auto flex justify-between">
          <div className="text-center">
            <p className="text-2xl font-semibold"><span className="text-blue-600">500</span> Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold"><span className="text-blue-600">500</span> Downloads</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold"><span className="text-blue-600">14</span> Features</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-semibold">Integrated Security Information System (NESIPANDU)</h2>
          <p className="mt-4 text-lg">Providing a complete solution in the management of security and facility protection.</p>
        </div>
        <div className="container mx-auto grid grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <i className="fas fa-user-check text-4xl text-blue-600"></i>
            <h3 className="text-2xl mt-4">Attendance Management</h3>
            <p>Managing attendance records for all security personnel.</p>
          </div>
          <div className="text-center">
            <i className="fas fa-walking text-4xl text-blue-600"></i>
            <h3 className="text-2xl mt-4">Security Patrol</h3>
            <p>Coordinating and monitoring security patrols.</p>
          </div>
          <div className="text-center">
            <i className="fas fa-calendar-alt text-4xl text-blue-600"></i>
            <h3 className="text-2xl mt-4">Shift Management</h3>
            <p>Efficiently manage shift schedules for security personnel.</p>
          </div>
          <div className="text-center">
            <i className="fas fa-bell text-4xl text-blue-600"></i>
            <h3 className="text-2xl mt-4">SOS Response</h3>
            <p>Quick and effective emergency response system.</p>
          </div>
          <div className="text-center">
            <i className="fas fa-user-shield text-4xl text-blue-600"></i>
            <h3 className="text-2xl mt-4">Personnel Management</h3>
            <p>A comprehensive database for profiles, assessments, and management of security personnel.</p>
          </div>
          <div className="text-center">
            <i className="fas fa-truck text-4xl text-blue-600"></i>
            <h3 className="text-2xl mt-4">Logistics Management</h3>
            <p>Recording and managing vehicle logs, guest books, and item transfers.</p>
          </div>
          <div className="text-center">
            <i className="fas fa-database text-4xl text-blue-600"></i>
            <h3 className="text-2xl mt-4">Master Data</h3>
            <p>Efficiently manage location data, user roles, and organizational structures.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-50 py-16">
        <div className="container mx-auto flex">
          <div className="w-1/2">
            <h3 className="text-3xl font-semibold">How does this App Work?</h3>
            <div className="mt-6">
              <div className="flex items-center">
                <i className="flaticon-login text-3xl text-blue-600"></i>
                <div className="ml-4">
                  <h4 className="text-xl">Login App</h4>
                  <p>Access the app securely with your credentials.</p>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <i className="flaticon-attendance text-3xl text-blue-600"></i>
                <div className="ml-4">
                  <h4 className="text-xl">Attendance</h4>
                  <p>Mark your attendance quickly and easily.</p>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <i className="flaticon-security-patrol text-3xl text-blue-600"></i>
                <div className="ml-4">
                  <h4 className="text-xl">Do Patrol</h4>
                  <p>Carry out patrols efficiently and ensure safety.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-1/2 flex justify-center items-center">
            <img src="img/circle.png" alt="App Screenshot" className="w-1/2" />
          </div>
        </div>
      </section>

      {/* App Screenshots Section */}
      <section className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-semibold">App ScreenShots</h2>
          <p className="mt-4 text-lg">Explore the key features of the Integrated Security Information System (NESIPANDU) through these screenshots. See how our solution simplifies security management and facility protection.</p>
        </div>
        <div className="container mx-auto mt-12 grid grid-cols-3 gap-8">
          <img src="img/slider-01.png" alt="App Screenshot" className="w-full" />
          <img src="img/slider-02.png" alt="App Screenshot" className="w-full" />
          <img src="img/slider-03.png" alt="App Screenshot" className="w-full" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 shadow-lg">
        <div className="container mx-auto text-center">
          <p>© 2024, SIPANDU by PT. NUSA ELANG SATRIA | <a href="https://nesipandu.com/privacy/" className="text-blue-600">Privacy Policy</a></p>
        </div>
      </footer>
    </div>
  );
};

export default IndexPage;
