import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#08090D] text-slate-900 dark:text-[#F5F0E6] w-full overflow-x-hidden transition-colors">
      <Navbar />
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
