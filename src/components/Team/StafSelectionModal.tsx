"use client";
import { useState } from "react";
import { StaffMember } from "@/types";
import Button from "@/components/ui/Button";
import { X, CheckCircle2 } from "lucide-react";

interface StaffSelectionModalProps {
  // Daftar staf yang bisa dipilih
  staffList: StaffMember[];
  // Judul yang ditampilkan di modal
  title: string;
  // Fungsi untuk menutup modal
  onClose: () => void;
  // Fungsi yang dijalankan saat menyimpan, mengirimkan array staf yang dipilih
  onSave: (selectedStaff: StaffMember[]) => void;
  // (Opsional) Staf yang sudah terpilih sebelumnya (untuk mode edit)
  initialSelection?: StaffMember[];
  // (Opsional) Aturan validasi untuk jumlah pilihan
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
  // Gunakan 'Set' untuk performa seleksi yang lebih cepat
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelection.map((s) => s.id))
  );

  // Handler untuk memilih atau membatalkan pilihan staf
  const handleSelect = (staffId: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(staffId)) {
      newSelection.delete(staffId);
    } else {
      newSelection.add(staffId);
    }
    setSelectedIds(newSelection);
  };

  // Handler untuk tombol simpan
  const handleSave = () => {
    const selectedStaff = staffList.filter((staff) =>
      selectedIds.has(staff.id)
    );
    onSave(selectedStaff);
  };

  // Validasi tombol simpan berdasarkan aturan
  const { min, max } = selectionConstraint;
  const isSelectionValid =
    (min === undefined || selectedIds.size >= min) &&
    (max === undefined || selectedIds.size <= max);

  return (
    // Backdrop modal
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg flex flex-col animate-fade-in-down"
        // Mencegah modal tertutup saat area di dalam modal diklik
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <header className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-slate-700">{title}</h2>
          <Button
            onClick={onClose}
            className=" bg-transparent hover:bg-transparent border-0 "
          >
            <X
              size={26}
              className="text-slate-500 bg-slate-200 rounded-full hover:bg-red-600 border-0 hover:text-white p-1 shadow-2xl hover:rotate-45 transition-all duration-600"
            />
          </Button>
        </header>

        {/* Body Modal (Daftar Staf) */}
        <main className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              onClick={() => handleSelect(staff.id)}
              className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between transition-all duration-300 ${
                selectedIds.has(staff.id)
                  ? "bg-blue-100 ring-2 ring-blue-500 rotate-1 duration-300"
                  : "bg-gray-50 hover:bg-green-80 hover:text-white hover:ring-2 hover:ring-blue-500 "
              }`}
            >
              <div className="pl-4">
                <p className="font-semibold text-gray-800">{staff.name}</p>
                <p className="text-sm text-gray-700">{staff.role}</p>
              </div>
              {selectedIds.has(staff.id) && (
                <CheckCircle2 size={24} className="text-blue-600 " />
              )}
            </div>
          ))}
        </main>

        {/* Footer Modal */}
        <footer className="flex justify-between items-center pt-6 mt-4 border-t">
          <div className="text-sm text-gray-600">
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
          <div className="flex gap-4">
            <Button variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!isSelectionValid}
            >
              Simpan Tim
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
