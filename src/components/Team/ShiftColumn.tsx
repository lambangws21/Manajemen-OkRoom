'use client';

import { StaffMember } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
// DITAMBAHKAN: Impor ikon baru untuk peran perawat
import { UserPlus, Scissors, Syringe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShiftColumnProps {
  shiftName: 'Pagi' | 'Siang' | 'Malam';
  nursesOnDuty: StaffMember[];
  onManageTeam: () => void;
  isActive: boolean;
}

export default function ShiftColumn({ shiftName, nursesOnDuty, onManageTeam, isActive }: ShiftColumnProps) {
  return (
    <Card className={cn(
      "flex flex-col transition-all",
      isActive ? 'border-2 border-green-500 shadow-lg' : 'border'
    )}>
 {/* Header Kolom Responsif */}
<div className="flex justify-between items-center border-b dark:border-gray-700 pb-3 mb-4 gap-2">
  <div className="flex items-center">
    {/* Judul akan sedikit lebih kecil di layar mobile */}
    <h2 className="text-md sm:text-lg font-bold text-gray-800 dark:text-gray-700">
      Dinas {shiftName}
    </h2>
    {isActive && (
      // Badge "AKTIF" disembunyikan di layar sangat kecil (xs) dan muncul di sm ke atas
      <span className="hidden sm:inline ml-2 text-xs font-semibold text-green-800 bg-green-200 px-2 py-1 rounded-full animate-pulse">
        AKTIF
      </span>
    )}
  </div>
  
  {/* Tombol Aksi yang Responsif */}
  <Button variant="secondary" onClick={onManageTeam} className="p-2 sm:px-4 sm:py-3">
    <UserPlus size={16} className='sm:hidden inline'/>
    {/* Teks "Atur Tim" hanya muncul di layar 'sm' (small) ke atas */}
    <span className="hidden sm:inline ml-2 text-sm">Atur Tim</span>
  </Button>
</div>

      {/* Daftar Perawat */}
      <div className={cn("flex-grow space-y-2 min-h-[200px] overflow-y-auto pr-2", !isActive && "opacity-60")}>
        {nursesOnDuty.length > 0 ? (
          nursesOnDuty.map(nurse => (
            <div 
              key={nurse.id} 
              className={cn(
                'p-2 rounded',
                nurse.role === 'Perawat Bedah' ? 'bg-green-500 dark:bg-green-500/70' : 'bg-yellow-500 dark:bg-yellow-500/90'
              )}
            >
              <div className="flex items-center">
                {/* DIUBAHKAN: Ikon hanya muncul di mobile (di bawah breakpoint 'sm') */}
                <div className="sm:hidden mr-2">
                  {nurse.role === 'Perawat Bedah' ? 
                    <Scissors size={14} className="text-gray-800" /> : 
                    <Syringe size={14} className="text-gray-800" />
                  }
                </div>
                <p className="font-medium text-sm text-gray-800 dark:text-gray-900">{nurse.name}</p>
              </div>
              {/* Teks peran hanya muncul di tablet/desktop ('sm' ke atas) */}
              <p className="text-xs text-gray-900 dark:text-gray-900 hidden sm:block pl-1">
                {nurse.role}
              </p>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-400">
            <p>Tim belum diatur.</p>
          </div>
        )}
      </div>
    </Card>
  );
}