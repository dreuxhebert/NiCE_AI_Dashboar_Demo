"use client";
import { motion } from "framer-motion";

interface ProcessingModalProps {
  open: boolean;
  message?: string;
}

export default function ProcessingModal({ open, message }: ProcessingModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 w-80"
      >
        {/* Waveform animation */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={{ height: ["10px", "28px", "12px"] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
              className="w-2 rounded bg-blue-500"
            />
          ))}
        </div>

        <p className="text-gray-700 text-center font-medium">
          {message || "Processing audio..."}
        </p>
      </motion.div>
    </div>
  );
}
