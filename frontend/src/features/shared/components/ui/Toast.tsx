"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error";
  message: string;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(message.id), 300); // Allow animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [message.id, onClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(message.id), 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      <div
        className={`rounded-lg shadow-lg border p-4 flex items-start gap-3 ${
          message.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}
      >
        {message.type === "success" ? (
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words overflow-hidden">
            {message.message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className={`flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;