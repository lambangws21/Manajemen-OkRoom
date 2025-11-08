"use client";

import { useState } from "react";
import { StaffMember } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import  {Button}  from "@/components/ui/ui/button";

interface StaffSelectionModalProps {
  staffList: StaffMember[];
  title: string;
  onClose: () => void;
  onSave: (selectedStaff: StaffMember[]) => void;
  initialSelection?: StaffMember[];
  selectionConstraint?: {
    min?: number;
    max?: number;
  };
}

export default function StaffSelectionModal({
  staffList,
  title,
  onClose,
  onSave,
  initialSelection = [],
  selectionConstraint = {},
}: StaffSelectionModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelection.map((s) => s.id))
  );

  const handleSelect = (staffId: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(staffId)) {
      newSelection.delete(staffId);
    } else {
      newSelection.add(staffId);
    }
    setSelectedIds(newSelection);
  };

  const handleSave = () => {
    const selectedStaff = staffList.filter((staff) =>
      selectedIds.has(staff.id)
    );
    onSave(selectedStaff);
  };

  const { min, max } = selectionConstraint;
  const isSelectionValid =
    (min === undefined || selectedIds.size >= min) &&
    (max === undefined || selectedIds.size <= max);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ y: 80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-2xl w-full max-w-lg flex flex-col border border-gray-200 dark:border-gray-700"
        >
          {/* Header */}
          <header className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {title}
            </h2>
            <Button
              onClick={onClose}
              className="bg-transparent hover:bg-transparent p-1 rounded-full"
            >
              <motion.div
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <X
                  size={26}
                  className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
                />
              </motion.div>
            </Button>
          </header>

          {/* Body */}
          <main className="max-h-[60vh] overflow-y-auto px-2 space-y-2">
            {staffList.map((staff) => {
              const isSelected = selectedIds.has(staff.id);
              return (
                <motion.div
                  key={staff.id}
                  onClick={() => handleSelect(staff.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className={`p-1.5 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-100 dark:bg-blue-900/50 border-blue-500 shadow-md"
                      : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <div className="ml-2">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {staff.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {staff.role}
                    </p>
                  </div>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <CheckCircle2 size={24} className="text-blue-600" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </main>

          {/* Footer */}
          <footer className="flex justify-between items-center pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>
                {selectedIds.size} terpilih
                {max !== undefined && ` dari maks. ${max}`}
              </p>
              {!isSelectionValid && min !== undefined && (
                <p className="text-red-500 font-medium">
                  Pilih minimal {min} orang.
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                className="rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Batal
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSave}
                  disabled={!isSelectionValid}
                  className={`rounded shadow-md ${
                    !isSelectionValid
                      ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Simpan Tim
                </Button>
              </motion.div>
            </div>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
