import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Main Glass Container */}
      <div className="card-ludus w-full max-w-[1400px] min-h-[85vh] flex flex-col relative z-10">
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;