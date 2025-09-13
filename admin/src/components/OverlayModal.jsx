// src/components/OverlayModal.jsx
import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const OverlayModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 border-b pb-3 mb-4">
          {title}
        </h2>

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh]">{children}</div>
      </motion.div>
    </div>
  );
};

export default OverlayModal;
