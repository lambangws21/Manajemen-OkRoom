'use client';
import { motion } from 'framer-motion';
import React from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-2 p-4"
      >
        <div className="flex justify-between items-center mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
