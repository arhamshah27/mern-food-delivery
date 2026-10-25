import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Phone, Mail, MapPin, Clock, ShieldCheck, Sparkles, Award } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axiosInstance.get("/settings");
        if (data.success) setSettings(data.settings);
      } catch {
        // Fallback gracefully
      }
    };
    fetchSettings();
  }, []);

  const restaurantName = settings?.restaurantName || "Baroda Gourmet Kitchen";
  const phone = settings?.phone || "+91 98765 43210";
  const email = settings?.email || "order@barodagourmet.com";
  const address = settings?.address || "14 Alkapuri Main Boulevard, Vadodara, Gujarat 390007";
  const openingHours = `${settings?.openingTime || "10:00 AM"} - ${settings?.closingTime || "11:30 PM"}`;

  return (
    <footer className="bg-[#F3ECE1] dark:bg-[#08090D] border-t border-slate-300 dark:border-[#C6A15B]/15 text-slate-600 dark:text-[#A5A5AD] mt-24 w-full relative transition-colors">
      {/* Decorative top gold hairline glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[#C6A15B]/40 to-transparent" />

      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Info */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4 group inline-flex">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E202A] to-[#121318] border border-[#C6A15B]/40 flex items-center justify-center text-[#E6D3A3] shadow-md shadow-[#C6A15B]/10 group-hover:border-[#C6A15B] transition-colors">
                <UtensilsCrossed className="w-5 h-5 text-[#C6A15B]" />
              </div>
              <span className="font-serif text-xl font-bold text-slate-900 dark:text-[#F5F0E6] tracking-tight">
                {restaurantName}
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-[#A5A5AD] mb-5 leading-relaxed font-sans">
              {settings?.tagline ||
                "Delivering handcrafted delicacies, traditional slow-cooked curries, and modern culinary wonders to your door."}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#8E6E30] dark:text-[#C6A15B] font-semibold bg-[#C6A15B]/15 border border-[#C6A15B]/30 px-3.5 py-1.5 rounded-full w-fit tracking-wide shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] animate-pulse" />
              {settings?.isOpen ? "Royal Kitchen Open & Delivering" : "Currently Closed"}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-slate-900 dark:text-[#F5F0E6] text-base font-semibold tracking-wide mb-4">
              Explore Menu
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/menu" className="hover:text-[#8E6E30] dark:hover:text-[#E6D3A3] transition-colors">
                  All Specialties
                </Link>
              </li>
              <li>
                <Link to="/menu?type=veg" className="hover:text-[#8E6E30] dark:hover:text-[#E6D3A3] transition-colors">
                  Pure Vegetarian Delights
                </Link>
              </li>
              <li>
                <Link to="/menu?type=non-veg" className="hover:text-[#8E6E30] dark:hover:text-[#E6D3A3] transition-colors">
                  Royal Non-Veg Curries
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-[#8E6E30] dark:hover:text-[#E6D3A3] transition-colors">
                  Track Live Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-slate-900 dark:text-[#F5F0E6] text-base font-semibold tracking-wide mb-4">
              Salon & Hours
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#8E6E30] dark:text-[#C6A15B] shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#8E6E30] dark:text-[#C6A15B] shrink-0" />
                <span>{phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#8E6E30] dark:text-[#C6A15B] shrink-0" />
                <span>{email}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#8E6E30] dark:text-[#C6A15B] shrink-0" />
                <span>{openingHours} ({settings?.workingDays || "All Days"})</span>
              </li>
            </ul>
          </div>

          {/* Quality Assurance */}
          <div>
            <h4 className="font-serif text-slate-900 dark:text-[#F5F0E6] text-base font-semibold tracking-wide mb-4">
              Culinary Heritage
            </h4>
            <div className="bg-white dark:bg-[#14151A] border border-slate-300/80 dark:border-[#C6A15B]/20 p-4.5 rounded-2xl text-xs space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2 text-[#8E6E30] dark:text-[#E6D3A3] font-semibold">
                <Award className="w-4 h-4 text-[#8E6E30] dark:text-[#C6A15B]" />
                100% Handcrafted Gourmet
              </div>
              <p className="text-slate-600 dark:text-[#A5A5AD] leading-relaxed">
                Prepared with heritage slow-cooking traditions, pure cold-pressed spices, and temperature-sealed insulated packaging.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-300/70 dark:border-[#232530] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-[#868896] gap-4">
          <p>© {new Date().getFullYear()} {restaurantName}. Handcrafted for refined palates.</p>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#A5A5AD]">
            <span>Excellence in every dish</span>
            <Sparkles className="w-3.5 h-3.5 text-[#8E6E30] dark:text-[#C6A15B]" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
