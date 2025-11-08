'use client';

// 🔹 Impor tipe data yang relevan (termasuk NurseShiftTeams)
import { StaffMember, NurseShiftTeams } from '@/types';
import Card from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle, Users, User, Sun, Sunset, Moon } from 'lucide-react';

// 🔹 Interface props baru, disesuaikan dengan DashboardPage
interface TeamShiftCardsProps {
  shiftName: 'Pagi' | 'Siang' | 'Malam'; // Digunakan untuk menyoroti shift aktif
  anesthesiaTeam?: StaffMember[];
  nurseTeams?: NurseShiftTeams;
  responsibleStaff?: StaffMember;
}

/**
 * Komponen helper untuk merender daftar staf
 */
const StaffList = ({ staff, emptyMsg = "Belum diatur" }: { staff?: StaffMember[], emptyMsg?: string }) => {
  if (!staff || staff.length === 0) {
    return <p className="text-sm italic text-gray-500">{emptyMsg}</p>;
  }
  return (
    // Tambahkan scroll jika daftar terlalu panjang
    <ul className="space-y-1 text-sm max-h-40 overflow-y-auto pr-2">
      {staff.map(doc => (
        <li key={doc.id} className="flex items-center text-slate-600">
          <User size={14} className="mr-2 text-gray-400 flex-shrink-0"/>
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
  responsibleStaff 
}: TeamShiftCardsProps) {
  
  // Definisikan shift untuk iterasi
  const shifts = [
    { name: 'Pagi', team: nurseTeams?.Pagi, icon: Sun },
    { name: 'Siang', team: nurseTeams?.Siang, icon: Sunset },
    { name: 'Malam', team: nurseTeams?.Malam, icon: Moon },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg">
      
      {/* Card 1: Penanggung Jawab OK */}
      <Card> {/* Hapus lg:col-span-1 */}
        <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-400 border-b border-gray-200 dark:border-gray-700 pb-2 mb-3 flex items-center">
          <CheckCircle className="mr-2" size={20} />
          Penanggung Jawab OK
        </h3>
        {responsibleStaff ? (
          <div className="flex items-center text-sm">
            <User size={14} className="mr-2 text-gray-400"/>
            <span className="font-semibold text-gray-800 dark:text-gray-700">{responsibleStaff.name}</span>
          </div>
        ) : (
          <p className="text-sm italic text-gray-500">Belum diatur</p>
        )}
      </Card>

      {/* Card 2: Dokter Anestesi */}
      <Card> {/* Hapus lg:col-span-1 */}
        <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-2 mb-3 flex items-center">
          <Users className="mr-2" size={20} />
          Dokter Anestesi
        </h3>
        <StaffList staff={anesthesiaTeam} />
      </Card>
      
      {/* Card 3: Tim Perawat (Menggunakan sub-section) */}
      <Card> {/* Hapus lg:col-span-1 */}
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
                  "p-3 rounded-md border transition-all",
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