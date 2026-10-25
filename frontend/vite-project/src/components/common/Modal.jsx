import React, { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  showClose = true,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidth} bg-white dark:bg-[#14151A] border border-slate-200 dark:border-[#C6A15B]/30 rounded-3xl shadow-2xl shadow-black/80 z-10 overflow-hidden transform transition-all max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 dark:border-[#232530] bg-slate-50/80 dark:bg-[#14151A]">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-[#F5F0E6] tracking-wide">{title}</h3>
          {showClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#A5A5AD] hover:text-[#C6A15B] hover:bg-slate-100 dark:hover:bg-[#1A1B23] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
