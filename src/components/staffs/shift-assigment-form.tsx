"use client";

import React, { useState } from 'react';
import { Staff } from "@/types/index";
// DIPERBAIKI: Mengubah impor default menjadi NAMED IMPORT { Button } dan { Card }
import  Button  from "@/components/ui/button"; 
import  Card  from "@/components/ui/card"; 
import { Save } from "lucide-react";

type NurseShiftTeams = {
  Pagi: Staff[];
  Siang: Staff[];
  Malam: Staff[];
};

interface ShiftAssignmentFormProps {
  anesthesiaTeam: Staff[];
  nurseTeams: NurseShiftTeams;
  onSave: (data: { anesthesiaTeam: Staff[], nurseTeams: NurseShiftTeams }) => Promise<void>;
  onManageAnesthesia: () => void;
  onManageNurses: (shift: 'Pagi' | 'Siang' | 'Malam') => void;
  isSaving: boolean;
}

export default function ShiftAssignmentForm({
  anesthesiaTeam,
  nurseTeams,
  onSave,
  onManageAnesthesia,
  onManageNurses,
  isSaving,
}: ShiftAssignmentFormProps) {
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null); // State baru untuk pesan error

  const handleSubmit = async () => {
    setError(null);
    
    // DIPERBAIKI: Menggunakan Array.isArray untuk validasi yang lebih kuat
    if (!Array.isArray(anesthesiaTeam) || anesthesiaTeam.length === 0) {
      setError("Tim Dokter Anestesi tidak boleh kosong.");
      return;
    }
    
    try {
      await onSave({ anesthesiaTeam, nurseTeams });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Gagal menyimpan tim:", e);
      setError("Gagal menyimpan tim. Silakan coba lagi.");
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Ringkasan Penugasan Tim
      </h2>
      
      {/* Pesan Error Global */}
      {error && (
        <div 
          className="p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-300" 
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Ringkasan Dokter Anestesi */}
      <div className="border-b pb-4 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          {/* Menggunakan optional chaining untuk menghitung panjang array dengan aman */}
          <h3 className="text-lg font-semibold dark:text-gray-200">
            Dokter Anestesi Jaga ({anesthesiaTeam?.length || 0} Orang)
          </h3>
          <button
            onClick={onManageAnesthesia}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Edit Tim
          </button>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {/* DIPERBAIKI: Menggunakan Array.isArray untuk memastikan variabel tersebut adalah array sebelum memanggil .map() */}
          {Array.isArray(anesthesiaTeam) && anesthesiaTeam.map((staff) => (
            <span key={staff.id} className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded-full">
              {staff.name}
            </span>
          ))}
          {/* DIPERBAIKI: Pengecekan untuk menampilkan pesan jika bukan array atau array kosong */}
          {(!Array.isArray(anesthesiaTeam) || anesthesiaTeam.length === 0) && <p className="text-red-500">Belum ada Dokter Anestesi yang ditugaskan.</p>}
        </div>
      </div>

      {/* Ringkasan Perawat per Shift */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold dark:text-gray-200">
          Perawat Jaga per Shift
        </h3>
        
        {(["Pagi", "Siang", "Malam"] as const).map((shift) => (
          <div key={shift} className="p-3 border rounded-lg dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className={`font-bold ${shift === 'Pagi' ? 'text-green-600' : shift === 'Siang' ? 'text-yellow-600' : 'text-indigo-600'}`}>
                {/* DIPERBAIKI: Tambahkan optional chaining (?) pada nurseTeams dan fallback length 0 */}
                Shift {shift} ({(nurseTeams?.[shift]?.length || 0)} Perawat)
              </span>
              <button
                onClick={() => onManageNurses(shift)}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Atur Perawat
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {/* DIPERBAIKI: Tambahkan optional chaining pada nurseTeams dan sediakan array kosong [] sebagai fallback untuk map */}
              {(nurseTeams?.[shift] || []).map((staff) => (
                <span key={staff.id} className="px-2 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded">
                  {staff.name}
                </span>
              ))}
              {/* DIPERBAIKI: Gunakan optional chaining untuk pengecekan array kosong */}
              {(nurseTeams?.[shift]?.length === 0) && <p className="text-gray-500 text-sm">Shift ini kosong.</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Tombol Simpan Final */}
      <div className="pt-4 border-t dark:border-gray-700">
        <Button
          onClick={handleSubmit}
          // DIPERBAIKI: Menggunakan Array.isArray untuk pengecekan aman pada validasi disabled
          disabled={isSaving || !Array.isArray(anesthesiaTeam) || anesthesiaTeam.length === 0}
          className={`w-full ${saveSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSaving ? (
            "Menyimpan..."
          ) : saveSuccess ? (
            "✅ Berhasil Disimpan!"
          ) : (
            <>
              <Save size={18} className="mr-2" /> Simpan Penugasan Tim Final
            </>
          )}
        </Button>
        <p className="text-center text-sm text-gray-500 mt-2">
          Mengklik Simpan akan memperbarui data jaga aktif di sistem.
        </p>
      </div>
    </Card>
  );
}
