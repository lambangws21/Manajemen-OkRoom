'use client';

import React from 'react';
// 🔹 Impor tipe data yang relevan
import { StaffMember, NurseShiftTeams } from '@/types';
// Hapus Card dan cn dari import karena didefinisikan secara lokal di sini
// import Card from '@/components/ui/card';
// import { cn } from '@/lib/utils';
import { CheckCircle, Users, User, Sun, Sunset, Moon } from 'lucide-react';

/* ============================
   TIPE DATA LOKAL (Sesuaikan dengan yang diterima dari DashboardPage)
   ============================ */
type ShiftKey = 'Pagi' | 'Siang' | 'Malam';
const SHIFTS: ShiftKey[] = ['Pagi', 'Siang', 'Malam'];

// 🔹 Asumsi: Definisikan ResponsibleStaffByShift agar prop match
type ResponsibleStaffByShift = { [key in ShiftKey]: StaffMember | null; };

const SHIFT_DETAILS: { [key in ShiftKey]: { icon: React.ElementType } } = {
  Pagi: { icon: Sun },
  Siang: { icon: Sunset },
  Malam: { icon: Moon },
};

// 🔹 Interface props BARU (yang menyebabkan prop mismatch sebelumnya)
interface TeamShiftCardsProps {
  shiftName: ShiftKey; // Digunakan untuk menyoroti shift aktif
  anesthesiaTeam?: StaffMember[];
  nurseTeams?: NurseShiftTeams;
  // 💥 PERUBAHAN UTAMA: Menerima map PJ per shift
  responsibleStaffByShift: ResponsibleStaffByShift; 
}

// 🔹 Fungsi dummy Card dan cn (di lingkungan Next.js biasanya diimpor)
// 💥 PERBAIKAN LINT: Mengganti React.FC<React.PropsWithChildren<{}>> menjadi React.FC<React.PropsWithChildren>
const Card: React.FC<React.PropsWithChildren> = ({ children }) => (
    <div className="bg-white dark:bg-slate-800 p-1 rounded shadow-md border border-slate-200 dark:border-slate-700">
        {children}
    </div>
);
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');


/**
 * Komponen helper untuk merender daftar staf
 */
const StaffList = ({ staff, emptyMsg = "Belum diatur" }: { staff?: StaffMember[], emptyMsg?: string }) => {
  if (!staff || staff.length === 0) {
    return <p className="text-sm italic text-gray-500 dark:text-gray-400">{emptyMsg}</p>;
  }
  return (
    // Tambahkan scroll jika daftar terlalu panjang
    <ul className="space-y-1 text-sm max-h-40 overflow-y-auto pr-2">
      {staff.map(doc => (
        <li key={doc.id} className="flex items-center text-slate-600 dark:text-slate-300">
          <User size={14} className="mr-2 text-gray-400 dark:text-slate-500 flex-shrink-0"/>
          {doc.name}
        </li>
      ))}
    </ul>
  );
};

/**
 * Komponen Utama TeamShiftCards
 */
export default function TeamShiftCards({ 
  shiftName, 
  anesthesiaTeam, 
  nurseTeams, 
  responsibleStaffByShift // 🔹 Menggunakan prop yang benar
}: TeamShiftCardsProps) {
  
  // Definisikan shift untuk iterasi
  const shifts = [
    { name: 'Pagi', team: nurseTeams?.Pagi, icon: Sun },
    { name: 'Siang', team: nurseTeams?.Siang, icon: Sunset },
    { name: 'Malam', team: nurseTeams?.Malam, icon: Moon },
  ] as { name: ShiftKey, team: StaffMember[] | undefined, icon: React.ElementType }[];


  return (
    // 💥 PERUBAHAN: Tambahkan scroll ke container utama
    <div className="flex flex-col gap-2 w-full max-w-lg max-h-[75vh] overflow-y-auto pr-2">
      
      {/* Card 1: Penanggung Jawab OK (Daftar per Shift) */}
      <Card>
        <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-1 flex items-center">
          <CheckCircle className="mr-2" size={20} />
          Penanggung Jawab OK Harian
        </h3>
        
        <div className="space-y-2">
          {SHIFTS.map((shiftKey) => {
            const pjStaff = responsibleStaffByShift[shiftKey];
            const ShiftIcon = SHIFT_DETAILS[shiftKey].icon;
            const isCurrentShift = shiftKey === shiftName; // Highlight shift aktif

            return (
              <div 
                key={shiftKey} 
                className={cn(
                  "p-2 rounded-lg border transition-all",
                  isCurrentShift 
                    ? 'bg-yellow-100 dark:bg-yellow-800/70 border-yellow-500 shadow-md' 
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                )}
              >
                
                <h4 className={cn(
                  "font-bold text-sm mb-1 flex items-center",
                  isCurrentShift ? 'text-yellow-800 dark:text-yellow-200' : 'text-slate-700 dark:text-slate-300'
                )}>
                  <ShiftIcon size={14} className="mr-2" />
                  Shift {shiftKey} 
                  {isCurrentShift && <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-600 text-white">Aktif</span>}
                </h4>
                
                {pjStaff ? (
                  <div className="flex items-center text-xs text-yellow-700 dark:text-yellow-300 pl-4">
                      <User size={12} className="mr-2 flex-shrink-0 text-yellow-600 dark:text-yellow-300" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{pjStaff.name}</span>
                      <span className="ml-1 text-slate-500 dark:text-slate-400">({pjStaff.role})</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic pl-4">Belum ditetapkan.</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Card 2: Dokter Anestesi */}
      <Card>
        <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-2 mb-3 flex items-center">
          <Users className="mr-2" size={20} />
          Dokter Anestesi
        </h3>
        <StaffList staff={anesthesiaTeam} />
      </Card>
      
      {/* Card 3: Tim Perawat (Menggunakan sub-section) */}
      <Card>
          <h3 className="text-lg font-bold text-green-700 dark:text-green-400 border-b border-gray-200 dark:border-gray-700 pb-2 mb-3 flex items-center">
          <Users className="mr-2" size={20} />
          Tim Perawat
        </h3>
        <div className="space-y-4">
          {shifts.map(shift => {
            const isActive = shift.name === shiftName; 
            return (
              <div 
                key={shift.name} 
                className={cn(
                  "p-3 rounded border transition-all",
                  isActive 
                    ? "bg-green-50 dark:bg-green-900/50 border-green-400" 
                    : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                )}
              >
                <h4 className={cn(
                  "font-semibold mb-2 flex items-center text-sm",
                  isActive ? "text-green-800 dark:text-green-200" : "text-gray-700 dark:text-gray-300"
                )}>
                  <shift.icon size={16} className="mr-2" />
                  Shift {shift.name}
                </h4>
                <StaffList staff={shift.team} emptyMsg="Shift kosong" />
              </div>
            );
          })}
        </div>
      </Card>

    </div>
  );
}
