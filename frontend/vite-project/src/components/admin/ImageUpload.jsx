import React, { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon, AlertCircle } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 5;

const ImageUpload = ({
  currentImageUrl,
  onImageSelected,
  label = "Upload Image",
  helperText = "PNG, JPG, WebP up to 5MB",
  className = "",
}) => {
  const [preview, setPreview] = useState(currentImageUrl || "");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError("");

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, WebP, or GIF)");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image size must be smaller than ${MAX_SIZE_MB}MB`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    if (onImageSelected) {
      onImageSelected(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onImageSelected) {
      onImageSelected(null);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          {label}
        </label>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />

      {preview ? (
        <div className="relative group w-full h-44 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 shadow hover:bg-slate-100 transition-all"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all shadow"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-40 rounded-2xl border-2 border-dashed border-slate-700 hover:border-orange-500 bg-slate-900/60 hover:bg-slate-900 flex flex-col items-center justify-center p-4 cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-200">
            Click to upload or drag & drop
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
