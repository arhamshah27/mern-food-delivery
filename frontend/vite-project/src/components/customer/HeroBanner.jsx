import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Clock, ShieldCheck, Crown } from "lucide-react";

const HeroBanner = ({ banners = [], settings }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) {
    return (
      <div
        className="hero-banner preserve-dark relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#14151A] via-[#1c1813] to-[#14151A] border border-[#C6A15B]/30 p-8 sm:p-14 my-6 shadow-2xl"
        data-preserve-dark="true"
      >
        {/* Warm ambient illumination */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#C6A15B]/20 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#E6D3A3]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#08090D]/80 border border-[#C6A15B]/40 text-[#E6D3A3] text-xs font-semibold uppercase tracking-wider mb-5 backdrop-blur-md">
            <Crown className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Royal Culinary Heritage</span>
          </div>
          <h1 className="hero-title font-serif text-3xl sm:text-5xl lg:text-6xl font-bold !text-white text-[#F5F0E6] tracking-tight leading-[1.15] mb-5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            Handcrafted Curries, <br />
            <span className="gold-text italic font-normal">
              Palace Gastronomy.
            </span>
          </h1>
          <p className="hero-subtitle text-sm sm:text-base !text-white/90 text-[#A5A5AD] mb-8 leading-relaxed font-sans max-w-xl drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
            Immerse yourself in authentic slow-cooked gravies, charcoal-charred kebabs, and royal spiced biryanis delivered with exceptional care.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-[#08090D] bg-gradient-to-r from-[#C6A15B] via-[#E6D3A3] to-[#9F7E3C] shadow-lg shadow-[#C6A15B]/25 hover:brightness-110 transition-all active:scale-95 tracking-wide"
            >
              <span>Explore The Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeBanner = banners[currentIndex];

  return (
    <div
      className="hero-banner preserve-dark relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#14151A] via-[#1a1714] to-[#14151A] border border-[#C6A15B]/30 my-6 shadow-2xl min-h-[380px] sm:min-h-[440px] flex items-center group"
      data-preserve-dark="true"
    >
      {/* Background Image with Rich, Warm Ambiance */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={activeBanner.image}
          alt={activeBanner.title}
          className="w-full h-full object-cover object-center opacity-85 sm:opacity-90 filter brightness-95 contrast-105 group-hover:scale-105 transition-all duration-1000 ease-out"
        />
        {/* Soft, directional darkening only where text sits (left), keeping the right side vibrant and appetizing */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090D]/95 via-[#08090D]/65 sm:via-[#08090D]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090D]/80 via-transparent to-black/20" />

        {/* Warm golden ambient radiance */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#C6A15B]/20 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-[#E6D3A3]/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl px-6 sm:px-12 py-10">
        <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#08090D]/80 border border-[#C6A15B]/40 text-[#E6D3A3] text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md shadow-lg">
          <Crown className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span>Featured Masterpiece</span>
        </div>

        <h1 className="hero-title font-serif text-3xl sm:text-5xl font-bold !text-white text-[#F5F0E6] tracking-tight leading-tight mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          {activeBanner.title}
        </h1>

        {activeBanner.subtitle && (
          <p className="hero-subtitle text-sm sm:text-base !text-white/90 text-[#F5F0E6]/90 mb-8 leading-relaxed max-w-xl font-sans drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] font-normal">
            {activeBanner.subtitle}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Link
            to={activeBanner.buttonLink || "/menu"}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-[#08090D] bg-gradient-to-r from-[#C6A15B] via-[#E6D3A3] to-[#9F7E3C] shadow-xl shadow-[#C6A15B]/30 hover:brightness-110 transition-all active:scale-95 tracking-wide"
          >
            <span>{activeBanner.buttonText || "Order Now"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Value Props Bar */}
        <div className="hero-props mt-8 pt-6 border-t border-[#C6A15B]/20 flex flex-wrap items-center gap-6 text-xs !text-white/90 text-[#F5F0E6]/85 backdrop-blur-[2px]">
          <div className="flex items-center gap-2 drop-shadow-sm">
            <Clock className="w-4 h-4 text-[#C6A15B]" />
            <span className="hero-prop-text">Avg. Delivery 35-45 mins</span>
          </div>
          <div className="flex items-center gap-2 drop-shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#C6A15B]" />
            <span className="hero-prop-text">Safety-Sealed Royal Packaging</span>
          </div>
        </div>
      </div>

      {/* Banner controls (if more than 1) */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 right-6 z-20 flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
            className="p-2 rounded-xl bg-[#08090D]/80 border border-[#C6A15B]/30 text-[#E6D3A3] hover:text-white hover:border-[#C6A15B] backdrop-blur-md transition-all shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 text-[#E6D3A3]" />
          </button>
          <span className="text-xs !text-white text-[#F5F0E6] font-medium px-2 bg-[#08090D]/80 border border-[#C6A15B]/20 py-1 rounded-lg backdrop-blur-sm">
            {currentIndex + 1} / {banners.length}
          </span>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
            className="p-2 rounded-xl bg-[#08090D]/80 border border-[#C6A15B]/30 text-[#E6D3A3] hover:text-white hover:border-[#C6A15B] backdrop-blur-md transition-all shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 text-[#E6D3A3]" />
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
